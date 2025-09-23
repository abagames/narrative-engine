# Repository Guidelines

This repo hosts the Narrative Engine. It implements a region graph-based life simulation engine with complex economic, social, and exploration mechanics. AI coding agents (e.g. Claude Code) act as autonomous TRPG GM/Player to generate narrative logs through automated gameplay.

## Project Structure & Module Organization

- `prompts/` — AI decision framework files (all documents used by AI agents)
  - **AI Agent Workflow:**
    - `AI_AGENT_FILE_WORKFLOW.md` - File-based autonomous execution workflow for AI coding agents (complete autonomous session execution procedures using file I/O only)
  - **Core Decision Frameworks:**
    - `GM_CORE_MIND.md` - GM thinking framework (NPC actions, environmental control)
    - `PLAYER_MIND.md` - Player thinking framework (character decisions, tactical evaluation)
  - **Combat & Interaction Systems:**
    - `INDIVIDUAL_COMBAT_SYSTEM.md` - Individual combat system framework
    - `TACTICAL_PATTERNS.md` - Tactical pattern definitions
    - `DIALOGUE_SYSTEM.md` - Character dialogue system
    - `NPC_PERSONALITIES.md` - NPC personality patterns
  - **Multi-Party & Social Systems:**
    - `GUILD_MANAGEMENT.md` - Guild management system
    - `ALLIANCE_STRATEGY.md` - Alliance strategy
    - `QUEST_MANAGEMENT.md` - Quest management system
    - `ACHIEVEMENT_PURSUIT.md` - Achievement pursuit system
    - `COMPETITIVE_EVENTS.md` - Competitive events
  - **Novel Generation System:**
    - `PARTY_PERSPECTIVE_NOVEL_CONVERSION.md` - Party perspective novel conversion (main process)
    - `CHARACTER_PERSONALITY_TEMPLATES.md` - Character personality templates (integrated multi-party strategy and negotiation patterns)
    - `NOVEL_CONVERSION_EXAMPLES.md` - Novel conversion examples and quality checklist
- `autonomous_sessions/` — Standard directory for AI agent file-based autonomous execution

  - `sessions/session_YYYYMMDD_HHMMSS/` — Session management (world state, play logs, narratives)
  - `ai_workspace/` — AI agent workspace (decision request/response files, world state snapshots)

- `src/` — tools source code
- `test/` — unit tests
- `dist/` — build output

## Autonomous TRPG Execution Mode

AI coding agents must follow the **complete workflow** defined in `prompts/AI_AGENT_FILE_WORKFLOW.md` for autonomous session execution. This includes file-based state management, decision processing phases, and narrative generation procedures.

### Decision Framework Usage

AI coding agents must **actively consult and apply** the appropriate decision frameworks:

**Before each action, determine your perspective:**

- **When NPCs act**: Read `prompts/GM_CORE_MIND.md` and apply the GM thinking framework
- **When player characters act**: Read `prompts/PLAYER_MIND.md` and apply character-specific judgment criteria
- **When individual combat occurs**: Read `prompts/INDIVIDUAL_COMBAT_SYSTEM.md` and process detailed sword and magic combat at the individual party member level
- **For tactical decisions in combat**: Use `prompts/TACTICAL_PATTERNS.md` to select tactical patterns and determine optimal actions based on the situation
- **For dialogue generation in combat**: Use `prompts/DIALOGUE_SYSTEM.md` to generate combat dialogue appropriate to character personalities
- **For social systems**: Manage guild, alliance, quest, achievement, and competitive systems using `prompts/GUILD_MANAGEMENT.md`, `prompts/ALLIANCE_STRATEGY.md`, `prompts/QUEST_MANAGEMENT.md`, `prompts/ACHIEVEMENT_PURSUIT.md`, `prompts/COMPETITIVE_EVENTS.md`
- **For multi-party strategy**: Reference multi-party strategy, negotiation patterns, and trust management integrated in `prompts/CHARACTER_PERSONALITY_TEMPLATES.md`
- **For exploration coordination**: Reference exploration coordination management integrated in `prompts/GM_CORE_MIND.md`

### Core Execution Principles

#### Framework Application

- **MUST READ FRAMEWORKS**: Always read and apply either `prompts/GM_CORE_MIND.md` or `prompts/PLAYER_MIND.md` each turn. Use related supplementary documents as needed
- **AI AGENT DECISION MAKING**: AI agents read frameworks each turn and actually apply evaluation criteria and calculation formulas for decision-making
- **FRAMEWORK-DRIVEN EVALUATION**: Perform numerical evaluations according to the judgment frameworks in each prompt and select the action with the highest score
- **DECISION ISOLATION**: AI agent thinking and judgment processes are not automated by tools; AI agents directly apply frameworks for execution

#### Combat & Interaction Systems

- **INDIVIDUAL COMBAT**: During `conflict` actions, read `prompts/INDIVIDUAL_COMBAT_SYSTEM.md` and fully execute sword and magic combat at the individual party member level
- **TACTICAL COMBAT**: During combat, evaluate and select tactical patterns using `prompts/TACTICAL_PATTERNS.md` and generate dialogue appropriate to personalities using `prompts/DIALOGUE_SYSTEM.md`
- **COMBAT DETAIL REQUIREMENT**: During combat, fully record individual sword strikes, magic incantations, and damage rather than abstract results

#### Life Simulation & Social Systems

- **LIFE SIMULATION**: In region-based systems, utilize social system documents like `prompts/GUILD_MANAGEMENT.md` to execute economic, diplomatic, and exploration activities
- **PERSISTENT STATE MANAGEMENT**: Persist all states and decisions to files and manage them using the `autonomous_sessions/` directory structure

### Tool Usage Policy

#### Allowed Tools

- **File-based persistence tools**: `start_session.ts`, `process_ai_responses.ts`, `append_playlog.ts`, `generate_next_turn.ts`, `finalize_session.ts` are permitted for world state and play log recording

#### Forbidden Tools & Practices

- **Pre-programmed AI decision logic**: Prohibited use of makeGMDecision, executePlayerPhase, etc.
- **Automated game loops**: Prohibited use of demo_session.js, etc.
- **Demo code generation**: Prohibited implementation of new automation scripts
