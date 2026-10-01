import * as fs from 'fs/promises';
import * as path from 'path';
import { ensureSeed, normalizeWorld } from './world_rules.js';
import { writeDecisionRequests } from './turn_context.js';

interface WorldState {
  parties: Record<string, any>;
  regions: Record<string, any>;
  market?: {
    currentPrices: Record<string, number>;
    priceHistory: any[];
    completedTrades: any[];
  };
  quests?: Record<string, any>;
  clocks?: Record<string, any>;
  npcs?: Record<string, any>;
  guild?: Record<string, any>;
  relationships: Record<string, any>;
  turn: number;
  worldAge: number;
  narrativeContext: Record<string, any>;
}

interface SessionConfig {
  sessionName: string;
  maxTurns: number;
  stopConditions: Record<string, any>;
  seed?: number;
}

interface SessionResult {
  sessionId: string;
  status: string;
  firstTurnRequests: string[];
  workspaceDir: string;
}

export async function startSession(worldInitialPath: string, sessionConfigPath: string): Promise<SessionResult> {
  // Read environment variable at runtime
  const AUTONOMOUS_SESSIONS_DIR = process.env.AUTONOMOUS_SESSIONS_DIR || './autonomous_sessions';

  // 1. Input validation
  await validateInputFiles(worldInitialPath, sessionConfigPath);

  const worldData: WorldState = JSON.parse(await fs.readFile(worldInitialPath, 'utf-8'));
  const configData: SessionConfig = JSON.parse(await fs.readFile(sessionConfigPath, 'utf-8'));

  validateWorldState(worldData);
  validateSessionConfig(configData);
  prepareWorld(worldData, configData);

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
  const firstTurnRequests = await writeDecisionRequests(
    sessionId,
    worldData,
    path.join(workspaceDir, 'decision_requests'),
    []
  );

  return {
    sessionId,
    status: 'ready',
    firstTurnRequests,
    workspaceDir: `${AUTONOMOUS_SESSIONS_DIR}/ai_workspace/`
  };
}

async function validateInputFiles(worldPath: string, configPath: string): Promise<void> {
  try {
    await fs.access(worldPath);
  } catch {
    throw new Error('world_initial.json not found');
  }

  try {
    await fs.access(configPath);
  } catch {
    throw new Error('session_config.json not found');
  }

  // Validate JSON syntax
  try {
    JSON.parse(await fs.readFile(worldPath, 'utf-8'));
  } catch {
    throw new Error('Invalid JSON in world_initial.json');
  }

  try {
    JSON.parse(await fs.readFile(configPath, 'utf-8'));
  } catch {
    throw new Error('Invalid JSON in session_config.json');
  }
}

function validateWorldState(world: any): void {
  const requiredFields = ['parties', 'regions', 'relationships', 'turn', 'worldAge', 'narrativeContext'];

  for (const field of requiredFields) {
    if (!(field in world)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  // The market is optional; when present it must be well-formed
  if (world.market !== undefined) {
    if (!world.market.currentPrices || !world.market.priceHistory || !world.market.completedTrades) {
      throw new Error('Invalid market structure');
    }
  }

  validateQuestSetup(world);
}

function validateQuestSetup(world: any): void {
  const quests: Record<string, any> = world.quests || {};
  for (const [questId, quest] of Object.entries<any>(quests)) {
    if (quest.location && !world.regions?.[quest.location]) {
      throw new Error(`Quest ${questId} refers to unknown region: ${quest.location}`);
    }
    if (quest.client && world.npcs && !world.npcs[quest.client]) {
      throw new Error(`Quest ${questId} refers to unknown client: ${quest.client}`);
    }
    for (const other of quest.conflictsWith || []) {
      if (!quests[other]) {
        throw new Error(`Quest ${questId} conflicts with unknown quest: ${other}`);
      }
    }
    for (const partyId of quest.acceptedBy || []) {
      if (!world.parties?.[partyId]) {
        throw new Error(`Quest ${questId} accepted by unknown party: ${partyId}`);
      }
    }
    if (quest.advancesClock?.clockId && !world.clocks?.[quest.advancesClock.clockId]) {
      throw new Error(`Quest ${questId} advances unknown clock: ${quest.advancesClock.clockId}`);
    }
  }
}

function prepareWorld(world: any, config: SessionConfig): void {
  if (typeof config.seed === 'number') {
    world.rng = { seed: config.seed };
  }
  ensureSeed(world);
  normalizeWorld(world);
  // Upkeep for the starting turn is already reflected in the authored world
  world.upkeepTurn = Number(world.turn) || 0;
}

function validateSessionConfig(config: any): void {
  const requiredFields = ['sessionName', 'maxTurns', 'stopConditions'];

  for (const field of requiredFields) {
    if (!(field in config)) {
      throw new Error(`Missing required field in config: ${field}`);
    }
  }
}

function generateSessionId(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const timeStr = now.toISOString().slice(11, 19).replace(/:/g, '');
  return `session_${dateStr}_${timeStr}`;
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