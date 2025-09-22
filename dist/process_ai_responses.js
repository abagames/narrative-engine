import * as fs from 'fs/promises';
import * as path from 'path';
import { validateDecisionResponse, validateJsonSafety } from './json_schemas.js';
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
        nextStatus: 'turn_completed'
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
        // 2. Process each response file independently
        for (const filename of jsonFiles) {
            let partyId;
            try {
                result.processedDecisions++;
                const responseData = await readAndValidateResponse(path.join(responsesDir, filename));
                partyId = responseData.proposal.participants[0]; // Extract partyId from participants
                // 4. Execute action with isolation
                const actionResult = await executeAction(responseData, worldState);
                if (actionResult.success) {
                    result.actionsExecuted++;
                    hasSuccessfulActions = true;
                    // Note: Playlog generation is handled by append_playlog.ts after narrative creation
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
        // 5. Update world state only if there were successful actions
        if (hasSuccessfulActions) {
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
        await fs.writeFile('./process_result.json', JSON.stringify(result, null, 2));
        console.log('\n📁 Result saved to: ./process_result.json');
        // Summary output
        console.log('\n📊 Summary:');
        console.log(`- Processed decisions: ${result.processedDecisions}`);
        console.log(`- Successful actions: ${result.actionsExecuted}`);
        console.log(`- Errors: ${result.errors.length}`);
        console.log(`- Next status: ${result.nextStatus}`);
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
async function executeAction(response, worldState) {
    try {
        // Apply effects to world state
        for (const effect of response.proposal.effects) {
            const result = applyEffect(effect, worldState);
            if (!result.success) {
                return {
                    success: false,
                    error: result.error,
                    details: result.details
                };
            }
        }
        return { success: true };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown execution error'
        };
    }
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
function applyEffect(effect, worldState) {
    const pathParts = effect.target.split('/').filter(p => p);
    if (pathParts.length < 2) {
        return {
            success: false,
            error: 'Invalid target path',
            details: {
                providedPath: effect.target,
                parsedParts: pathParts,
                expectedFormat: 'path/to/property (minimum 2 levels)',
                examples: ['parties/party_id/morale', 'market/currentPrices/wood', 'regions/region_id/occupantParties']
            }
        };
    }
    try {
        // Navigate to the target object
        let current = worldState;
        for (let i = 0; i < pathParts.length - 1; i++) {
            if (!(pathParts[i] in current)) {
                // Special case for party not found
                if (i === 1 && pathParts[0] === 'parties') {
                    return {
                        success: false,
                        error: `Party not found: ${pathParts[1]}`,
                        details: {
                            missingParty: pathParts[1],
                            availableParties: Object.keys(worldState.parties || {}),
                            suggestedFix: 'Check party ID spelling or ensure party exists in world state'
                        }
                    };
                }
                return {
                    success: false,
                    error: `Path not found: ${pathParts.slice(0, i + 1).join('/')}`,
                    details: {
                        targetPath: effect.target,
                        failedAt: pathParts.slice(0, i + 1).join('/'),
                        availableKeys: current && typeof current === 'object' ? Object.keys(current) : 'Not an object'
                    }
                };
            }
            current = current[pathParts[i]];
        }
        const finalKey = pathParts[pathParts.length - 1];
        // Special validation for currency operations
        if (finalKey === 'currency' && effect.operation === 'add' && effect.value < 0) {
            const currentValue = current[finalKey] || 0;
            if (currentValue + effect.value < 0) {
                return {
                    success: false,
                    error: 'Invalid action: insufficient currency',
                    details: {
                        operation: 'currency_payment',
                        required: Math.abs(effect.value),
                        available: currentValue,
                        shortfall: Math.abs(effect.value) - currentValue,
                        suggestedFix: 'Reduce payment amount or ensure sufficient currency before transaction'
                    }
                };
            }
        }
        // Apply the effect
        if (effect.operation === 'set') {
            current[finalKey] = effect.value;
        }
        else if (effect.operation === 'add') {
            if (typeof current[finalKey] === 'number') {
                current[finalKey] += effect.value;
            }
            else if (typeof current[finalKey] === 'object' && current[finalKey] !== null) {
                // For object addition (like materials)
                if (typeof effect.value === 'object') {
                    current[finalKey] = { ...current[finalKey], ...effect.value };
                }
                else {
                    current[finalKey] = effect.value;
                }
            }
            else {
                current[finalKey] = effect.value;
            }
        }
        return { success: true };
    }
    catch (error) {
        return {
            success: false,
            error: `Failed to apply effect: ${error instanceof Error ? error.message : 'Unknown error'}`,
            details: {
                operation: effect.operation,
                target: effect.target,
                value: effect.value,
                errorType: error instanceof Error ? error.constructor.name : 'Unknown',
                stack: error instanceof Error ? error.stack : undefined
            }
        };
    }
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
        // Check stop conditions
        if (metadata.stopConditions) {
            for (const [condition, threshold] of Object.entries(metadata.stopConditions)) {
                if (condition === 'totalPartyWealth') {
                    const totalWealth = Object.values(worldState.parties).reduce((sum, party) => {
                        return sum + (party.resources?.currency || 0);
                    }, 0);
                    if (totalWealth >= threshold) {
                        return true;
                    }
                }
                // Add other stop conditions as needed
            }
        }
        return false;
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=process_ai_responses.js.map