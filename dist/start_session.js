import * as fs from 'fs/promises';
import * as path from 'path';
export async function startSession(worldInitialPath, sessionConfigPath) {
    // Read environment variable at runtime
    const AUTONOMOUS_SESSIONS_DIR = process.env.AUTONOMOUS_SESSIONS_DIR || './autonomous_sessions';
    // 1. Input validation
    await validateInputFiles(worldInitialPath, sessionConfigPath);
    const worldData = JSON.parse(await fs.readFile(worldInitialPath, 'utf-8'));
    const configData = JSON.parse(await fs.readFile(sessionConfigPath, 'utf-8'));
    validateWorldState(worldData);
    validateSessionConfig(configData);
    // 2. Create session directory
    const sessionId = generateSessionId();
    const sessionDir = path.join(AUTONOMOUS_SESSIONS_DIR, 'sessions', sessionId);
    const workspaceDir = path.join(AUTONOMOUS_SESSIONS_DIR, 'ai_workspace');
    await fs.mkdir(sessionDir, { recursive: true });
    // 3. Initialize files
    await fs.writeFile(path.join(sessionDir, 'world_initial.json'), JSON.stringify(worldData, null, 2));
    await fs.writeFile(path.join(sessionDir, 'world_current.json'), JSON.stringify(worldData, null, 2));
    await fs.writeFile(path.join(sessionDir, 'session_config.json'), JSON.stringify(configData, null, 2));
    const metadata = {
        ...configData,
        sessionId,
        createdAt: new Date().toISOString(),
        status: 'running'
    };
    await fs.writeFile(path.join(sessionDir, 'metadata.json'), JSON.stringify(metadata, null, 2));
    await fs.writeFile(path.join(sessionDir, 'playlog.jsonl'), '');
    // 4. Initialize AI workspace
    await fs.mkdir(path.join(workspaceDir, 'decision_requests'), { recursive: true });
    await fs.mkdir(path.join(workspaceDir, 'decision_responses'), { recursive: true });
    await fs.mkdir(path.join(workspaceDir, 'world_snapshots'), { recursive: true });
    // 5. Generate first turn decision requests
    const firstTurnRequests = await generateFirstTurnRequests(sessionId, worldData, workspaceDir);
    return {
        sessionId,
        status: 'ready',
        firstTurnRequests,
        workspaceDir: `${AUTONOMOUS_SESSIONS_DIR}/ai_workspace/`
    };
}
async function validateInputFiles(worldPath, configPath) {
    try {
        await fs.access(worldPath);
    }
    catch {
        throw new Error('world_initial.json not found');
    }
    try {
        await fs.access(configPath);
    }
    catch {
        throw new Error('session_config.json not found');
    }
    // Validate JSON syntax
    try {
        JSON.parse(await fs.readFile(worldPath, 'utf-8'));
    }
    catch {
        throw new Error('Invalid JSON in world_initial.json');
    }
    try {
        JSON.parse(await fs.readFile(configPath, 'utf-8'));
    }
    catch {
        throw new Error('Invalid JSON in session_config.json');
    }
}
function validateWorldState(world) {
    const requiredFields = ['parties', 'regions', 'market', 'relationships', 'turn', 'worldAge', 'narrativeContext'];
    for (const field of requiredFields) {
        if (!(field in world)) {
            throw new Error(`Missing required field: ${field}`);
        }
    }
    if (!world.market.currentPrices || !world.market.priceHistory || !world.market.completedTrades) {
        throw new Error('Invalid market structure');
    }
}
function validateSessionConfig(config) {
    const requiredFields = ['sessionName', 'maxTurns', 'stopConditions'];
    for (const field of requiredFields) {
        if (!(field in config)) {
            throw new Error(`Missing required field in config: ${field}`);
        }
    }
}
function generateSessionId() {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = now.toISOString().slice(11, 19).replace(/:/g, '');
    return `session_${dateStr}_${timeStr}`;
}
async function generateFirstTurnRequests(sessionId, worldData, workspaceDir) {
    const requestsCreated = [];
    const timestamp = new Date().toISOString();
    // Generate GM request
    const gmRequestId = `request_GM_${Date.now()}`;
    const gmRequest = {
        requestId: gmRequestId,
        timestamp,
        sessionId,
        worldStateFile: `../sessions/${sessionId}/world_current.json`,
        framework: {
            role: 'GM'
        },
        contextData: {
            marketData: {
                currentPrices: worldData.market.currentPrices,
                totalVolume: Object.values(worldData.market.currentPrices).reduce((sum, price) => sum + price, 0),
                priceHistory: worldData.market.priceHistory
            },
            worldSummary: {
                turn: worldData.turn,
                totalParties: Object.keys(worldData.parties).length,
                activeRegions: Object.keys(worldData.regions).length
            },
            availableActions: ['price_update', 'environmental_change', 'market_event'],
            recentHistory: []
        },
        instructions: 'worldStateFileを読み込んで世界状態を分析し、適切なフレームワークを適用してGMとしての最適な行動を決定してください'
    };
    const gmFileName = `${gmRequestId}.json`;
    await fs.writeFile(path.join(workspaceDir, 'decision_requests', gmFileName), JSON.stringify(gmRequest, null, 2));
    requestsCreated.push(gmFileName);
    // Generate party requests
    for (const [partyId, party] of Object.entries(worldData.parties)) {
        const partyRequestId = `request_${partyId}_${Date.now() + Math.floor(Math.random() * 1000)}`;
        const visibleRegions = getVisibleRegions(party, worldData.regions);
        const availableActions = getAvailableActions(party, worldData.regions);
        const partyRequest = {
            requestId: partyRequestId,
            timestamp,
            sessionId,
            worldStateFile: `../sessions/${sessionId}/world_current.json`,
            framework: {
                role: 'Player',
                actorId: partyId
            },
            contextData: {
                partyState: party,
                visibleRegions,
                marketData: {
                    currentPrices: worldData.market.currentPrices,
                    recentTrades: worldData.market.completedTrades.slice(-5)
                },
                availableActions,
                recentHistory: []
            },
            instructions: 'worldStateFileを読み込んで世界状態を分析し、適切なフレームワークを適用してパーティーとしての最適な行動を決定してください'
        };
        const partyFileName = `${partyRequestId}.json`;
        await fs.writeFile(path.join(workspaceDir, 'decision_requests', partyFileName), JSON.stringify(partyRequest, null, 2));
        requestsCreated.push(partyFileName);
    }
    return requestsCreated;
}
function getVisibleRegions(party, regions) {
    const currentRegion = regions[party.location];
    if (!currentRegion)
        return [];
    const visible = [
        {
            id: currentRegion.id,
            name: currentRegion.name,
            type: currentRegion.type,
            isAccessible: true,
            resources: currentRegion.resources || [],
            distance: 0
        }
    ];
    // Add neighboring regions
    for (const neighborId of currentRegion.neighbors || []) {
        const neighbor = regions[neighborId];
        if (neighbor) {
            visible.push({
                id: neighbor.id,
                name: neighbor.name,
                type: neighbor.type,
                isAccessible: true,
                resources: neighbor.resources || [],
                distance: 1
            });
        }
    }
    return visible;
}
function getAvailableActions(party, regions) {
    const baseActions = ['explore', 'trade', 'cooperate'];
    const currentRegion = regions[party.location];
    if (currentRegion?.neighbors?.length > 0) {
        baseActions.push('move');
    }
    if (currentRegion?.specialEffects?.includes('market_access')) {
        baseActions.push('market_trade');
    }
    return baseActions;
}
// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
    const args = process.argv.slice(2);
    if (args.length < 2) {
        console.error('❌ Error: Insufficient arguments');
        console.error('\nUsage:');
        console.error('  npx tsx src/start_session.ts <world_initial.json> <session_config.json>');
        console.error('\nExample:');
        console.error('  npx tsx src/start_session.ts autonomous_sessions/inputs/world_initial.json autonomous_sessions/inputs/session_config.json');
        console.error('\nOptional environment variable:');
        console.error('  AUTONOMOUS_SESSIONS_DIR=./custom_sessions npx tsx src/start_session.ts ...');
        console.error('  (defaults to ./autonomous_sessions if not specified)');
        process.exit(1);
    }
    const worldInitialPath = args[0];
    const sessionConfigPath = args[1];
    console.log('🚀 Starting new TRPG session...');
    console.log(`📁 World file: ${worldInitialPath}`);
    console.log(`⚙️  Config file: ${sessionConfigPath}`);
    console.log(`📂 Sessions directory: ${process.env.AUTONOMOUS_SESSIONS_DIR || './autonomous_sessions'}`);
    startSession(worldInitialPath, sessionConfigPath)
        .then(result => {
        console.log('\n✅ Session successfully started!');
        console.log('\n📊 Session Details:');
        console.log(`  • Session ID: ${result.sessionId}`);
        console.log(`  • Status: ${result.status}`);
        console.log(`  • Workspace: ${result.workspaceDir}`);
        console.log(`  • First turn requests: ${result.firstTurnRequests.length} files created`);
        console.log('\n🎯 Next Steps:');
        console.log('1. Create AI decision responses in workspace/decision_responses/');
        console.log('2. Process responses:');
        console.log(`   npx tsx src/process_ai_responses.ts ${result.sessionId}`);
        console.log('3. Create narrative:');
        console.log('   # Create turn_playlog.json in ai_workspace/');
        console.log(`   npx tsx src/append_playlog.ts ${result.sessionId} turn_playlog.json`);
        console.log('4. Generate next turn:');
        console.log(`   npx tsx src/generate_next_turn.ts ${result.sessionId} 2`);
        console.log('\n📋 Generated Request Files:');
        result.firstTurnRequests.forEach((file, index) => {
            console.log(`  ${index + 1}. ${file}`);
        });
        console.log(`\n💾 Result saved to: ${result.workspaceDir}/results/session_result.json`);
    })
        .catch(error => {
        console.error('\n❌ Failed to start session:');
        console.error(`Error: ${error.message}`);
        if (error.message.includes('ENOENT')) {
            console.error('\n💡 Common causes:');
            console.error('  • File not found - check file paths');
            console.error('  • Directory not exists - run mkdir -p autonomous_sessions/inputs');
            console.error('  • Invalid JSON format - validate input files');
        }
        console.error('\n🔧 Troubleshooting:');
        console.error('  1. Verify file paths are correct');
        console.error('  2. Check JSON syntax in input files');
        console.error('  3. Ensure directory structure exists');
        console.error('  4. Review input file format in AI_AGENT_FILE_WORKFLOW.md');
        if (error.stack) {
            console.error('\n📝 Stack trace:');
            console.error(error.stack);
        }
        process.exit(1);
    });
}
//# sourceMappingURL=start_session.js.map