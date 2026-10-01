# Narrative Engine

[English | [日本語](README_ja.md)]

## 🎮 Project Overview

**A project where AI creates games and AI plays them, allowing humans to watch game replays without doing anything**

Narrative Engine is an AI-driven fully autonomous TRPG system. AI coding agents (Codex, Claude Code, etc.) function as both Game Master (GM) and players, executing and recording complete TRPG sessions without human intervention.

## 📖 Sample Replays

The following directories contain replays of TRPG sessions actually generated and executed by AI agents:

### Thunder Storm Campaign ([View](https://abagames.github.io/narrative-engine/thunder_storm_campaign/))

- **Directory**: [`docs/thunder_storm_campaign/`](docs/thunder_storm_campaign/)
- **Content**: A fully autonomous TRPG session depicting adventures in a storm
- **Features**: Comprehensive campaign including weather systems, environmental changes, and party coordination tactics

![replay_screenshot](docs/thunder_storm_campaign/screenshot.png)

### Eiroku Mist Chronicles ([View](https://abagames.github.io/narrative-engine/eiroku_mist_chronicles/))

- **Directory**: [`docs/eiroku_mist_chronicles/`](docs/eiroku_mist_chronicles/)
- **Content**: A Sengoku-era campaign chronicling four rival factions navigating mist-laden provinces during the chaotic Eiroku period
- **Features**: Focus on multi-faction espionage, onmyōdō barrier warfare, and technological brinkmanship between ninja clans and engineering institutes

### Triple Light Linked Ring ([View](https://abagames.github.io/narrative-engine/triple_light_linked_ring/))

- **Directory**: [`docs/triple_light_linked_ring/`](docs/triple_light_linked_ring/)
- **Content**: A mystical adventure session revolving around three rings of light
- **Features**: Includes complex magic systems, puzzle elements, and character progression systems

### 🚀 Concept

- **AI-driven game generation and execution**: AI builds game systems and simultaneously plays those games
- **Digitization of paper-based tools**: Toolification of TRPG character sheets, dice, rulebooks, etc.
- **Prompt-driven rule system**: Uses documents in the `prompts/` directory as rulebooks
- **Fully autonomous execution**: Executes multi-turn sessions without human operation
- **Real-time spectating**: Humans can enjoy stories through generated narrative logs

## 🏗️ System Architecture

### Quest-Driven World Simulation

Parties compete and cooperate over guild quests in a region graph. AI agents decide what their characters attempt; the engine decides what happens.

- **Quest Board**: Exclusive races, joint quests split by effort, colliding quests that cannot both succeed, clients with hidden motives
- **Engine Adjudication**: Uncertain attempts are declared as checks with success / partial / failure effects written before a seeded 2d6 roll. Resubmitting cannot reroll
- **Permissions & Invariants**: Parties change only their own state; harming a rival requires an opposed check; quest progress comes only from checks; responses apply all-or-nothing
- **World Pressure**: Deadlines expire, progress clocks advance and trigger, failed quests escalate; consequences stand
- **Unequal Information**: Parties see a public quest board, rough rival progress and their own (possibly false) knowledge; the GM sees everything
- **Season & Standings**: Reputation from quests decides who is promoted at season end
- **Draft**: Before the season and at mid-season, heroes pick the one quest they will pursue (shared quests become races; joint quests can come with an invitation), recruits, unique items and intel in snake order; picks are public reactions to each other, and order can be bought with favors
- **Regional & Social Systems**: Movement along the region graph, relationships, favors owed, NPC clients who remember; the market is optional background

### AI Agent Thinking Framework

#### GM Thinking Framework ([prompts/GM_CORE_MIND.md](prompts/GM_CORE_MIND.md))

- **Environmental Control**: NPC behavior, trap activation, weather changes
- **Battle Assessment**: Numerical combat analysis, tactical advantage determination
- **Narrative Direction**: Creating tension, dramatic presentation, pacing adjustment
- **Difficulty Adjustment**: Challenge levels according to player proficiency

#### Player Thinking Framework ([prompts/PLAYER_MIND.md](prompts/PLAYER_MIND.md))

- **Character Personality**: Distinctive thinking patterns for Fighter, Wizard, Rogue, etc.
- **Tactical Optimization**: Optimal action selection through numerical calculation
- **Cooperative Play**: Coordination tactics between party members
- **Risk Assessment**: Action risk-return analysis

### Specialized Systems

#### Combat System

- **Individual Combat** ([prompts/INDIVIDUAL_COMBAT_SYSTEM.md](prompts/INDIVIDUAL_COMBAT_SYSTEM.md)): Detailed sword and magic combat
- **Tactical Patterns** ([prompts/TACTICAL_PATTERNS.md](prompts/TACTICAL_PATTERNS.md)): Situation-specific optimal tactical selection
- **Dialogue System** ([prompts/DIALOGUE_SYSTEM.md](prompts/DIALOGUE_SYSTEM.md)): Combat dialogue according to character personalities

#### Social & Management Systems

- **Guild Management** ([prompts/GUILD_MANAGEMENT.md](prompts/GUILD_MANAGEMENT.md)): Guild operations, member management
- **Alliance Strategy** ([prompts/ALLIANCE_STRATEGY.md](prompts/ALLIANCE_STRATEGY.md)): Diplomacy with other parties
- **Quest Management** ([prompts/QUEST_MANAGEMENT.md](prompts/QUEST_MANAGEMENT.md)): World data model, checks, permissions, quest lifecycle, stop conditions
- **Competitive Events** ([prompts/COMPETITIVE_EVENTS.md](prompts/COMPETITIVE_EVENTS.md)): Inter-party competition

#### Narrative Generation

- **Novel Conversion** ([prompts/PARTY_PERSPECTIVE_NOVEL_CONVERSION.md](prompts/PARTY_PERSPECTIVE_NOVEL_CONVERSION.md)): Converting play logs to readable stories
- **Character Personality** ([prompts/CHARACTER_PERSONALITY_TEMPLATES.md](prompts/CHARACTER_PERSONALITY_TEMPLATES.md)): Consistent personality expression

## 🔧 Technical Implementation

### File-Based Game State Recording

```
autonomous_sessions/
├── inputs/                      # AI Agent input files
│   ├── world_initial.json      # Initial world state
│   └── session_config.json     # Session configuration
├── sessions/                    # Session management
│   └── session_YYYYMMDD_HHMMSS/
│       ├── world_current.json  # Current world state
│       ├── playlog.jsonl       # Play log (action records)
│       └── narrative.md        # Generated story
└── ai_workspace/               # AI workspace
    ├── decision_requests/      # Decision request files
    ├── decision_responses/     # Decision response files
    └── world_snapshots/       # World state snapshots
```

### Main Tools

| Tool                                                     | Function                                     |
| -------------------------------------------------------- | -------------------------------------------- |
| [`start_session.ts`](src/start_session.ts)               | Session initialization, world state creation |
| [`process_ai_responses.ts`](src/process_ai_responses.ts) | Validate permissions, roll checks, update world state, resolve quests |
| [`generate_next_turn.ts`](src/generate_next_turn.ts)     | Generate next turn, create decision requests |
| [`append_playlog.ts`](src/append_playlog.ts)             | Record play log, add narrative               |
| [`finalize_session.ts`](src/finalize_session.ts)         | Session completion processing, season standings |
| [`world_rules.ts`](src/world_rules.ts)                   | Engine rules used by the tools: dice, permissions, invariants, quests, clocks |
| [`draft.ts`](src/draft.ts)                               | Draft rules: order, favor swaps, picks, invitations, leftovers |
| [`turn_context.ts`](src/turn_context.ts)                 | Decision request context (public quest board for parties, full board for GM) |

## 🎯 Execution Workflow

### Phase 1: Session Initialization

1. **Input file preparation**: AI creates initial world state and session configuration
2. **Session start**: Build session environment with `start_session.ts`
3. **Initial decision request**: Generate decision request file for the first turn

### Phase 2: Turn Execution Loop

1. **Framework loading**: Select and apply appropriate thinking framework
2. **Situation analysis**: Numerically evaluate current world state and party situation
3. **Action decision**: Select optimal actions according to framework
4. **Decision processing**: Process decisions with `process_ai_responses.ts`, update world state
5. **Narrative generation**: Record action results as story
6. **Next turn preparation**: Generate next decision request with `generate_next_turn.ts`

### Phase 3: Session Completion

1. **Final processing**: Complete session with `finalize_session.ts`
2. **Result output**: Output completed narrative and play log
