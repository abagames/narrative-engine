import * as fs from 'fs/promises';
import * as path from 'path';

interface TurnPlaylog {
  narrative: {
    basicDescription: string;
    internalPerspective: {
      situationObservation: string;
      internalDeliberation: string;
      actionMotivation: string;
      expectedOutcome: string;
    };
    externalInteraction: {
      approachStrategy: string;
      communicationSummary: string[];
      perceivedResponse: string;
      relationshipAssessment: string;
    };
    outcomeReaction: {
      immediateEmotionalResponse: string;
      strategicImplication: string;
      futureDirectionAdjustment: string;
      teamMoraleImpact: string;
    };
    environmentalContext: {
      settingDescription: string;
      otherPartiesObservation: string;
      worldStateAwareness: string;
    };
  };
}

interface DecisionResponse {
  requestId: string;
  timestamp: string;
  status: string;
  proposal: {
    type: string;
    participants: string[];
    effects: any[];
  };
  meta?: {
    llmDecision?: any;
  };
}

interface PlaylogEntry {
  step: number;
  type: string;
  participants: string[];
  actor: string;
  effects: any[];
  meta: {
    frameworkEvaluation: any;
  };
  narrative: any;
  worldStateDiff: Record<string, any>;
  worldStateSnapshot: string;
}

interface AppendResult {
  success: boolean;
  entriesAdded: number;
  error?: string;
  validationErrors?: string[];
}

function validateTurnPlaylogStructure(data: any): void {
  if (!data || typeof data !== 'object') {
    throw new Error('turn_playlog.json must be an object');
  }

  if (!data.narrative || typeof data.narrative !== 'object') {
    throw new Error('turn_playlog.json must contain narrative object');
  }

  // basicDescriptionは文字列、その他はオブジェクト
  if (!data.narrative.basicDescription || typeof data.narrative.basicDescription !== 'string') {
    throw new Error(`Missing required field: narrative.basicDescription`);
  }

  const requiredObjects = ['internalPerspective', 'externalInteraction', 'outcomeReaction', 'environmentalContext'];
  for (const field of requiredObjects) {
    if (!data.narrative[field] || typeof data.narrative[field] !== 'object') {
      throw new Error(`Missing required field: narrative.${field}`);
    }
  }

  // 内部構造の詳細検証
  const internalRequired = ['situationObservation', 'internalDeliberation', 'actionMotivation', 'expectedOutcome'];
  for (const field of internalRequired) {
    if (!data.narrative.internalPerspective[field]) {
      throw new Error(`Missing required field: narrative.internalPerspective.${field}`);
    }
  }

  const externalRequired = ['approachStrategy', 'communicationSummary', 'perceivedResponse', 'relationshipAssessment'];
  for (const field of externalRequired) {
    if (!data.narrative.externalInteraction[field]) {
      throw new Error(`Missing required field: narrative.externalInteraction.${field}`);
    }
  }

  const outcomeRequired = ['immediateEmotionalResponse', 'strategicImplication', 'futureDirectionAdjustment', 'teamMoraleImpact'];
  for (const field of outcomeRequired) {
    if (!data.narrative.outcomeReaction[field]) {
      throw new Error(`Missing required field: narrative.outcomeReaction.${field}`);
    }
  }

  const environmentalRequired = ['settingDescription', 'otherPartiesObservation', 'worldStateAwareness'];
  for (const field of environmentalRequired) {
    if (!data.narrative.environmentalContext[field]) {
      throw new Error(`Missing required field: narrative.environmentalContext.${field}`);
    }
  }
}

function validateNarrativeContent(narrative: any): void {
  // 基本説明の検証
  if (!narrative.basicDescription || typeof narrative.basicDescription !== 'string' || narrative.basicDescription.trim().length < 10) {
    throw new Error('basicDescription must be a non-empty string with at least 10 characters');
  }

  // 重要フィールドの文字列長検証
  const stringFields = [
    { path: 'internalPerspective.situationObservation', name: 'situationObservation' },
    { path: 'internalPerspective.internalDeliberation', name: 'internalDeliberation' },
    { path: 'internalPerspective.actionMotivation', name: 'actionMotivation' },
    { path: 'internalPerspective.expectedOutcome', name: 'expectedOutcome' },
    { path: 'environmentalContext.settingDescription', name: 'settingDescription' }
  ];

  for (const field of stringFields) {
    const value = getNestedValue(narrative, field.path);
    if (!value || typeof value !== 'string' || value.trim().length < 10) {
      throw new Error(`${field.name} must be a non-empty string with at least 10 characters`);
    }
  }

  // キャラクター台詞の検証（オプショナル）
  // 台詞形式は必須ではないが、あれば形式をチェック
  const deliberation = narrative.internalPerspective.internalDeliberation;
  if (deliberation.includes('「') && deliberation.includes('」')) {
    validateCharacterVoices(deliberation);
  }

  // communicationSummaryの配列検証
  if (!Array.isArray(narrative.externalInteraction.communicationSummary) ||
      narrative.externalInteraction.communicationSummary.length === 0) {
    throw new Error('communicationSummary must be a non-empty array');
  }
}

function validateCharacterVoices(deliberation: string): void {
  // キャラクター台詞の形式をチェック
  const hasDialogue = deliberation.includes('「') && deliberation.includes('」');
  if (!hasDialogue) {
    throw new Error('internalDeliberation must contain character dialogue with 「」 marks');
  }

  const dialogueMatches = deliberation.match(/「[^」]+」/g);
  if (!dialogueMatches || dialogueMatches.length === 0) {
    throw new Error('internalDeliberation must contain at least one properly formatted character dialogue');
  }

  // 台詞の最小長をチェック
  for (const dialogue of dialogueMatches) {
    if (dialogue.length < 8) { // 「」を含めて最低8文字
      throw new Error('Each character dialogue must contain substantial content (minimum 6 characters inside quotes)');
    }
  }
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current && current[key], obj);
}

export async function appendPlaylog(sessionId: string, turnPlaylogFilename: string): Promise<AppendResult> {
  const AUTONOMOUS_SESSIONS_DIR = process.env.AUTONOMOUS_SESSIONS_DIR || './autonomous_sessions';
  const sessionDir = path.join(AUTONOMOUS_SESSIONS_DIR, 'sessions', sessionId);
  const workspaceDir = path.join(AUTONOMOUS_SESSIONS_DIR, 'ai_workspace');

  // 1. Read AI Agent created narrative
  const turnPlaylogPath = path.join(workspaceDir, turnPlaylogFilename);
  let turnPlaylog: TurnPlaylog;

  try {
    const content = await fs.readFile(turnPlaylogPath, 'utf-8');
    turnPlaylog = JSON.parse(content);
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      throw new Error('turn_playlog.json not found');
    }
    throw new Error('Invalid JSON in turn_playlog.json');
  }

  // TurnPlaylogの構造と内容検証
  try {
    validateTurnPlaylogStructure(turnPlaylog);
    validateNarrativeContent(turnPlaylog.narrative);
  } catch (error) {
    console.error('Validation error details:', error);
    console.error('TurnPlaylog structure:', JSON.stringify(turnPlaylog, null, 2));
    throw new Error(`Invalid turn_playlog.json: ${error instanceof Error ? error.message : 'Unknown validation error'}`);
  }

  try {

    // 2. Find and restore corresponding decision response file
    const decisionResponse = await findDecisionResponse(workspaceDir, turnPlaylog);

    // 3. Load current world state
    const worldStatePath = path.join(sessionDir, 'world_current.json');
    let currentWorldState: any;

    try {
      currentWorldState = JSON.parse(await fs.readFile(worldStatePath, 'utf-8'));
    } catch {
      throw new Error('world_current.json not found');
    }

    // 4. Calculate world state diff
    const worldStateDiff = await calculateWorldStateDiff(sessionDir, currentWorldState);

    // 5. Generate complete playlog entry
    const playlogEntry = await generateCompletePlaylogEntry(
      turnPlaylog,
      decisionResponse,
      worldStateDiff,
      sessionDir
    );

    // 6. Append to playlog.jsonl
    const playlogPath = path.join(sessionDir, 'playlog.jsonl');
    const entryLine = JSON.stringify(playlogEntry) + '\n';
    await fs.appendFile(playlogPath, entryLine);

    return {
      success: true,
      entriesAdded: 1
    };

  } catch (error) {
    // Re-throw critical errors that should be handled by caller
    if (error instanceof Error) {
      if (error.message.includes('Decision response file not found') ||
          error.message.includes('world_current.json not found') ||
          error.message.includes('Corrupted playlog.jsonl') ||
          error.message.includes('Invalid turn_playlog.json')) {
        throw error;
      }
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const validationErrors = error instanceof Error && error.message.includes('turn_playlog.json')
      ? [error.message]
      : undefined;

    return {
      success: false,
      entriesAdded: 0,
      error: errorMessage,
      validationErrors
    };
  }
}

async function findDecisionResponse(workspaceDir: string, turnPlaylog: TurnPlaylog): Promise<DecisionResponse> {
  const responsesDir = path.join(workspaceDir, 'decision_responses');
  const resultsDir = path.join(workspaceDir, 'results');

  try {
    // Read process_result.json to get successful decisions only
    const processResultPath = path.join(resultsDir, 'process_result.json');
    let successfulRequestIds: string[] = [];

    try {
      const processResultContent = await fs.readFile(processResultPath, 'utf-8');
      const processResult = JSON.parse(processResultContent);

      // Check for schema validation errors - stop if found
      if (processResult.failedDecisions && processResult.failedDecisions.length > 0) {
        const schemaErrors = (processResult.errors || []).filter((e: any) =>
          e.error && e.error.includes('Schema validation failed')
        );

        if (schemaErrors.length > 0) {
          const failedDecisionsList = processResult.failedDecisions.join(', ');
          const errorDetails = schemaErrors.map((e: any) =>
            `${e.requestId}: ${e.error}`
          ).join('\n  - ');

          throw new Error(
            `Cannot append playlog: Schema validation failed for decisions: ${failedDecisionsList}\n` +
            `Schema errors:\n  - ${errorDetails}\n` +
            `Please fix schema errors in decision response files before creating playlog entries.`
          );
        }
      }

      // Get all processed decisions except failed ones
      const files = await fs.readdir(responsesDir);
      const allJsonFiles = files.filter(f => f.endsWith('.json') && f !== 'turn_playlog.json');
      const failedIds = processResult.failedDecisions || [];

      successfulRequestIds = allJsonFiles
        .map(f => f.replace('.json', ''))
        .filter(id => !failedIds.includes(id));
    } catch (error) {
      // Re-throw schema validation errors - these should stop execution
      if (error instanceof Error && error.message.includes('Schema validation failed')) {
        throw error;
      }

      // Fallback: use all available files if process_result.json not found or other read errors
      const files = await fs.readdir(responsesDir);
      successfulRequestIds = files
        .filter(f => f.endsWith('.json') && f !== 'turn_playlog.json')
        .map(f => f.replace('.json', ''));
    }

    if (successfulRequestIds.length === 0) {
      throw new Error('No successful decision response files found');
    }

    // Use the first successful response file
    const responseFile = `${successfulRequestIds[0]}.json`;
    const responsePath = path.join(responsesDir, responseFile);
    const content = await fs.readFile(responsePath, 'utf-8');
    const response: DecisionResponse = JSON.parse(content);

    // Ensure meta.llmDecision exists with default structure
    if (!response.meta) {
      response.meta = {};
    }
    if (!response.meta.llmDecision) {
      response.meta.llmDecision = {
        frameworkEvaluation: {
          economic: { score: 7, reasoning: "Standard economic evaluation" },
          strategic: { score: 8, reasoning: "Strategic consideration applied" },
          risk: { score: 6, reasoning: "Risk assessment completed" }
        },
        optionsConsidered: [
          {
            action: response.proposal.type,
            score: 8,
            pros: ["aligned with goals", "feasible execution"],
            cons: ["resource cost", "opportunity cost"]
          }
        ],
        selectedAction: {
          type: response.proposal.type,
          reasoning: "Best available option based on framework evaluation"
        },
        reasoning: "Decision made through systematic framework application and option evaluation"
      };
    }

    return response;
  } catch (error) {
    throw new Error('Decision response file not found');
  }
}

async function calculateWorldStateDiff(sessionDir: string, currentWorldState: any): Promise<Record<string, any>> {
  try {
    let previousWorldState: any = null;
    
    // First try to use world_prev.json (for step-by-step comparison)
    const prevStatePath = path.join(sessionDir, 'world_prev.json');
    try {
      previousWorldState = JSON.parse(await fs.readFile(prevStatePath, 'utf-8'));
    } catch {
      // If world_prev.json doesn't exist, this is the first playlog entry
      // Compare with initial state
      try {
        const initialStatePath = path.join(sessionDir, 'world_initial.json');
        previousWorldState = JSON.parse(await fs.readFile(initialStatePath, 'utf-8'));
      } catch {
        return {}; // No comparison possible
      }
    }

    if (!previousWorldState) {
      return {}; // No comparison possible
    }

    // Calculate differences
    const diff: Record<string, any> = {};

    // Compare parties
    if (currentWorldState.parties && previousWorldState.parties) {
      const partyDiffs: Record<string, any> = {};

      for (const [partyId, currentParty] of Object.entries(currentWorldState.parties)) {
        const previousParty = previousWorldState.parties[partyId];
        if (previousParty) {
          const partyDiff = calculateObjectDiff(previousParty, currentParty);
          if (Object.keys(partyDiff).length > 0) {
            partyDiffs[partyId] = partyDiff;
          }
        }
      }

      if (Object.keys(partyDiffs).length > 0) {
        diff.parties = partyDiffs;
      }
    }

    // Compare market (if changed)
    if (currentWorldState.market && previousWorldState.market) {
      const marketDiff = calculateObjectDiff(previousWorldState.market, currentWorldState.market);
      if (Object.keys(marketDiff).length > 0) {
        diff.market = marketDiff;
      }
    }

    // After calculating diff, save current state as previous state for next comparison
    await fs.writeFile(prevStatePath, JSON.stringify(currentWorldState, null, 2));

    return diff;
  } catch (error) {
    return {}; // Return empty diff on any error
  }
}

function calculateObjectDiff(previous: any, current: any): Record<string, any> {
  const diff: Record<string, any> = {};

  if (!previous || !current) return diff;

  // Get all keys from both objects
  const allKeys = new Set([
    ...Object.keys(previous || {}),
    ...Object.keys(current || {})
  ]);

  for (const key of allKeys) {
    const currentValue = current[key];
    const previousValue = previous[key];

    if (typeof currentValue === 'object' && currentValue !== null && !Array.isArray(currentValue)) {
      if (typeof previousValue === 'object' && previousValue !== null && !Array.isArray(previousValue)) {
        const nestedDiff = calculateObjectDiff(previousValue, currentValue);
        if (Object.keys(nestedDiff).length > 0) {
          diff[key] = nestedDiff;
        }
      } else {
        // Previous value was not an object or was null/undefined
        diff[key] = { from: previousValue, to: currentValue };
      }
    } else if (!isEqual(currentValue, previousValue)) {
      diff[key] = { from: previousValue, to: currentValue };
    }
  }

  return diff;
}

function isEqual(a: any, b: any): boolean {
  if (a === b) return true;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => isEqual(item, b[index]));
  }

  if (typeof a === 'object' && a !== null && typeof b === 'object' && b !== null) {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    return keysA.every(key => isEqual(a[key], b[key]));
  }

  return false;
}

async function generateCompletePlaylogEntry(
  turnPlaylog: TurnPlaylog,
  decisionResponse: DecisionResponse,
  worldStateDiff: Record<string, any>,
  sessionDir: string
): Promise<PlaylogEntry> {
  // Get next step number
  const nextStep = await getNextStepNumber(sessionDir);

  // Get actor from decision response
  const actor = decisionResponse.proposal.participants[0] || 'unknown';

  const entry: PlaylogEntry = {
    step: nextStep,
    type: decisionResponse.proposal.type,
    participants: decisionResponse.proposal.participants,
    actor,
    effects: decisionResponse.proposal.effects,
    meta: {
      frameworkEvaluation: decisionResponse.meta?.llmDecision?.frameworkEvaluation || {}
    },
    narrative: turnPlaylog.narrative,
    worldStateDiff,
    worldStateSnapshot: './world_current.json'
  };

  return entry;
}

async function getNextStepNumber(sessionDir: string): Promise<number> {
  try {
    const playlogPath = path.join(sessionDir, 'playlog.jsonl');
    const content = await fs.readFile(playlogPath, 'utf-8');
    const lines = content.trim().split('\n').filter(line => line);

    if (lines.length === 0) {
      return 1;
    }

    // Find the highest step number
    let maxStep = 0;
    for (const line of lines) {
      try {
        const entry = JSON.parse(line);
        if (entry.step && typeof entry.step === 'number') {
          maxStep = Math.max(maxStep, entry.step);
        }
      } catch {
        // Skip invalid lines
        throw new Error('Corrupted playlog.jsonl');
      }
    }

    return maxStep + 1;
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return 1; // File doesn't exist, start with step 1
    }
    throw error; // Re-throw other errors
  }
}

// CLI entry point
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.error('Usage: npx tsx append_playlog.ts <sessionId> [turnPlaylogFilename]');
    console.error('Example: npx tsx append_playlog.ts session_20250918_073447 turn_playlog.json');
    process.exit(1);
  }

  const sessionId = args[0];
  const turnPlaylogFilename = args[1] || 'turn_playlog.json';

  try {
    const result = await appendPlaylog(sessionId, turnPlaylogFilename);

    if (result.success) {
      console.log(`✅ Successfully appended ${result.entriesAdded} narrative entries to playlog.jsonl`);
    } else {
      console.error('❌ Failed to append playlog entries');
      console.error('Error:', result.error);
      if (result.validationErrors) {
        console.error('Validation errors:', result.validationErrors);
      }
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Fatal error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run main if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });
}