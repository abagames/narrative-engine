import * as fs from 'fs/promises';
import * as path from 'path';
import { checkStopConditions, closeSeason, runUpkeep } from './world_rules.js';
import { readRecentHistory, writeDecisionRequests } from './turn_context.js';
export async function generateNextTurn(sessionId, targetTurn) {
    const AUTONOMOUS_SESSIONS_DIR = process.env.AUTONOMOUS_SESSIONS_DIR || './autonomous_sessions';
    const sessionDir = path.join(AUTONOMOUS_SESSIONS_DIR, 'sessions', sessionId);
    const workspaceDir = path.join(AUTONOMOUS_SESSIONS_DIR, 'ai_workspace');
    try {
        // 0. Verify session directory exists
        try {
            await fs.access(sessionDir);
        }
        catch {
            throw new Error('Session directory not found');
        }
        // 1. Load current world state
        const worldStatePath = path.join(sessionDir, 'world_current.json');
        let worldState;
        try {
            const content = await fs.readFile(worldStatePath, 'utf-8');
            worldState = JSON.parse(content);
        }
        catch (error) {
            if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
                throw new Error('world_current.json not found');
            }
            throw new Error('Invalid JSON in world_current.json');
        }
        // Basic world state validation
        if (!worldState.parties || !worldState.regions || worldState.turn === undefined) {
            throw new Error('Invalid world state');
        }
        const worldTurnNumeric = Number(worldState.turn);
        if (!Number.isFinite(worldTurnNumeric)) {
            throw new Error('Invalid world state: turn must be a number');
        }
        const resolvedTargetTurn = targetTurn ?? worldTurnNumeric + 1;
        if (!Number.isInteger(resolvedTargetTurn) || resolvedTargetTurn < 1) {
            throw new Error('Invalid target turn: must be a positive integer');
        }
        // 2. Load session metadata
        const metadataPath = path.join(sessionDir, 'metadata.json');
        let metadata;
        try {
            metadata = JSON.parse(await fs.readFile(metadataPath, 'utf-8'));
        }
        catch {
            throw new Error('metadata.json not found');
        }
        // 3. Check session completion conditions
        const currentTurn = resolvedTargetTurn - 1;
        // Check max turns
        if (resolvedTargetTurn > metadata.maxTurns) {
            const engineEvents = await closeSeasonIfAny(worldState, worldStatePath);
            return {
                turnGenerated: currentTurn,
                requestsCreated: [],
                status: 'session_complete',
                completionReason: 'maxTurns',
                engineEvents
            };
        }
        // Check stop conditions as of the turn about to start
        const completionCheck = checkStopConditions({ ...worldState, turn: resolvedTargetTurn }, metadata.stopConditions);
        if (completionCheck.completed) {
            const engineEvents = await closeSeasonIfAny(worldState, worldStatePath);
            return {
                turnGenerated: currentTurn,
                requestsCreated: [],
                status: 'session_complete',
                completionReason: completionCheck.reason,
                engineEvents
            };
        }
        // 4. Start-of-turn upkeep: deadlines expire, clocks tick
        const engineEvents = runUpkeep(worldState, resolvedTargetTurn);
        worldState.turn = resolvedTargetTurn;
        await fs.writeFile(worldStatePath, JSON.stringify(worldState, null, 2));
        // 5. Clean up old request files
        await cleanupOldRequestFiles(workspaceDir);
        // 6. Generate new decision request files
        const recentHistory = await readRecentHistory(sessionDir);
        const requestsCreated = await writeDecisionRequests(sessionId, worldState, path.join(workspaceDir, 'decision_requests'), recentHistory);
        return {
            turnGenerated: resolvedTargetTurn,
            requestsCreated,
            status: 'ready_for_next_turn',
            engineEvents
        };
    }
    catch (error) {
        if (error instanceof Error && error.message.includes('not found')) {
            if (error.message.includes('Session directory')) {
                throw new Error('Session directory not found');
            }
            throw error;
        }
        throw new Error(`Failed to generate next turn: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
async function closeSeasonIfAny(worldState, worldStatePath) {
    if (!worldState.guild)
        return [];
    const events = closeSeason(worldState);
    if (events.length > 0) {
        await fs.writeFile(worldStatePath, JSON.stringify(worldState, null, 2));
    }
    return events;
}
async function cleanupOldRequestFiles(workspaceDir) {
    const requestsDir = path.join(workspaceDir, 'decision_requests');
    const responsesDir = path.join(workspaceDir, 'decision_responses');
    let cleanedCount = 0;
    try {
        // Clean request files
        const requestFiles = await fs.readdir(requestsDir).catch(() => []);
        const requestJsonFiles = requestFiles.filter(f => f.endsWith('.json'));
        for (const file of requestJsonFiles) {
            await fs.unlink(path.join(requestsDir, file));
            cleanedCount++;
        }
        // Clean response files
        const responseFiles = await fs.readdir(responsesDir).catch(() => []);
        const responseJsonFiles = responseFiles.filter(f => f.endsWith('.json'));
        for (const file of responseJsonFiles) {
            await fs.unlink(path.join(responsesDir, file));
            cleanedCount++;
        }
        if (cleanedCount > 0) {
            console.log(`🧹 Cleaned up ${cleanedCount} old workspace files`);
        }
    }
    catch (error) {
        console.warn(`⚠️ Warning: Could not clean workspace files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
    const args = process.argv.slice(2);
    if (args.length < 1 || args.length > 2) {
        console.error('Usage: tsx generate_next_turn.ts <sessionId> [targetTurn]');
        console.error('Examples:');
        console.error('  tsx generate_next_turn.ts session_123          # Generate the next turn automatically');
        console.error('  tsx generate_next_turn.ts session_123 8        # Explicitly generate turn 8');
        process.exit(1);
    }
    const sessionId = args[0];
    let targetTurn;
    if (args[1] !== undefined) {
        targetTurn = parseInt(args[1], 10);
        if (isNaN(targetTurn)) {
            console.error('Error: targetTurn must be a number');
            process.exit(1);
        }
        if (targetTurn < 1) {
            console.error('Error: targetTurn must be greater than 0');
            process.exit(1);
        }
        console.log(`Generating turn ${targetTurn} for session ${sessionId}...`);
    }
    else {
        console.log(`Generating next turn for session ${sessionId} (auto target)...`);
    }
    generateNextTurn(sessionId, targetTurn)
        .then(async (result) => {
        console.log('\n✅ Next Turn Generation Result:');
        console.log(JSON.stringify(result, null, 2));
        // Write result to file for inspection
        const resultsDir = path.join(process.env.AUTONOMOUS_SESSIONS_DIR || './autonomous_sessions', 'ai_workspace', 'results');
        await fs.mkdir(resultsDir, { recursive: true });
        const resultPath = path.join(resultsDir, 'next_turn_result.json');
        await fs.writeFile(resultPath, JSON.stringify(result, null, 2));
        console.log(`\n📁 Result saved to: ${resultPath}`);
        for (const event of result.engineEvents || []) {
            console.log(`📜 [${event.kind}] ${event.summary}`);
        }
        if (result.status === 'session_complete') {
            console.log(`\n🏁 Session completed: ${result.completionReason}`);
        }
        else {
            console.log(`\n🎮 Turn ${result.turnGenerated} ready with ${result.requestsCreated.length} decision requests`);
        }
    })
        .catch(error => {
        console.error('\n❌ Error generating next turn:', error.message);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    });
}
//# sourceMappingURL=generate_next_turn.js.map