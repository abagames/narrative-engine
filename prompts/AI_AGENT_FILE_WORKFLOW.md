# AI Agent File-Based Workflow

This document is a workflow guide for AI Coding Agents (such as Claude Code) to execute autonomous TRPG sessions.

## 🎯 Design Principles

- **AI Agent-Driven**: AI Coding Agents such as Claude Code make decisions and execute
- **No New Code Implementation**: Use only already implemented tools; do not implement new automation scripts
- **Persistence-Focused**: Record all states and decisions to files
- **Complete Autonomy**: Complete session execution without human intervention

## 🔧 System Configuration

### Directory Structure

```
autonomous_sessions/
├── inputs/                      # AI Agent input file storage
│   ├── world_initial.json      # Initial world state created by AI Agent
│   └── session_config.json     # Session configuration created by AI Agent
├── sessions/                    # Session management
│   └── session_YYYYMMDD_HHMMSS/
│       ├── metadata.json
│       ├── world_initial.json
│       ├── world_current.json
│       ├── world_prev.json       # Previous state (for worldStateDiff calculation)
│       ├── world_final.json
│       ├── playlog.jsonl
│       └── narrative.md
└── ai_workspace/               # AI Agent work area
    ├── decision_requests/      # Decision requests (Engine → AI Agent)
    ├── decision_responses/     # Decision responses (AI Agent → Engine)
    ├── world_snapshots/       # World state snapshots
    └── results/               # Processing result files (each tool execution result)
        ├── session_result.json
        ├── process_result.json
        └── next_turn_result.json
```

## 🚀 AI Agent Execution Flow

### Phase 1: Session Initialization

**Preparation**: Creating input directory

1. **Input Directory Initialization**: AI Agent creates standard directory structure

```bash
# Create directory structure with Bash tool
mkdir -p autonomous_sessions/inputs
mkdir -p autonomous_sessions/ai_workspace/decision_requests
mkdir -p autonomous_sessions/ai_workspace/decision_responses
mkdir -p autonomous_sessions/ai_workspace/world_snapshots
mkdir -p autonomous_sessions/ai_workspace/results
```

**Important**: All input files should be placed under `autonomous_sessions/inputs/`. This unifies file paths and makes AI Agent execution predictable.

**AI Agent World Building**: Design and creation of initial world state

2. **World Design**: AI Agent determines geography, factions and the guild

   - Decide number and placement of regions (AI Agent determines appropriate map size)
   - AI Agent creates names, types, and characteristics for each region (forest, settlement, ruins, mountains, lakes, etc.)
   - AI Agent designs connections between regions (neighbors). Parties can only move to adjacent regions
   - AI Agent sets capacity, resources, and special effects for each region
   - Create the guild (`guild`) and the season length (`guild.season.endsAtTurn`, `promotionSlots`)
   - The market is optional background. Include `market` only if trade matters to this world

3. **Party Design**: AI Agent creates diverse parties

   - Decide party number (3-4 recommended) and placement
   - Set ability values for each party (0-10; e.g. combat, exploration, investigation, diplomacy). These become check modifiers
   - Set `reputation: 0`, `goals` (what the party wants from the season) and `flaws` (a weakness with a trigger that can override optimal play)
   - Initial resource allocation (currency, a few materials)
   - **Each party should be in hostile or alliance relationships with other parties, configured so that inter-party events occur frequently**
   - **Initial setup of inter-party relationship values**: Clearly define initial relationships between each party pair
   - **Character Profile Configuration**: Apply specific character settings to each party

3.5 **Quest Board Design**: AI Agent creates the first quests, clients and threats (rules: `QUEST_MANAGEMENT.md`)

   - Create NPC clients (`npcs`) with what they want
   - Create **party count + 1** quests: at least one **collision** pair (mutual `conflictsWith`, intended for different parties), at least one **race** (exclusive quest several parties will want) and one **joint** quest
   - Place quest locations in 2-3 regions so that parties meet
   - Give at least one client a `secret`
   - Create 1-2 progress `clocks` (threats that advance over time or on failure)
   - A complete sample input that follows these rules: `examples/lantern_guild_season/` (`world_initial.json`, `session_config.json`)

**Character Profile Configuration**:

```json
{
  "characterProfile": {
    "leadershipStyle": "collaborative_democracy",
    "decisionMaking": "cautious_analytical",
    "communicationStyle": "diplomatic_direct",

    // 🆕 Individual member definition (dialogue generation with specific names)
    "partyMembers": [
      {
        "name": "Aria",
        "role": "Leader",
        "personality": "Analytical",
        "speechStyle": "Calm and logical, statements emphasizing data",
        "specialization": "Strategic planning"
      },
      {
        "name": "Kaito",
        "role": "Scout",
        "personality": "Cautious",
        "speechStyle": "Concise and practical, warnings emphasizing risks",
        "specialization": "Reconnaissance and danger detection"
      },
      {
        "name": "Mira",
        "role": "Scholar",
        "personality": "Curious",
        "speechStyle": "Academic and detailed, expressing excitement about discoveries",
        "specialization": "Knowledge and research"
      }
    ],

    "speechPatterns": {
      "internal": "Polite, analytical, cautious",
      "external": "Courteous, clear, skilled at negotiation"
    }
  }
}
```

**Benefits**:

- Technical logs become immersive character-driven stories with named individuals
- **🆕 Specific character dialogue**: "Aria points to the map while" instead of "One of the members"
- **🆕 Role-based specialization**: Each member contributes according to their expertise
- **🆕 Party member introductions**: Each narrative begins with detailed member descriptions and party philosophy
- Deep psychological insight into party decision-making processes
- Rich dialogue and environmental descriptions with individual personality traits
- Maintains 100% data accuracy while achieving novel-quality readability

4. **Inter-party Relationship Value Initialization**: AI Agent sets initial relationships between party pairs

**Relationship Value Initialization Principles**:
```typescript
// Basic relationship value distribution (recommended)
relationshipDistribution = {
  HostileRelations: "20-30% of pairs", // hostility: 6-8, cooperation: 1-3
  NeutralRelations: "40-50% of pairs", // All values: 4-6 range
  FriendlyRelations: "20-30% of pairs", // cooperation: 6-8, trust: 6-8
  CompetitiveRelations: "For power balance adjustment" // competition: 7-9
};

// Pair ID naming convention
pairId = `${alphabeticalFirst}_id__${alphabeticalSecond}_id`;
// Example: "emerald_hunters__fire_forge_guild"

// Strategic considerations for relationship value setting
strategicConsiderations = {
  GeographicalProximity: "Parties in adjacent regions have high competition",
  AbilityComplementation: "Different specializations → high cooperation possibility",
  AbilityCompetition: "Same specializations → high competition",
  NarrativeConflict: "Setting-based hostility → high hostility",
  Balance: "Distributed placement avoiding single dominant power"
};
```

**Specific Initialization Example**:
```json
{
  "emerald_hunters__fire_forge_guild": {
    "hostility": 2,     // Low hostility (trade partner possibility)
    "cooperation": 6,   // High cooperation (exploration vs crafting complementary relationship)
    "competition": 3,   // Low competition (different specializations)
    "trust": 5,         // Neutral trust
    "lastInteraction": "turn_0",
    "history": []
  },
  "emerald_hunters__shadow_syndicate": {
    "hostility": 7,     // High hostility (setting-based conflict)
    "cooperation": 1,   // Low cooperation
    "competition": 8,   // High competition (activity in same region)
    "trust": 2,         // Low trust
    "lastInteraction": "turn_0",
    "history": []
  }
}
```

5. **Initial World State File Creation**: Create `autonomous_sessions/inputs/world_initial.json` with `Write` tool

```json
{
  "parties": {
    "[party_id]": {
      "id": "[party_id]",
      "name": "[Name determined by AI Agent]",
      "location": "[Placement determined by AI Agent]",
      "resources": { "currency": "[AI determined value]", "materials": {...} },
      "capabilities": { "exploration": "[AI determined value]", ... },
      "morale": "[AI determined value]",
      "reputation": 0,
      "goals": ["[What the party wants this season]"],
      "flaws": [{ "name": "[Flaw]", "trigger": "[When it applies]", "effect": "[What the party does]" }],
      "knowledge": [],
      "inventory": [],
      "characterProfile": {
        "leadershipStyle": "[AI determined value]",
        "decisionMaking": "[AI determined value]",
        "communicationStyle": "[AI determined value]",
        "partyMembers": [
          {
            "name": "[Member name created by AI]",
            "role": "[Role determined by AI]",
            "personality": "[Personality determined by AI]",
            "speechStyle": "[Speech style determined by AI]",
            "specialization": "[Specialization determined by AI]"
          }
        ],
        "speechPatterns": {
          "internal": "[Internal communication determined by AI]",
          "external": "[External communication determined by AI]"
        }
      }
    }
  },
  "regions": {
    "[Region ID created by AI]": {
      "id": "[Region ID created by AI]",
      "name": "[Region name created by AI Agent]",
      "type": "[Type determined by AI Agent: forest/settlement/ruins/mountains/desert/lake etc.]",
      "capacity": "[AI determined value]",
      "neighbors": ["[Array of adjacent region IDs designed by AI]"],
      "occupantParties": ["[Parties placed by AI]"],
      "resources": ["[Region-specific resources set by AI]"],
      "specialEffects": ["[Special effects set by AI]"],
      "influence": {}
    }
  },
  "guild": {
    "name": "[Guild name]",
    "season": { "endsAtTurn": "[Last turn of the season]", "promotionSlots": 1 }
  },
  "npcs": {
    "[npc_id]": { "name": "[NPC name]", "wants": "[What the NPC wants]", "disposition": {}, "memory": [] }
  },
  "quests": {
    "[quest_id]": {
      "title": "[Quest title]",
      "client": "[npc_id]",
      "description": "[What is asked and why]",
      "location": "[region_id]",
      "type": "exclusive | joint",
      "requiredProgress": 3,
      "deadlineTurn": "[Turn]",
      "reward": { "reputation": 3, "currency": 30, "items": [] },
      "conflictsWith": ["[quest_id that cannot also succeed]"],
      "offeredTo": ["[Optional: party ids for a private offer]"],
      "secret": { "truth": "[What the client hides]", "revealedTo": [] },
      "onComplete": [],
      "onFail": [],
      "advancesClock": { "clockId": "[clock_id]", "amount": 1 }
    }
  },
  "clocks": {
    "[clock_id]": { "name": "[Threat]", "segments": 4, "filled": 0, "tickPerTurn": 0, "consequence": "[What happens]", "onComplete": [] }
  },
  "favors": {},
  "threads": {},
  "market": "[Optional: { currentPrices: {...}, priceHistory: [], completedTrades: [] }]",
  "relationships": {
    "[party1_id]__[party2_id]": {
      "hostility": "[AI determined value 0-10]",
      "cooperation": "[AI determined value 0-10]",
      "competition": "[AI determined value 0-10]",
      "trust": "[AI determined value 0-10]",
      "lastInteraction": "turn_0",
      "history": []
    },
    "[party1_id]__[party3_id]": {
      "hostility": "[AI determined value]",
      "cooperation": "[AI determined value]",
      "competition": "[AI determined value]",
      "trust": "[AI determined value]",
      "lastInteraction": "turn_0",
      "history": []
    }
  },
  "turn": 1,
  "worldAge": 1,
  "narrativeContext": {}
}
```

5. **Session Configuration File Creation**: Create `autonomous_sessions/inputs/session_config.json` with `Write` tool

```json
{
  "sessionName": "[Session name determined by AI Agent]",
  "maxTurns": "[AI determined value]",
  "seed": "[Optional integer: fixes the dice for reproducible sessions]",
  "stopConditions": {
    "seasonEnd": true
  }
}
```

Quest-driven stop conditions: `seasonEnd`, `questsResolved` (number), `questCompleted` (quest id), `clockTriggered` (clock id). Legacy: `totalPartyWealth`, `regionDevelopment`.
```

6. **Tool Execution**: Session start

- `npx tsx src/start_session.ts autonomous_sessions/inputs/world_initial.json autonomous_sessions/inputs/session_config.json`

**Note**: Setting the environment variable `AUTONOMOUS_SESSIONS_DIR` is optional. If not set, `./autonomous_sessions` will automatically be used as the default directory. Set the environment variable only if you want to specify a specific directory:

```bash
# Default execution (recommended)
npx tsx src/start_session.ts autonomous_sessions/inputs/world_initial.json autonomous_sessions/inputs/session_config.json

# When using custom directory
AUTONOMOUS_SESSIONS_DIR=./custom_sessions npx tsx src/start_session.ts custom_sessions/inputs/world_initial.json custom_sessions/inputs/session_config.json
```

**start_session.ts Processing Content**:

- Load `world_initial.json` created by AI Agent and validate it (quest references to regions, clients, clocks and other quests must exist)
- Fix the dice seed (`rng.seed`) from `session_config.json` `seed`, or generate one
- Normalize quests, clocks, favors, NPCs and threads
- Create session management directory (`autonomous_sessions/sessions/session_YYYYMMDD_HHMMSS/`)
- Save initial world state as `world_initial.json`
- Initialize AI Agent work directory (`ai_workspace/`)
- Generate decision request files for the first turn

**Output File**: `autonomous_sessions/ai_workspace/results/session_result.json`

```json
{
  "sessionId": "session_20250917_143022",
  "status": "ready",
  "firstTurnRequests": ["request_GM_143023.json", "request_party1_143024.json"],
  "workspaceDir": "./autonomous_sessions/ai_workspace/"
}
```

**Generated Decision Request File Examples**:

**For GM**: `ai_workspace/decision_requests/request_GM_143023.json`

```json
{
  "requestId": "request_GM_143023",
  "timestamp": "2025-09-17T14:30:23Z",
  "sessionId": "session_20250917_143022",
  "worldStateFile": "../sessions/session_20250917_143022/world_current.json",
  "framework": {
    "role": "GM"
  },
  "contextData": {
    "worldSummary": { "turn": 1, "totalParties": 3, "activeRegions": 6, "partyDistribution": {...}, "seasonEndsAtTurn": 12 },
    "questBoard": {
      "active": [ "...full quest objects including secrets and conflictsWith..." ],
      "resolved": [],
      "signals": { "activeQuestCount": 4, "partyCount": 3, "idleParties": [...], "contestedQuests": [...], "conflictPairs": [...], "questsByRegion": {...}, "deadlinesWithin2Turns": [...] }
    },
    "clocks": [...], "standings": [...], "favors": [...], "npcs": {...}, "openThreads": [...],
    "recentChecks": [...], "recentEngineEvents": [...],
    "pacing": { "recentGMActionTypes": {...}, "recentCheckOutcomes": {...} },
    "availableActions": ["issue_quest", "npc_action", "complication", "advance_clock", "reveal_secret", "environmental_change", "discovery_event", "weather_change"],
    "recentHistory": []
  },
  "instructions": "[GM decision instructions: Please read worldStateFile to obtain complete world state]"
}
```

**For Party**: `ai_workspace/decision_requests/request_party1_143024.json`

```json
{
  "requestId": "request_party1_143024",
  "timestamp": "2025-09-17T14:30:24Z",
  "sessionId": "session_20250917_143022",
  "worldStateFile": "../sessions/session_20250917_143022/world_current.json",
  "framework": {
    "role": "Player",
    "actorId": "party1_explorer"
  },
  "contextData": {
    "partyState": {
      "id": "party1_explorer",
      "name": "[Party name determined by AI Agent]",
      "location": "[Current location]",
      "resources": { "currency": 120 },
      "capabilities": { "exploration": 8, "combat": 6, "diplomacy": 4 },
      "morale": 7, "reputation": 0, "inventory": [], "goals": [...], "flaws": [...]
    },
    "checkModifiers": { "exploration": 1, "combat": 0, "diplomacy": 0 },
    "guildBoard": [
      { "id": "escort_vell", "title": "...", "client": "merchant_vell", "location": "harbor", "type": "exclusive",
        "deadlineTurn": 8, "requiredProgress": 3, "reward": {...}, "status": "accepted", "acceptedBy": ["party2"],
        "yourProgress": 0, "rivalProgress": { "party2": "started" } }
    ],
    "activeQuests": [], "questSlotsFree": 2,
    "knowledge": [...], "favors": [...], "clientDispositions": {...},
    "standings": [...], "seasonEndsAtTurn": 12, "visibleClocks": [...],
    "visibleRegions": [
      { "id": "current_region", "isAccessible": true, "distance": 0, "occupantParties": [...] },
      { "id": "neighboring_region", "isAccessible": true, "distance": 1, "occupantParties": [...] }
    ],
    "availableActions": ["accept_quest", "pursue_quest", "investigate", "negotiate", "assist", "contest", "rest", "move", ...],
    "recentHistory": []
  },
  "instructions": "[Player decision instructions: Please read worldStateFile to obtain complete world state]"
}
```

### Phase 2: AI Agent Decision Processing

#### Step 1: Reading Decision Requests

**Tool Execution**: File reading

- Read all `.json` files in `./autonomous_sessions/ai_workspace/decision_requests/` with `Read` tool
- Parse JSON from each file to obtain `request` object

**Data Analysis**: Confirm request content

- `request.requestId`: Request ID
- `request.framework.role`: 'GM' or 'Player'

#### Step 2: World State Acquisition and Decision Making

**Tool Execution**: World state reading

- Read complete world state from `request.worldStateFile` with `Read` tool

**AI Agent Decision Processing**: Decision making based on previously read frameworks

**Important Principles**:

- Apply framework evaluation axes numerically (0-10 point scale)
- Reflect character personality and specialization in action decisions
- Record concise and specific selectedReasoning

1. **World State Analysis**: Understand current situation from read world state and `request.contextData`
2. **Framework Application**: Apply evaluation criteria of appropriate framework (GM_CORE_MIND.md or PLAYER_MIND.md) based on `request.framework.role`
   - **GM Role**: Evaluate environment and NPC actions using challenge level axis, narrative axis, and balance axis
   - **Player Role**: Select actions based on character personality, specialization, and risk assessment
3. **Option Generation**: Create and evaluate possible action options from `request.contextData.availableActions`
4. **Score Calculation**: Score each option according to framework evaluation axes (0-10 points)
5. **Optimal Action Selection**: Decide on highest scoring option and record evaluation details

#### Step 3: Action Proposal Creation

**Data Generation**: Decision response JSON structure (world_current.json change instructions only)

```json
{
  "requestId": "[request.requestId]",
  "timestamp": "[Current time ISO string]",
  "status": "completed",
  "proposal": {
    "type": "[Selected action type]",
    "participants": ["[actor_id_or_GM]"],
    "effects": [
      {
        "target": "path/to/state",
        "operation": "set|add",
        "value": "[Change value]"
      }
    ],
    "checks": [
      {
        "id": "[check id]",
        "actor": "[party id]",
        "capability": "[capability used]",
        "outcomes": { "success": [...], "partial": [...], "failure": [...] }
      }
    ]
  },
  "meta": {
    "frameworkEvaluation": {
      "challengeBalance": 8,
      "narrativeTension": 7,
      "selectedReasoning": "Create balance of exploration competition with new high-value resources against high cooperation level"
    }
  }
}
```

**Player Decision Response Example** (uncertain attempts are checks; the engine rolls):

```json
{
  "requestId": "request_emerald_hunters_143024",
  "timestamp": "2025-09-18T02:30:30.000Z",
  "status": "completed",
  "proposal": {
    "type": "pursue_quest",
    "participants": ["emerald_hunters"],
    "effects": [],
    "checks": [
      {
        "id": "map_the_sunken_stair",
        "description": "Rex maps the flooded stair before the Forge Guild arrives",
        "actor": "emerald_hunters",
        "capability": "exploration",
        "outcomes": {
          "success": [{ "target": "quests/sunken_relic/progress/emerald_hunters", "operation": "add", "value": 2 }],
          "partial": [
            { "target": "quests/sunken_relic/progress/emerald_hunters", "operation": "add", "value": 1 },
            { "target": "parties/emerald_hunters/morale", "operation": "add", "value": -1 }
          ],
          "failure": [{ "target": "parties/emerald_hunters/morale", "operation": "add", "value": -2 }]
        }
      }
    ]
  },
  "meta": {
    "llmDecision": {
      "frameworkEvaluation": { "questValue": 9, "rivalPressure": 8 },
      "selectedAction": { "type": "pursue_quest", "reasoning": "The Forge Guild is close on the same relic; we must move first" },
      "character_voices": { "Rex": "Stay on my rope line. The water is rising." }
    }
  }
}
```

**Tool Execution**: Response file saving

- Save above JSON to `./autonomous_sessions/ai_workspace/decision_responses/${request.requestId}.json` with `Write` tool

### Phase 3: Execution Result Confirmation

**Tool Execution**: AI response processing

- `npx tsx src/process_ai_responses.ts [sessionId]`
- Output file: `autonomous_sessions/ai_workspace/results/process_result.json`

**When there are errors**:

```json
{
  "processedDecisions": 4,
  "actionsExecuted": 3,
  "errors": [
    {
      "requestId": "request_party2_143025",
      "error": "Invalid action: insufficient currency",
      "details": "Party requires 50 currency but has only 30"
    }
  ],
  "failedDecisions": ["request_party2_143025"],
  "nextStatus": "error"
}
```

**When all successful**:

```json
{
  "processedDecisions": 4,
  "actionsExecuted": 4,
  "errors": [],
  "failedDecisions": [],
  "nextStatus": "turn_completed"
}
```

**When session completed**:

```json
{
  "processedDecisions": 2,
  "actionsExecuted": 2,
  "errors": [],
  "failedDecisions": [],
  "nextStatus": "completed"
}
```

**process_ai_responses.ts Processing Content**:

- Read decision response files created by AI Agent and perform JSON schema validation
- Identify the actor (GM, or the party in `participants[0]`) and check every effect, including every check branch, against that actor's permissions **before** rolling
- Roll declared checks deterministically (seeded) and apply exactly one outcome branch per check
- Apply each response all-or-nothing: if any effect or invariant fails (negative resources, non-adjacent move, quest limit, progress away from the quest site), nothing from that response is applied
- After all responses: resolve quests (completions, rewards, conflicting quests failing, ties by roll) and full clocks
- Store the engine's ruling in each successful response file as `engineResolution` (`processed`, `role`, `checks`). Responses already processed are skipped on a rerun, so fixing a failed response never re-applies the others
- Move failed responses to `decision_responses/failed/`
- Update world state (save to `world_current.json`)
- Output `checks` (dice, modifiers, outcomes) and `engineEvents` in `process_result.json`

**AI Agent Error Handling**:

- Check `errors` array in `autonomous_sessions/ai_workspace/results/process_result.json`
- For failed decision requests:
  1. **Analyze error content**:
     - `insufficient <resource>`: Recalculate with the actual remaining amount
     - `Permission denied: <target> (<reason>)`: The actor may not write that path. Use a check or another action
     - `quest progress can only change through a check outcome`: Move the progress into a check's outcomes
     - `Invalid move`: Move only to a neighbor of the current region
     - `must be pursued at <region>`: Move to the quest location first
     - `Quest limit exceeded`: Abandon a quest or pursue an accepted one
     - `Schema validation failed`: Fix path format, operation, or missing check outcomes
  2. **Recreate corrected decision response file** (only for failed requestId). Dice for the same check are the same, so resubmission is for fixing errors only
  3. Re-execute `npx tsx src/process_ai_responses.ts [sessionId]`

**Error Processing Limits**:

- **Maximum retry count**: Up to 3 retries per same decision request
- **When retry exceeded**: Skip relevant decision and continue processing other decisions
- **Deadlock prevention**: Force terminate session if all decisions fail 3 consecutive times
- **Error log recording**: Persist failed decisions and error reasons to `error_log.json`

**Continuation Processing**: AI Agent-driven loop

**5 states of nextStatus**:

- `'error'`: Processing failed, AI Agent fixes and reprocesses failed decisions (within retry limits)
- `'error_abort'`: Error processing limit exceeded, force terminate session
- `'partial_success'`: Some decisions succeeded, need to fix failed decisions
- `'turn_completed'`: Turn completed, AI Agent generates next turn decision requests
- `'completed'`: Session completed, AI Agent proceeds to Phase 4 (Narrative Generation)

**AI Agent Continuation Conditions**:

- `nextStatus: "error"`: Fix failed decision requests and re-execute (check retry counter)
- `nextStatus: "error_abort"`: Output error log and force terminate session
- `nextStatus: "partial_success"`: **Fix and re-execute failed decisions** (already applied responses are skipped) → when nothing is left to fix, **create and append one playlog entry for the turn** → generate next turn
- `nextStatus: "turn_completed"`: **Create and append playlog** → **Generate next turn decision requests**
- `nextStatus: "completed"`: **Create and append final playlog** → Proceed to Phase 5 (Narrative Replay Generation)

### Phase 4: Playlog Creation and Appending

**Processing when turn completed (`nextStatus: "turn_completed"`):**

1. **Turn Playlog Creation**: AI Agent generates narrative for that turn

**AI Agent Execution Procedure**:

a) **Information collection from processed decision response files**:

- Read all `.json` files in `ai_workspace/decision_responses/` with `Read` tool
- Extract following information from each file:
  - `meta.llmDecision.character_voices`: Character dialogue
  - `meta.llmDecision.selectedAction.reasoning`: Action reasons and motivations
  - `proposal.type`, `proposal.effects` and `proposal.checks`: What was attempted and what was at stake
  - `engineResolution.checks`: The dice, modifiers and outcome of each check. **Write the narrative to match the outcome**, especially partial successes and failures
  - `meta.llmDecision.optionsConsidered`: Considered options
- Organize actions in chronological order (timestamp or requestId order)

b) **Analysis of world state changes**:

- Get latest world state from `sessions/[sessionId]/world_current.json` with `Read` tool
- Read the new entries of `chronicle` (quest completions/failures/expirations, clock ticks and triggers, tie-breaks)
- Identify changes from previous turn:
  - Quest progress and standings
  - Party state changes (morale, position, reputation, inventory)
  - Relationship, favor and NPC disposition changes
  - Regional situation changes

c) **Focus party selection**:

- Select the party that performed the most important/interesting action in that turn
- Priority order: Quest resolved (completed/failed/expired) > Opposed check between parties > Secret revealed > Clock triggered > Failure with a cost > Quest accepted > Movement
- Construct story from selected party's perspective and set `focusRequestId` to that party's requestId

d) **Narrative structure generation**:

- Construct centered on focus party's internal perspective
- Incorporate other parties' actions as environmental information and background
- Appropriately place character dialogue
- Connect action motivations and results with causal relationships

**Tool Execution**: Turn playlog file creation

- Save to `ai_workspace/turn_playlog.json` with following structure using `Write` tool:

```json
{
  "focusRequestId": "[requestId of the focus party's response (optional)]",
  "narrative": {
    "basicDescription": "Fire Forge Guild purchases 15 units of ore for 50 currency at market",
    "internalPerspective": {
      "situationObservation": "Discovered ore price upward trend in market, good opportunity to secure inventory",
      "internalDeliberation": "Fighter proposed immediate decision, Wizard agreed emphasizing price analysis and future forecasting",
      "actionMotivation": "High-quality ore needed for metalworking, the core capability of the forge guild",
      "expectedOutcome": "Produce high-quality equipment in next forging work to secure competitive advantage"
    },
    "externalInteraction": {
      "approachStrategy": "Leverage reputation as reliable quality-focused forge guild",
      "communicationSummary": [
        "Confirmed market price trends",
        "Requested quality-guaranteed ore",
        "Maintained good relationship with swift payment"
      ],
      "perceivedResponse": "Market participants recognize forge guild's expertise and show willingness to engage in quality-focused transactions",
      "relationshipAssessment": "Continuous trust relationship with market maintained, expectation of priority trading in future"
    },
    "outcomeReaction": {
      "immediateEmotionalResponse": "Satisfaction with securing quality ore and anticipation for next work",
      "strategicImplication": "Increased opportunities to utilize forging capabilities, possibility of equipment supply to other parties",
      "futureDirectionAdjustment": "Consider regular ore procurement and sales strategy for forged products",
      "teamMoraleImpact": "Success utilizing expertise improved guild members' confidence and unity"
    },
    "environmentalContext": {
      "settingDescription": "Lively market square, commercial center where various resources are traded",
      "otherPartiesObservation": "Signs that other exploration parties are also intensifying resource procurement activities",
      "worldStateAwareness": "Resource demand is increasing due to overall increase in exploration and development activities"
    }
  }
}
```

**Important Note**: Decision response files stay in `decision_responses/` until the next turn is generated. `append_playlog.ts` marks them as logged, so appending twice in one turn does not duplicate actions.

2. **Tool Execution**: Playlog appending

- `npx tsx src/append_playlog.ts [sessionId] turn_playlog.json`

**append_playlog.ts Processing Content**:

- Read `turn_playlog.json` (narrative and optional `focusRequestId`) created by AI Agent
- Read **all** successful, not yet logged decision responses of the turn
- Read current world state (`world_current.json`)
- **Gradual world state diff calculation**:
  - **First execution**: Compare `world_initial.json` and `world_current.json`
  - **Second and later**: Compare `world_prev.json` and `world_current.json`
  - **After diff calculation**: Save `world_current.json` as `world_prev.json` (for next comparison)
- **Complete playlog entry automatic generation** (one entry per turn):
  - Automatic `step` number calculation (last step of existing playlog.jsonl + 1) and `turn`
  - `type`, `participants`, `actor`, `effects`, `meta.frameworkEvaluation` from the focus response (`focusRequestId`, else the first response)
  - `actions`: every actor's action (role, type, effects, check results, reasoning, character voices, options considered)
  - `checks`: all check results of the turn
  - `engineEvents`: engine events not yet logged (quest resolutions, clocks, tie-breaks, season end)
  - Get `narrative` from AI Agent created data
  - Automatic `worldStateDiff` generation (accurate change diff through gradual comparison)
  - Add `worldStateSnapshot` reference (relative path to `world_current.json`)
- Append complete playlog entry to `playlog.jsonl`

3. **Tool Execution**: Next turn decision request generation

- `npx tsx src/generate_next_turn.ts [sessionId] ([targetTurn])`
  - If `targetTurn` is omitted, the turn will be automatically set to the current turn value in `world_current.json` + 1
  - Explicitly specify `targetTurn` only when rollback or regeneration of specific turns is needed

**generate_next_turn.ts Processing Content**:

- Read current world state (`world_current.json`)
- Check `maxTurns` and stop conditions. When the session ends and the world has a guild, record season standings and promotions (`guild/standings`, `guild/promoted`)
- **Start-of-turn upkeep** (once per turn): quests past `deadlineTurn` expire (their `onFail` and `advancesClock` apply), clocks with `tickPerTurn` advance, full clocks trigger
- Generate decision request files for next turn:
  - For GM: `ai_workspace/decision_requests/request_GM_[timestamp].json` (full quest board including secrets, signals, clocks, standings, pacing)
  - For each party: `ai_workspace/decision_requests/request_[partyId]_[timestamp].json` (public quest board, own knowledge and favors, coarse rival progress, check modifiers)
- `engineEvents` from upkeep are included in `next_turn_result.json`

**Output File**: `autonomous_sessions/ai_workspace/results/next_turn_result.json`

```json
{
  "turnGenerated": 16,
  "requestsCreated": [
    "request_GM_143125.json",
    "request_emerald_hunters_143126.json",
    "request_fire_forge_guild_143127.json"
  ],
  "status": "ready_for_next_turn"
}
```

4. **Next Turn Loop Start**: AI Agent resumes Phase 2 from generated decision request files

**Processing when session completes (`nextStatus: "completed"`):**

1. **Final Turn Playlog Creation**: Generate final turn narrative in same format as above
2. **Tool Execution**: Final playlog appending

- `npx tsx src/append_playlog.ts [sessionId] final_turn_playlog.json`
- append_playlog.ts executes same diff calculation and appending process as above

### Phase 5: Narrative Replay Generation

**Tool Execution**: Session completion processing

- `npx tsx src/finalize_session.ts [sessionId]`

**finalize_session.ts Processing Content**:

- Save final world state as `world_final.json`
- **Final cleanup of work files**:
  - Delete all files in `ai_workspace/decision_requests/` (only when session completes)
  - Delete all files in `ai_workspace/decision_responses/` (only when session completes)
  - Delete old files in `ai_workspace/world_snapshots/` (keep latest 5 turns when turn progresses)
  - **Note**: Do not completely cleanup work files during intermediate turns
- Update session metadata

**AI Agent Work**: Narrative replay generation

1. **Playlog Reading**: Read `playlog.jsonl` with `Read` tool
2. **World State Reading**: Get party information and character profiles from `world_initial.json` with `Read` tool
3. **Goal Evolution Analysis**: Identify goal changes and turning points for each party from playlog
4. **AI Agent Work**: Create attractive replay-format narrative from all playlogs
   - **Opening Section: Party Introduction Section**:
     - Basic information for each party (name, specialization, base)
     - **🎯 Initial Goals**: Clearly state each party's original purpose and objectives
     - Member composition and role distribution (obtained from `partyMembers` in `world_initial.json`)
     - Each member's personality and specialization (`personality`, `speechStyle`, `specialization`)
     - Party activity policy and goal setting
   - **Main Section: Session Recreation**:
     - Chronological session recreation (describe each turn individually, prohibition of combining multiple turns)
     - **Turning point marking at important turns**: 【🔄 Goal Turning Point】【⚔️ True Enemy Revelation】 etc.
     - **Catalyst for Change**: Clearly state what caused the goal transformation
     - **🎯 New Goals**: Specifically describe post-change objectives
     - **🔥 Basis for Hostility**: Analyze and document reasons for hostility with new enemies
     - **💡 Term Explanation Boxes**: Add explanations for important terms that appear for the first time in each turn
       - Target world-specific terms, tactical/strategic terms, organization/faction names, special abilities/magic terms, etc.
       - To assist reader understanding, concisely explain the meaning, function, and role of terms in context
       - Use markdown blockquote syntax (`> **💡 Term Explanation**: **Term Name** - Explanation content`) for visual distinction
     - Character perspective emotional descriptions and dialogue recreation
     - Detailed environmental and atmospheric descriptions
     - Detailed recreation of important decisions, turning points, and combat
     - Description of inter-party interactions and cooperative relationships
     - **🎲 Honor the dice**: Narrate each check as its outcome says (`engineResolution.checks`, `checks` in playlog). Partial successes show their cost; failures are not softened into successes
     - **📜 Quest arcs**: Follow each quest from issue to resolution (`engineEvents`), including quests lost to rivals, collisions and expirations
   - **Epilogue Section: Summary of Goal Achievement Process**:
     - **📈 Goal Evolution**: Organize phased goal changes chronologically
     - **🌟 Faction Role Changes**: Track role changes of each party
     - Final goal achievement and story conclusion
5. **Replay File Creation**: Create `narrative_replay.md` with `Write` tool

**Recommended Replay Structure**:

```markdown
# [Session Name] - Narrative Replay

## Adventurer Introductions

### [Party Name 1]

**Base**: [location] | **Specialization**: [specialization]

- **[Member Name]** ([role]): [personality] personality, responsible for [specialization]
  - Speech Style: [speechStyle]
- **[Member Name]** ([role]): [personality description]

**🎯 Initial Goals**: [Party's original purpose and objectives]
**Activity Policy**: [characterProfile.leadershipStyle] based on [characterProfile.decisionMaking]

### [Party Name 2]

[Similar structure...]

## Adventure Records

### Turn 1: [Major Event]

> **💡 Term Explanation**: **[First-time important term]** - [Concise explanation of term's meaning, function, and role in context]

[Detailed recreation based on playlog...]

### Turn X: [Event Name] 【🔄 Goal Turning Point】

> **💡 Term Explanation**: **[Important term appearing at turning point]** - [Term explanation]. **[Related important term]** - [Additional explanation]

**Catalyst for Change**: [What caused the goal transformation]

**🎯 New Goals**: [Post-change objectives]

- [Specific goal item 1]
- [Specific goal item 2]

[Continued description...]

### Turn Y: [Event Name] 【⚔️ True Enemy Revelation】

**[Enemy Identity Revealed]**: [Hostile faction discovery content]

**🔥 Basis for Hostility**:

- **[Reason 1]**: [Specific motivation]
- **[Reason 2]**: [Specific motivation]

**🎯 Final Goal Confirmation**: [Goal 1] → [Goal 2] → **[Final Goal]**

[Continued description...]

## 🏆 Epilogue

### 📈 Goal Evolution: [Number of stages] Stage Battle

**First Stage (Turn X-Y)**: **[Period Name]** 🔸

- **Goal**: [Goal for this stage]
- **Achievement**: [Accomplished results]
- **Symbol**: [Symbolic dialogue or events]

**Second Stage (Turn A-B)**: **[Period Name]** 🔸

- **Turning Point**: [Catalyst for transformation]
- **Goal**: [Goal for this stage]
- **Achievement**: [Accomplished results]
- **Symbol**: [Symbolic dialogue or events]

### 🌟 [Number of factions] Faction Role Changes

**[Party Name]**: [Initial Role] → [Mid-term Role] → [Final Role]

[Final story conclusion and significance]
```

### Phase 6: Readable Playlog Generation

**Purpose**: Convert technical data from playlog into a highly readable markdown file

**AI Agent Work**: Analytical playlog creation

1. **Playlog Analysis**: Use `Read` tool to read `playlog.jsonl` and analyze data from all turns
2. **Initial State Extraction**: Use `Read` tool to get initial parameters for each party from `world_initial.json`
3. **Data Conversion Processing**: Convert technical data to visual and analytical format

**Tool Execution**: Readable playlog file creation

- Create `playlog.md` with `Write` tool

**Recommended Playlog Structure**:

```markdown
# [Session Name] - Playlog Analysis

## 📊 Initial Party Status

### ⚔️ [Party Name 1]

**Base**: [location] | **Specialization**: [specialization]

| Parameter | Initial Value |
| --------- | ------------- |
| 💰 Currency | [value] |
| 🗡️ Combat Power | [value] |
| 🏃 Exploration Power | [value] |
| 🤝 Diplomacy Power | [value] |
| 📈 Morale | [value] |
| 📍 Position | [location] |

**Resources**: [materials list]

## 🌩️ Turn-by-Turn Change Log

### Turn X: [Event Name] [Emoji]

**GM Action**: [action_type]

#### 📍 Position Changes

- [party_icon] **[Party]**: [from] → [to] ([movement reason])

#### 🎭 Inter-Party Events

- [icon1][icon2] **[Party1] vs [Party2]**: [event_icon] **[Event Type]** - [detailed description]
  - 🏆 Result: [outcome] (when applicable)

#### 📈 Morale Changes
```

[Party1]: [from] → [to] ([change]) [arrow] [reason]
[Party2]: [from] → [to] ([change]) [arrow] [reason]

```

#### 🎒 Resource Changes
- [party_icon] **[Party]**: [resource] [from]→[to] ([change]) - [reason]

#### 📜 Quest Board
- **[Quest]**: [accepted by / progress / completed by / failed / expired] ([cause])

#### 🎲 Checks
- [party_icon] **[Party]** [check id]: [dice]+[modifier] = [total] (vs [rival] [total]) → **[success/partial/failure]**

#### 💰 Economic Activities (applicable turns only)
- [party_icon] **[Party]**: [transaction details]

**🎯 Key Events**: [key_events]

## 📊 Final Statistics

### 🏆 Guild Standings (by reputation)
1. [Party with highest reputation] ([reputation], [quests completed]) 🎖️ Promoted
2. [Second party]
3. [Third party]

### 🎲 Dice Summary
| Party | Checks | Success | Partial | Failure |
| ----- | ------ | ------- | ------- | ------- |

### 📈 Morale Fluctuation Graph
```

[ASCII graph showing morale trends]

```

### 🎯 Key Event Summary
- **Turn X**: [major_event_summary]

### 🏅 MVP Awards
- **🛡️ Best Defense**: [party] ([reason])
- **🕊️ Best Diplomacy**: [party] ([reason])
- **🌙 Best Persistence**: [party] ([reason])
```

**Creation Procedure**:

1. **Initial State Section**:

   - Organize each party's ability values and resources from `world_initial.json` in table format
   - Use emojis for visual clarity and easy understanding

2. **Turn-by-Turn Detail Section**:

   - Process each step in `playlog.jsonl` sequentially
   - Structure position changes, inter-party events, and morale/resource changes
   - Classify event types (combat, diplomacy, economy, espionage, etc.) with emojis
   - Describe each turn individually, prohibition of combining multiple turns

3. **Inter-Party Event Analysis**:

   - Extract relationship changes for each party from `worldStateDiff`
   - Describe combat results, cooperative relationships, economic transactions, etc. concretely
   - Clearly indicate results and impacts

4. **Statistics and Analysis Section**:
   - Visualize morale fluctuations with ASCII graphs
   - Faction rankings and final evaluation
   - Key event extraction and MVP selection

**Important Points**:

- **Emoji Utilization**: Make each faction, action, and resource easily identifiable with color-coded displays
- **Table Format**: Organize numerical data visually with tables and graphs
- **Chronological Tracking**: Clarify causal relationships and strategic changes in each turn
- **Technical → Narrative Conversion**: Transform JSON data into readable story format

**AI Agent Notes**:

- Maintain correspondence between playlog and narrative replay
- Analyze and record reasons for numerical changes and strategic intentions
- Objectively evaluate changes in power relationships between parties
- Display the importance and impact level of each turn in stages

### Phase 7: World Map Generation

**Purpose**: Create a comprehensive world map document from session world state data

**AI Agent Work**: Geopolitical map creation

1. **World State Analysis**: Use `Read` tool to load `world_initial.json` and extract region, connection, and faction information
2. **Geographic Relationship Analysis**: Understand regional placement and network structure from adjacency relationships (`neighbors`)
3. **Strategic Value Assessment**: Analyze importance of each region from resources, special effects, and influence
4. **Historical Context Integration**: Identify and correlate important event locations from `playlog.jsonl`

**Tool Execution**: World map file creation

- Create `world_map.md` with `Write` tool

**Recommended Map Structure**:

```markdown
# [Session Name] - World Map

## 🗺️ Regional Layout Diagram
```

[ASCII character terrain map]
⛰️ [Mountain Range] ⛰️ 🌪️ [Plains Name] 🌪️
| |
🏰 [Fortress Name] ───── ⚔️ [Strategic Point] ⚔️
| |
💰 [City Name] ───── 🔮 [Cave Name] 🔮

```

## 📊 Regional Directory

### 🏰 [Region Name]
**Type**: [type] | **Capacity**: [capacity] | **[Faction] Base**

| Element | Details |
|---------|--------|
| 📍 **Adjacent Regions** | [neighbors list] |
| 🎒 **Resources** | [resources list] |
| ⭐ **Special Effects** | [specialEffects list] |
| 👑 **Controlling Faction** | [occupant] (Influence: [influence]) |
| 🎯 **Strategic Value** | [strategic_analysis] |

## 🏛️ Sphere of Influence Analysis

### [Faction Name]
- **🏠 Home Base**: [base_region]
- **🎯 Conquest Target**: [target_region]
- **🛡️ Strategy**: [strategy_description]

## 📈 Transportation & Supply Routes

### 🛤️ Major Roads
1. **[Route Name]**: [region1] ↔ [region2] ↔ [region3]

### 🚛 Supply Line Vulnerabilities
- **[Important Region]**: [vulnerability_analysis]

## 🎭 [Session Name] Important Event Locations

### ⚔️ Turn X-Y: [Event Name]
- **Location**: [region_name]
- **Event**: [event_description]
- **Result**: [outcome]

## 🌩️ World Threats and Opportunities

### ⚡ [Neutral Faction Name]
- **Nature**: [faction_nature]
- **Influence**: [impact_description]
- **Active Regions**: [active_regions]

### 🔮 Ancient Artifacts
- **[Artifact Name]**: [description_and_power]

## 🎯 Strategic Key Points Summary

1. **🏆 Keys to Victory**: [victory_conditions]
2. **💰 Economic Dominance**: [economic_control_points]
3. **🔮 Technological Advantage**: [tech_advantages]
```

**Creation Procedure**:

1. **Regional Data Extraction**:

   - Obtain all regional information from the `regions` object in `world_initial.json`
   - Organize each region's `type`, `neighbors`, `resources`, `specialEffects`
   - Understand faction placement from `occupantParties` and `influence`

2. **Geographic Placement Analysis**:

   - Build adjacency relationship graph from `neighbors` array
   - Identify regions with high centrality (connection count) as strategic points
   - Assign appropriate emojis by terrain type

3. **Strategic Analysis**:

   - Identify spheres of influence from each party's `location`
   - Evaluate regional value from `resources` and `specialEffects`
   - Correlate important events from playlog with regions

4. **Visualization Implementation**:
   - Create regional layout diagram with ASCII characters
   - Organize regional detail data in table format
   - Color-code terrain, factions, and events with emojis

**Important Points**:

- **Geopolitical Perspective**: Emphasize strategic value and factional relationships, not just a simple map
- **Historical Integration**: Connect important events from playlog with regions
- **Visual Clarity**: Promote intuitive understanding with ASCII diagrams and emojis
- **Strategic Insight**: Analyze each faction's intentions and world dynamics

**AI Agent Notes**:

- Accurately correlate important events from playlog with regions
- Analyze each faction's strategic intentions from a geopolitical perspective
- Build worldview considering the influence of neutral factions and ancient artifacts
- Evaluate complex balance of economy, military, diplomacy, and magic
- Ensure consistency between world map and narrative replay/playlog
