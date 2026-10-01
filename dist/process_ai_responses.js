import * as fs from 'fs/promises';
import * as path from 'path';
import { validateDecisionResponse, validateJsonSafety } from './json_schemas.js';
import { executeResponse, identifyActor, resolveQuests, checkStopConditions } from './world_rules.js';
import { isDraftActive, validateDraftResponse, applyDraftResponse } from './draft.js';
export async function processAiResponses(sessionId) {
    const AUTONOMOUS_SESSIONS_DIR = process.env.AUTONOMOUS_SESSIONS_DIR || './autonomous_sessions';
    const sessionDir = path.join(AUTONOMOUS_SESSIONS_DIR, 'sessions', sessionId);
    const workspaceDir = path.join(AUTONOMOUS_SESSIONS_DIR, 'ai_workspace');
    const responsesDir = path.join(workspaceDir, 'decision_responses');
    const requestsDir = path.join(workspaceDir, 'decision_requests');
    const result = {
        processedDecisions: 0,
        actionsExecuted: 0,
        errors: [],
        failedDecisions: [],
        partiallySuccessful: false,
        criticalErrorCount: 0,
        nextStatus: 'turn_completed',
        checks: [],
        engineEvents: [],
        alreadyProcessed: []
    };
    try {
        // 1. Read decision response files
        const responseFiles = await fs.readdir(responsesDir).catch(() => []);
        const jsonFiles = responseFiles.filter(f => f.endsWith('.json'));
        if (jsonFiles.length === 0) {
            return result;
        }
        // Load current world state
        const worldStatePath = path.join(sessionDir, 'world_current.json');
        let worldState;
        try {
            worldState = JSON.parse(await fs.readFile(worldStatePath, 'utf-8'));
        }
        catch {
            throw new Error('world_current.json not found or invalid');
        }
        const processedFiles = [];
        let hasSuccessfulActions = false;
        const draftAtStart = isDraftActive(worldState);
        // 2. Process each response file independently
        for (const filename of jsonFiles) {
            let partyId;
            try {
                result.processedDecisions++;
                const responsePath = path.join(responsesDir, filename);
                const responseData = await readAndValidateResponse(responsePath);
                partyId = responseData.proposal.participants[0]; // Extract partyId from participants
                // Responses applied in an earlier run (e.g. before a retry of failed ones) are not applied twice
                if (responseData.engineResolution?.processed) {
                    result.processedDecisions--;
                    result.alreadyProcessed.push(responseData.requestId);
                    continue;
                }
                // 4. Execute action with isolation (all-or-nothing, dice rolled by the engine)
                const draftError = checkDraftPreconditions(responseData, worldState);
                const actionResult = draftError
                    ? { success: false, error: draftError.error, details: draftError.details, checks: [], actor: undefined }
                    : executeResponse(responseData, worldState);
                if (actionResult.success && isDraftActive(worldState)) {
                    const llm = responseData.meta?.llmDecision || {};
                    result.engineEvents.push(...applyDraftResponse(worldState, actionResult.actor.partyId, responseData.proposal.draft, {
                        reasoning: llm.selectedAction?.reasoning,
                        voices: llm.character_voices
                    }));
                }
                if (actionResult.success) {
                    result.actionsExecuted++;
                    hasSuccessfulActions = true;
                    result.checks.push(...(actionResult.checks || []));
                    // Record the engine's adjudication so append_playlog.ts can log it
                    responseData.engineResolution = {
                        processed: true,
                        turn: Number(worldState.turn) || 0,
                        role: actionResult.actor.role,
                        checks: actionResult.checks || []
                    };
                    await fs.writeFile(responsePath, JSON.stringify(responseData, null, 2));
                    processedFiles.push(filename);
                }
                else {
                    // Classify error severity
                    const severity = classifyErrorSeverity(actionResult.error || 'Unknown error');
                    result.errors.push({
                        requestId: responseData.requestId,
                        error: actionResult.error,
                        details: actionResult.details,
                        partyId,
                        severity
                    });
                    result.failedDecisions.push(responseData.requestId);
                    if (severity === 'critical') {
                        result.criticalErrorCount++;
                    }
                }
            }
            catch (error) {
                const requestId = filename.replace('.json', '');
                const severity = classifyErrorSeverity(error instanceof Error ? error.message : 'Unknown error');
                result.errors.push({
                    requestId,
                    error: error instanceof Error ? error.message : 'Unknown error',
                    details: error instanceof Error ? error.stack : undefined,
                    partyId,
                    severity
                });
                result.failedDecisions.push(requestId);
                if (severity === 'critical') {
                    result.criticalErrorCount++;
                }
            }
        }
        // 5. Resolve quests and clocks once all of this turn's actions are in, then save
        if (hasSuccessfulActions) {
            if (!draftAtStart) {
                result.engineEvents.push(...resolveQuests(worldState));
            }
            await fs.writeFile(worldStatePath, JSON.stringify(worldState, null, 2));
        }
        // 6. Handle failed decision files
        if (result.failedDecisions.length > 0) {
            const failedDir = path.join(workspaceDir, 'decision_responses', 'failed');
            await fs.mkdir(failedDir, { recursive: true });
            for (const failedRequestId of result.failedDecisions) {
                const filename = `${failedRequestId}.json`;
                const sourcePath = path.join(responsesDir, filename);
                const targetPath = path.join(failedDir, filename);
                try {
                    await fs.rename(sourcePath, targetPath);
                }
                catch (error) {
                    // File may not exist or already moved, continue
                }
            }
        }
        // 7. Cleanup successful files - DISABLED: Files needed for append_playlog.ts
        // Files will be cleaned up after append_playlog.ts execution
        // 7. Determine next status with improved logic
        result.partiallySuccessful = hasSuccessfulActions && result.errors.length > 0;
        if (result.criticalErrorCount > 0) {
            result.nextStatus = 'error_abort';
        }
        else if (draftAtStart && result.errors.length === 0) {
            result.nextStatus = isDraftActive(worldState) ? 'draft_in_progress' : 'draft_completed';
        }
        else if (result.errors.length > 0 && !hasSuccessfulActions) {
            result.nextStatus = 'error';
        }
        else if (result.partiallySuccessful) {
            result.nextStatus = 'partial_success';
        }
        else if (await checkSessionComplete(sessionId)) {
            result.nextStatus = 'completed';
        }
        else {
            result.nextStatus = 'turn_completed';
        }
    }
    catch (error) {
        result.errors.push({
            requestId: 'system',
            error: error instanceof Error ? error.message : 'System error',
            severity: 'critical'
        });
        result.criticalErrorCount++;
        result.nextStatus = 'error_abort';
    }
    return result;
}
// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
    const args = process.argv.slice(2);
    if (args.length < 1) {
        console.error('Usage: tsx process_ai_responses.ts <sessionId>');
        process.exit(1);
    }
    const sessionId = args[0];
    console.log(`Processing AI responses for session ${sessionId}...`);
    processAiResponses(sessionId)
        .then(async (result) => {
        console.log('\n✅ AI Response Processing Result:');
        console.log(JSON.stringify(result, null, 2));
        // Write detailed result to file
        const resultsDir = path.join(process.env.AUTONOMOUS_SESSIONS_DIR || './autonomous_sessions', 'ai_workspace', 'results');
        await fs.mkdir(resultsDir, { recursive: true });
        const resultPath = path.join(resultsDir, 'process_result.json');
        await fs.writeFile(resultPath, JSON.stringify(result, null, 2));
        console.log(`\n📁 Result saved to: ${resultPath}`);
        // Summary output
        console.log('\n📊 Summary:');
        console.log(`- Processed decisions: ${result.processedDecisions}`);
        console.log(`- Successful actions: ${result.actionsExecuted}`);
        console.log(`- Errors: ${result.errors.length}`);
        console.log(`- Next status: ${result.nextStatus}`);
        if (result.checks.length > 0) {
            console.log('\n🎲 Checks:');
            for (const check of result.checks) {
                const opposed = check.opposed ? ` vs ${check.opposed.party} ${check.opposed.total}` : '';
                console.log(`  - ${check.actor} ${check.id}: [${check.rolls.join('+')}]${check.modifier >= 0 ? '+' : ''}${check.modifier} = ${check.total}${opposed} → ${check.outcome}`);
            }
        }
        if (result.engineEvents.length > 0) {
            console.log('\n📜 Engine events:');
            for (const event of result.engineEvents) {
                console.log(`  - [${event.kind}] ${event.summary}`);
            }
        }
        if (result.errors.length > 0) {
            console.log('\n❌ Errors encountered:');
            result.errors.forEach((error, index) => {
                console.log(`  ${index + 1}. ${error.requestId}: ${error.error}`);
                if (error.details) {
                    console.log(`     Details: ${JSON.stringify(error.details)}`);
                }
            });
        }
        if (result.nextStatus === 'error' && result.failedDecisions.length > 0) {
            console.log('\n🔄 Manual retry required for:');
            result.failedDecisions.forEach(requestId => {
                console.log(`  - ${requestId}`);
            });
        }
    })
        .catch(error => {
        console.error('\n❌ Error processing AI responses:', error.message);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    });
}
/**
 * During a draft only draft responses from the parties whose turn it is are
 * accepted, and no checks are rolled. Outside a draft, draft responses are refused.
 */
function checkDraftPreconditions(response, worldState) {
    const draftInput = response.proposal.draft;
    if (!isDraftActive(worldState)) {
        return draftInput ? { error: 'No draft is in progress; remove proposal.draft' } : null;
    }
    const actor = identifyActor(response, worldState);
    if ('error' in actor)
        return actor;
    if (actor.role !== 'Player')
        return { error: 'The GM does not act during the draft' };
    if ((response.proposal.checks || []).length > 0)
        return { error: 'No checks are rolled during the draft' };
    return validateDraftResponse(worldState, actor.partyId, draftInput);
}
async function readAndValidateResponse(filePath) {
    let content;
    let responseData;
    try {
        content = await fs.readFile(filePath, 'utf-8');
    }
    catch (error) {
        throw new Error(`Failed to read response file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    // JSON safety validation
    const safetyCheck = validateJsonSafety(content);
    if (!safetyCheck.valid) {
        throw new Error(`JSON safety validation failed: ${safetyCheck.errors.join(', ')}`);
    }
    try {
        responseData = JSON.parse(content);
    }
    catch (error) {
        throw new Error(`Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    // Schema validation
    const validation = validateDecisionResponse(responseData);
    if (!validation.valid) {
        throw new Error(`Schema validation failed:\n${validation.errors.map(e => `  - ${e}`).join('\n')}`);
    }
    return responseData;
}
/**
 * Classifies error severity for improved error handling
 */
function classifyErrorSeverity(errorMessage) {
    const criticalKeywords = [
        'world_current.json not found',
        'system error',
        'fatal',
        'corruption',
        'invalid world state'
    ];
    const warningKeywords = [
        'validation warning',
        'minor inconsistency',
        'optional field missing'
    ];
    const lowerError = errorMessage.toLowerCase();
    if (criticalKeywords.some(keyword => lowerError.includes(keyword.toLowerCase()))) {
        return 'critical';
    }
    if (warningKeywords.some(keyword => lowerError.includes(keyword.toLowerCase()))) {
        return 'warning';
    }
    return 'error';
}
async function checkSessionComplete(sessionId) {
    try {
        const AUTONOMOUS_SESSIONS_DIR = process.env.AUTONOMOUS_SESSIONS_DIR || './autonomous_sessions';
        const sessionDir = path.join(AUTONOMOUS_SESSIONS_DIR, 'sessions', sessionId);
        const metadataPath = path.join(sessionDir, 'metadata.json');
        const worldStatePath = path.join(sessionDir, 'world_current.json');
        const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf-8'));
        const worldState = JSON.parse(await fs.readFile(worldStatePath, 'utf-8'));
        // Check max turns
        if (worldState.turn >= metadata.maxTurns) {
            return true;
        }
        return checkStopConditions(worldState, metadata.stopConditions).completed;
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=process_ai_responses.js.map