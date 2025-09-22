import * as fs from 'fs/promises';
import * as path from 'path';

interface NextTurnResult {
  turnGenerated: number;
  requestsCreated: string[];
  status: 'ready_for_next_turn' | 'session_complete';
  completionReason?: string;
}

interface DecisionRequest {
  requestId: string;
  timestamp: string;
  sessionId: string;
  worldStateFile: string;
  framework: {
    role: 'GM' | 'Player';
    actorId?: string;
  };
  contextData: Record<string, any>;
  instructions: string;
}

export async function generateNextTurn(sessionId: string, targetTurn?: number): Promise<NextTurnResult> {
  const AUTONOMOUS_SESSIONS_DIR = process.env.AUTONOMOUS_SESSIONS_DIR || './autonomous_sessions';
  const sessionDir = path.join(AUTONOMOUS_SESSIONS_DIR, 'sessions', sessionId);
  const workspaceDir = path.join(AUTONOMOUS_SESSIONS_DIR, 'ai_workspace');

  try {
    // 0. Verify session directory exists
    try {
      await fs.access(sessionDir);
    } catch {
      throw new Error('Session directory not found');
    }

    // 1. Load current world state
    const worldStatePath = path.join(sessionDir, 'world_current.json');
    let worldState: any;

    try {
      const content = await fs.readFile(worldStatePath, 'utf-8');
      worldState = JSON.parse(content);
    } catch (error) {
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
    let metadata: any;

    try {
      metadata = JSON.parse(await fs.readFile(metadataPath, 'utf-8'));
    } catch {
      throw new Error('metadata.json not found');
    }

    // 3. Check session completion conditions
    const currentTurn = resolvedTargetTurn - 1;

    // Check max turns
    if (resolvedTargetTurn > metadata.maxTurns) {
      return {
        turnGenerated: currentTurn,
        requestsCreated: [],
        status: 'session_complete',
        completionReason: 'maxTurns'
      };
    }

    // Check stop conditions
    const completionCheck = checkStopConditions(worldState, metadata.stopConditions);
    if (completionCheck.completed) {
      return {
        turnGenerated: currentTurn,
        requestsCreated: [],
        status: 'session_complete',
        completionReason: completionCheck.reason
      };
    }

    // 4. Update world state turn
    worldState.turn = resolvedTargetTurn;
    await fs.writeFile(worldStatePath, JSON.stringify(worldState, null, 2));

    // 5. Clean up old request files
    await cleanupOldRequestFiles(workspaceDir);

    // 6. Generate new decision request files
    const requestsCreated = await generateDecisionRequests(sessionId, resolvedTargetTurn, worldState, workspaceDir);

    return {
      turnGenerated: resolvedTargetTurn,
      requestsCreated,
      status: 'ready_for_next_turn'
    };

  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      if (error.message.includes('Session directory')) {
        throw new Error('Session directory not found');
      }
      throw error;
    }
    throw new Error(`Failed to generate next turn: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function checkStopConditions(worldState: any, stopConditions: Record<string, any>): { completed: boolean; reason?: string } {
  if (!stopConditions) {
    return { completed: false };
  }

  for (const [condition, threshold] of Object.entries(stopConditions)) {
    switch (condition) {
      case 'totalPartyWealth':
        const totalWealth = Object.values(worldState.parties || {}).reduce((sum: number, party: any) => {
          return sum + (party.resources?.currency || 0);
        }, 0);
        if (totalWealth >= threshold) {
          return { completed: true, reason: 'totalPartyWealth' };
        }
        break;

      case 'regionDevelopment':
        const developedRegions = Object.values(worldState.regions || {}).filter((region: any) => {
          return Object.keys(region.influence || {}).length >= threshold;
        }).length;
        if (developedRegions >= threshold) {
          return { completed: true, reason: 'regionDevelopment' };
        }
        break;

      // Add more stop conditions as needed
    }
  }

  return { completed: false };
}

async function cleanupOldRequestFiles(workspaceDir: string): Promise<void> {
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
  } catch (error) {
    console.warn(`⚠️ Warning: Could not clean workspace files: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function generateDecisionRequests(
  sessionId: string,
  targetTurn: number,
  worldState: any,
  workspaceDir: string
): Promise<string[]> {
  const requestsCreated: string[] = [];
  const timestamp = new Date().toISOString();
  const requestsDir = path.join(workspaceDir, 'decision_requests');

  // Ensure requests directory exists
  await fs.mkdir(requestsDir, { recursive: true });

  // Load recent history from playlog
  const recentHistory = await getRecentHistory(sessionId);

  // 1. Generate GM request
  const gmRequestId = `request_GM_${Date.now()}`;
  const gmRequest: DecisionRequest = {
    requestId: gmRequestId,
    timestamp,
    sessionId,
    worldStateFile: `../sessions/${sessionId}/world_current.json`,
    framework: {
      role: 'GM'
    },
    contextData: generateGMContextData(worldState, recentHistory),
    instructions: 'worldStateFileを読み込んで世界状態を分析し、適切なフレームワークを適用してGMとしての最適な行動を決定してください'
  };

  const gmFileName = `${gmRequestId}.json`;
  await fs.writeFile(
    path.join(requestsDir, gmFileName),
    JSON.stringify(gmRequest, null, 2)
  );
  requestsCreated.push(gmFileName);

  // 2. Generate party requests
  for (const [partyId, party] of Object.entries(worldState.parties || {})) {
    const partyRequestId = `request_${partyId}_${Date.now() + Math.floor(Math.random() * 1000)}`;

    const partyRequest: DecisionRequest = {
      requestId: partyRequestId,
      timestamp,
      sessionId,
      worldStateFile: `../sessions/${sessionId}/world_current.json`,
      framework: {
        role: 'Player',
        actorId: partyId
      },
      contextData: generatePartyContextData(partyId, party, worldState, recentHistory),
      instructions: 'worldStateFileを読み込んで世界状態を分析し、適切なフレームワークを適用してパーティーとしての最適な行動を決定してください'
    };

    const partyFileName = `${partyRequestId}.json`;
    await fs.writeFile(
      path.join(requestsDir, partyFileName),
      JSON.stringify(partyRequest, null, 2)
    );
    requestsCreated.push(partyFileName);
  }

  return requestsCreated;
}

function generateGMContextData(worldState: any, recentHistory: any[]): Record<string, any> {
  const market = worldState.market || { currentPrices: {}, priceHistory: [], completedTrades: [] };

  // Calculate price volatility
  const priceVolatility: Record<string, number> = {};
  for (const resource of Object.keys(market.currentPrices)) {
    const priceHistory = Array.isArray(market.priceHistory) ? market.priceHistory : [];
    const recentPrices = priceHistory
      .slice(-5)
      .map((entry: any) => entry[resource])
      .filter((price: any) => price !== undefined);

    if (recentPrices.length > 1) {
      const avg = recentPrices.reduce((sum: number, price: number) => sum + price, 0) / recentPrices.length;
      const variance = recentPrices.reduce((sum: number, price: number) => sum + Math.pow(price - avg, 2), 0) / recentPrices.length;
      priceVolatility[resource] = Math.sqrt(variance);
    } else {
      priceVolatility[resource] = 0;
    }
  }

  // Calculate party distribution across regions
  const partyDistribution: Record<string, number> = {};
  for (const party of Object.values(worldState.parties || {})) {
    const location = (party as any).location;
    partyDistribution[location] = (partyDistribution[location] || 0) + 1;
  }

  return {
    marketData: {
      currentPrices: market.currentPrices,
      priceHistory: market.priceHistory,
      totalVolume: Object.values(market.currentPrices).reduce((sum: number, price: any) => sum + (price || 0), 0),
      priceVolatility
    },
    worldSummary: {
      turn: worldState.turn,
      totalParties: Object.keys(worldState.parties || {}).length,
      activeRegions: Object.keys(worldState.regions || {}).length,
      partyDistribution
    },
    availableActions: ['price_update', 'environmental_change', 'market_event', 'weather_change', 'discovery_event'],
    recentHistory: recentHistory.slice(-10) // Last 10 events
  };
}

function generatePartyContextData(
  partyId: string,
  party: any,
  worldState: any,
  recentHistory: any[]
): Record<string, any> {
  const currentRegion = worldState.regions?.[party.location];
  const visibleRegions = getVisibleRegions(party, worldState.regions || {});
  const availableActions = getAvailableActions(party, worldState.regions || {});

  // Filter market data to relevant resources
  const relevantResources = getRelevantResources(party);
  const filteredPrices: Record<string, number> = {};
  for (const resource of relevantResources) {
    if (worldState.market?.currentPrices?.[resource] !== undefined) {
      filteredPrices[resource] = worldState.market.currentPrices[resource];
    }
  }

  // Filter recent history for this party
  const partyRecentHistory = recentHistory.filter(event =>
    event.participants?.includes(partyId) || event.actor === partyId
  );

  return {
    partyState: {
      id: party.id || partyId,
      name: party.name || `Party ${partyId}`,
      location: party.location,
      resources: party.resources || {},
      capabilities: party.capabilities || {},
      morale: party.morale || 5
    },
    visibleRegions,
    marketData: {
      currentPrices: filteredPrices,
      recentTrades: Array.isArray(worldState.market?.completedTrades) ? worldState.market.completedTrades.slice(-5) : []
    },
    availableActions,
    recentHistory: partyRecentHistory.slice(-5)
  };
}

function getVisibleRegions(party: any, regions: Record<string, any>): any[] {
  const currentRegion = regions[party.location];
  if (!currentRegion) return [];

  const visible: any[] = [
    {
      id: currentRegion.id,
      name: currentRegion.name,
      type: currentRegion.type,
      isAccessible: true,
      resources: currentRegion.resources || [],
      distance: 0,
      occupants: currentRegion.occupantParties?.length || 0
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
        distance: 1,
        occupants: neighbor.occupantParties?.length || 0
      });
    }
  }

  return visible;
}

function getAvailableActions(party: any, regions: Record<string, any>): string[] {
  const baseActions = ['explore', 'trade', 'cooperate'];
  const currentRegion = regions[party.location];

  if (currentRegion?.neighbors?.length > 0) {
    baseActions.push('move');
  }

  const specialEffects = Array.isArray(currentRegion?.specialEffects) ?
    currentRegion.specialEffects :
    (currentRegion?.specialEffects ? Object.values(currentRegion.specialEffects) : []);

  if (specialEffects.includes('market_access') || specialEffects.includes('enhanced_trade')) {
    baseActions.push('market_trade');
  }

  const resources = Array.isArray(currentRegion?.resources) ?
    currentRegion.resources :
    (currentRegion?.resources ? Object.values(currentRegion.resources) : []);

  if (resources.length > 0) {
    baseActions.push('extract_resources');
  }

  if (currentRegion?.type === 'ruins' || currentRegion?.type === 'dungeon') {
    baseActions.push('investigate');
  }

  return baseActions;
}

function getRelevantResources(party: any): string[] {
  const baseResources = ['currency'];

  // Add resources based on party capabilities
  if (party.capabilities?.crafting > 6) {
    baseResources.push('ore', 'materials', 'tools');
  }

  if (party.capabilities?.exploration > 7) {
    baseResources.push('gems', 'artifacts', 'maps');
  }

  if (party.capabilities?.trade > 6) {
    baseResources.push('luxury_goods', 'rare_items');
  }

  return baseResources;
}

async function getRecentHistory(sessionId: string): Promise<any[]> {
  try {
    const AUTONOMOUS_SESSIONS_DIR = process.env.AUTONOMOUS_SESSIONS_DIR || './autonomous_sessions';
    const sessionDir = path.join(AUTONOMOUS_SESSIONS_DIR, 'sessions', sessionId);
    const playlogPath = path.join(sessionDir, 'playlog.jsonl');

    const content = await fs.readFile(playlogPath, 'utf-8');
    const lines = content.trim().split('\n').filter(line => line);

    const recentEvents: any[] = [];
    // Get last 10 events
    const startIndex = Math.max(0, lines.length - 10);

    for (let i = startIndex; i < lines.length; i++) {
      try {
        const event = JSON.parse(lines[i]);
        recentEvents.push({
          step: event.step,
          type: event.type,
          participants: event.participants,
          actor: event.actor,
          description: event.narrative?.basicDescription || `${event.type} action`
        });
      } catch {
        // Skip invalid lines
      }
    }

    return recentEvents;
  } catch {
    return []; // No history available
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
  let targetTurn: number | undefined;

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
  } else {
    console.log(`Generating next turn for session ${sessionId} (auto target)...`);
  }

  generateNextTurn(sessionId, targetTurn)
    .then(async result => {
      console.log('\n✅ Next Turn Generation Result:');
      console.log(JSON.stringify(result, null, 2));

      // Write result to file for inspection
      await fs.writeFile('./next_turn_result.json', JSON.stringify(result, null, 2));
      console.log('\n📁 Result saved to: ./next_turn_result.json');

      if (result.status === 'session_complete') {
        console.log(`\n🏁 Session completed: ${result.completionReason}`);
      } else {
        console.log(`\n🎮 Turn ${result.turnGenerated} ready with ${result.requestsCreated.length} decision requests`);
      }
    })
    .catch(error => {
      console.error('\n❌ Error generating next turn:', error.message);
      console.error('Stack trace:', error.stack);
      process.exit(1);
    });
}
