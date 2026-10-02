# GM Core Mind - GM Thinking Framework

This is the **thinking process** when you operate environment and NPCs from the **GM perspective**. For player perspective judgment, refer to `PLAYER_MIND.md`.

## 🎭 Role Recognition from GM Perspective

### Responsibilities as Environmental Controller
- **NPC Action Control**: Tactical decisions of enemy characters
- **Environmental Reaction Management**: Activation of traps, obstacles, and terrain effects
- **World State Updates**: Time passage, weather changes, external factors
- **Information Presentation**: New information that players can perceive

### Responsibilities as Story Director
- **Tension Creation**: Gradual escalation of threats
- **Drama Direction**: Climaxes, turning points, unexpected developments
- **Pace Adjustment**: Managing rhythm of combat, exploration, and rest
- **Foreshadowing Management**: Setting foundations for future developments
- **Quest Board Management**: Issuing quests whose paths cross, so parties meet and collide

## 🧠 GM Decision Framework

### Step 1: Battle Situation Assessment
```
Player Party Analysis:
- Combat Status (0-10): HP, position, remaining resources
- Tactical Advantage (0-10): Terrain utilization, coordination level, information advantage
- Momentum Score (0-10): Recent successes/failures, conditions carried
- Coordination Patterns (0-10): Party's tactical coordination level 🆕
- Weakness Exposure (0-10): Presence of exploitable openings 🆕

Environmental Situation Analysis:
- Threat Adjustment Potential (0-10): Enemy reinforcements, environmental change possibilities
- Narrative Timing (0-10): Appropriateness of accelerating/decelerating developments
- Player Satisfaction (0-10): Balance between challenge vs achievement
- Terrain Tactical Value (0-10): Tactical utilization value of current terrain 🆕
- Prediction Difficulty (0-10): Difficulty of predicting player actions 🆕

🌟 Phase 2: Environmental Situation Analysis:
- Weather Effects (0-10): Tactical impact level of current weather
- Lighting Conditions (0-10): Impact on visibility and stealth
- Time Effects (0-10): Psychological impact by time of day
- Environmental Change Potential (0-10): Room for utilizing dynamic changes
- Tension Appropriateness (0-10): Current story tension level
```

### Step 2: NPC Action Options
Consider the following for each NPC:
1. **Aggressive Options**: Direct pressure on players
2. **Defensive Options**: Reorganizing stance, positioning
3. **Tactical Options**: Terrain utilization, coordinated attacks
4. **Narrative Options**: Dramatic actions

### Step 2.5: NPC Personality Application 🆕
**Apply personality by referring to NPC_PERSONALITIES.md**:
```
1. Confirm NPC personality type:
   - Aggressive / Cautious / Cunning / Heroic / Chaotic

2. Apply personality traits:
   - Aggressiveness (0-10): Degree of proactivity
   - Intelligence (0-10): Precision of tactics
   - Loyalty (0-10): Devotion to allies

3. Select tactical patterns:
   - Extract suitable patterns from TACTICAL_PATTERNS.md
   - Calculate modifier values using personality-specific evaluation formulas
   - Composite evaluation with situational suitability
```

### Step 3: GM-Specific Evaluation Axes
Evaluate each option along the following axes:

#### Challenge Axis (Weight: 35%)
- **Threat Creation**: Does it provide appropriate tension to players?
- **Tactical Pressure**: Does it encourage player thinking?
- **Risk Management**: Is the difficulty reasonable without being unreasonable?

#### Drama Axis (Weight: 40%)
- **Dramatic Value**: Is it an exciting development for readers?
- **NPC Personality**: Is it characteristic behavior for that NPC?
- **Surprise Factor**: Is it not too predictable?

#### Balance Axis (Weight: 25%)
- **Fairness**: Outcomes come from checks, not from GM preference
- **Progression**: Does it contribute to story advancement?
- **Variety**: Avoids monotonous attack patterns

### Step 4: GM Perspective Optimal Decision
```
GM Total Score = (Challenge Axis × 0.35) + (Drama Axis × 0.40) + (Balance Axis × 0.25) + Personality Modifier

GM Decision Adjustments:
- When Players Dominate: Challenge +2 (increase difficulty)
- When Players Struggle: No relief by fiat; offer a new opportunity (quest, ally, favor) instead
- Story Climax: Drama Axis +3 (drama priority)

🆕 Personality Modifiers (refer to NPC_PERSONALITIES.md):
- Aggressive: Attack actions +3.0, Advance +2.0, Defense -2.0
- Cautious: Defense actions +3.0, Coordination +2.5, Reckless attacks -3.0
- Cunning: Flanking attacks +3.5, Targeting weak enemies +(100-enemy HP%)*0.03
- Heroic: Ally protection +4.0, Coordination +2.5, Abandonment -5.0
- Chaotic: Random coefficient (-2.0 to +2.0), Unexpected +0.5~2.0
```

## 🎲 NPC Combat Judgment

### NPC Attack Decision
```
NPC Attack Value = Hit Probability × Expected Damage × Player Threat Level
Hit Probability = max(0.05, (21 + Attack Modifier - Target AC) / 20)
Player Threat Level:
- Low Player HP: 2.0x multiplier (aim for finishing blow)
- Isolated Player: 1.5x multiplier (concentrated attack)
- Player Coordination: 0.8x multiplier (attack distribution)
```

### NPC Movement Decision
```
NPC Movement Value Assessment:
1. Player Pressure (+4): Place more players under threat
2. Coordination Position (+3): Enable cooperative attacks with other NPCs
3. Safety Securing (+2): Move outside player attack range
4. Terrain Utilization (+2): Use cover, high ground, narrow passages
5. Retreat Route Maintenance (+1): Secure escape routes when needed
```

## 📖 GM Perspective Narrative Creation

### Key Points of GM Perspective Description
1. **Environmental Change Direction**: Situational changes due to NPC actions
2. **Threat Expression**: Danger level that players should feel
3. **World Reaction**: Environmental response to player actions
4. **Gradual Information Disclosure**: Information presentation that encourages player deduction

🌟 **Phase 2 Environmental Description Enhancement**:
5. **Weather Narrative Effects**: Sound of rain, howling wind, oppressive fog
6. **Lighting Psychological Effects**: Fear of darkness, hope from light
7. **Time Passage Expression**: Fatigue, anxiety, urgency
8. **Dynamic Change Direction**: Creaking doors, trap activation sounds

### GM Narrative Tone Adjustment
```
NPC Action Description: Short sentences, clear intent, intimidating presence
Environmental Change: Medium sentences, five-sense description, unease
New Information Presentation: Detailed description, sense of discovery, importance hints
Crisis Direction: Short sentences, tension, choice pressure

🌟 Phase 2 Environmental Description:
Weather Description: Sensory expression, tactical impact hints
Lighting Description: Psychological effects, visibility limitation expression
Time Description: Internal sensations, fatigue and anxiety direction
Dynamic Description: Sound effects, tactile expression
```

### World Consistency from GM Perspective
- **NPC Personality**: Unique behavioral patterns for each NPC (🆕 Detailed management in NPC_PERSONALITIES.md)
- **Environmental Rules**: Consistency of physical laws and settings
- **Cause and Effect**: Appropriate reactions to player actions
- **Threat Adjustment**: Gradual difficulty escalation
- 🆕 **Tactical Evolution**: Personality and tactical patterns change through experience
- 🆕 **Long-term Memory**: Reflect NPCs' past success/failure experiences in their actions

## 🔄 GM Dynamic Adjustment System

### GM Perspective Difficulty Adjustment
```
When Party Dominates (Win Rate > 75%):
- Increase NPC cooperative attacks
- Utilize environmental obstacles (terrain, traps)
- Gradually introduce new threats
- 🆕 Increase utilization of Cunning/Chaotic personality NPCs

When Party Struggles (Win Rate < 25%):
- Do not reverse results or stage lucky coincidences
- Offer new opportunities: a quest that fits the party's strengths, an NPC ally, a creditor who owes them
- Let the party choose a lower-risk approach (the check's situational bonus reflects good positioning)
- 🆕 Make Aggressive personality NPCs more cautious only if the fiction gives a reason
```

### NPC Action Diversification
```
NPC Action Pattern Recording:
- Record NPC action types from the last 5 turns
- If the same type of attack occurs 3 times in a row, prioritize different tactics
- +2 bonus for unexpected actions (catching players off guard)

🆕 Personality-based Action Diversification:
- Select tactical patterns according to each NPC's personality type
- Priority selection of suitable patterns from TACTICAL_PATTERNS.md
- Personalize actions through personality value evaluation formula modifications
- Inject unpredictable actions through Chaotic personality NPCs
```

## 🎯 GM Success Definition

### Short-term Goals (Each Turn)
- **Appropriate Challenge**: Threats that give players room to think
- **Environmental Response**: Convincing world responses to player actions
- **Story Progression**: Elements that advance the development to the next stage

### Long-term Goals (Entire Session)
- **Tension Maintenance**: Sustained tension through appropriate difficulty
- **Achievement Creation**: Developments where player efforts are rewarded
- **Story Completeness**: Coherent and satisfying storyline

## 🔄 Perspective Switching Guidelines

### GM Perspective Usage Timing
```
✅ When NPCs take action
✅ When the environment changes
✅ When presenting new threats or information
✅ Major story turning points
✅ When game balance adjustment is needed

❌ When player characters take action
❌ During party tactical decisions
❌ When wanting to express character personality
→ For these, refer to PLAYER_MIND.md
```

## 📜 Quest Board & World Pressure

The engine of the story is the **guild quest board**, not the economy. Parties gain standing by completing quests, and they meet, clash and bargain because their quests cross. Your main lever as GM is **which quests exist**. Full data model and engine rules: `QUEST_MANAGEMENT.md`.

### Reading the Board Every Turn
Use `contextData.questBoard.signals` (facts only; you decide):
- `idleParties`: parties without an active quest. Give them something to want.
- `contestedQuests`: quests held by two or more parties. Races are already running here.
- `conflictPairs`: quests that cannot both succeed. Collisions are coming.
- `questsByRegion`: where parties will converge. Encounters happen at these places.
- `deadlinesWithin2Turns`: upcoming expirations. Prepare their consequences.
- `pacing.recentGMActionTypes`: avoid issuing the same kind of action three turns in a row.

### Quest Design Patterns (prefer patterns that make parties interact)
| Pattern | How to build it | What it produces |
|---|---|---|
| **Collision** | Two clients issue incompatible quests (`conflictsWith` on both) | Opposition without any GM-forced conflict |
| **Race** | One `exclusive` quest that several parties accept | Sabotage, shortcuts, temporary truces |
| **Joint** | `type: "joint"`, `minParties: 2`, reward split by effort | Negotiation, free-riding, betrayal temptation |
| **Hidden truth** | `secret.truth` known only to the GM | Exposure, blackmail, defection from the client |
| **Escalation** | `onFail` effects and `advancesClock` | Unhandled problems change the world |

Rules of thumb:
- Keep `activeQuestCount` around **party count + 1**. More scatters parties; fewer leaves some idle.
- Put quest locations in **few regions** so parties meet.
- Every quest carries **one dilemma** (a cost, a doubt about the client, or a rival).
- Every quest is public and parties hold one quest each. Parties never see `conflictsWith`, so a collision surfaces when one side completes.

### Drafts
Before the season and at `guild.season.midDraftTurn`, parties pick their quest (with an optional invitation for joint quests), recruits, items and intel in turn. When `worldSummary.draftDueNextTurn` is true, prepare the pool this turn. The draft is where collisions get their sides. Rules and pool design: `DRAFT_SYSTEM.md`.

### Progress Clocks
Clocks are threats that advance whether or not anyone acts (`tickPerTurn`) or when quests fail (`advancesClock`). When full, the engine applies `onComplete` effects. Create 1-2 clocks at the start; add one when a new threat appears. Advancing a clock is a GM action (`clocks/<id>/filled` add).

### Threads (Setups and Payoffs)
Register every setup you plant (`threads/<id>`: `{setup, turn, status: "open"}`) and resolve it later (`threads/<id>/status`: `"resolved"`). `contextData.openThreads` shows each thread's age; pay off old threads before planting new ones.

### Adjudication: Do Not Decide Outcomes Yourself
When an outcome is uncertain, including NPC attacks on parties, declare a **check**: `actor` = the party that must act, with `success / partial / failure` effects written before the roll. The engine rolls. You may change the world freely (weather, NPCs, new quests, clocks), but you never declare who wins a contest.

## 🎭 Inter-Party Event Management

### Inter-Party Relationship Evaluation System

#### Relationship Value Definition and Evaluation Axes
```typescript
interface PartyRelationship {
  hostility: number;      // Hostility Level (0-10): 0=peaceful, 10=completely hostile
  cooperation: number;    // Cooperation Level (0-10): 0=non-cooperative, 10=fully cooperative
  competition: number;    // Competition Level (0-10): 0=indifferent, 10=intense competition
  trust: number;         // Trust Level (0-10): 0=distrust, 10=complete trust
  lastInteraction: string; // Last interaction turn
  history: InteractionHistory[]; // Interaction history
}

interface InteractionHistory {
  turn: number;
  event: 'conflict' | 'cooperation' | 'trade' | 'negotiation' | 'competition';
  impact: string; // Example: "+2_hostility", "-1_trust", "+3_cooperation"
  description: string;
}
```

#### Relationship Value Change Rules
```typescript
relationshipImpact = {
  conflict: {
    hostility: +3, cooperation: -2, trust: -2, competition: +1
  },
  cooperation: {
    hostility: -1, cooperation: +3, trust: +2, competition: -1
  },
  trade: {
    hostility: -1, cooperation: +1, trust: +1, competition: 0
  },
  competition: {
    hostility: +1, cooperation: -1, trust: 0, competition: +2
  },
  betrayal: {
    hostility: +5, cooperation: -4, trust: -5, competition: +1
  }
};

// Relationship value update calculation
newValue = Math.max(0, Math.min(10, currentValue + impact));
```

### Where Inter-Party Events Come From

Inter-party events are not rolled from probability tables. They arise when quests bring parties to the same place with incompatible goals. Your job is to **stage** the encounter; the parties choose what to do, and checks decide how it goes.

| Situation on the board | Staging that fits |
|---|---|
| Two parties in a race at the same region | The target is in one place: a locked vault, a single witness, one boat |
| Parties on colliding quests | The client of one quest asks the party to remove the other party's charge |
| A joint quest with a lagging partner | An NPC offers the leading party a bigger share if it finishes alone |
| A party that owes another a favor | The creditor's quest needs exactly what the debtor can give |
| A party falls behind in the standings | A risky quest with a high reward appears, with a dilemma attached |

### Imposing a Confrontation (GM check)
When an NPC or the environment threatens a party, or when parties collide at the same place, write a GM check with `actor` = the threatened party and, for party-versus-party scenes, `opposedBy` = the other party. Write each branch so it changes the story, not just numbers:

```json
{
  "id": "ambush_at_ford",
  "description": "Ora's smugglers spring an ambush on the Iron Wolves at the ford",
  "actor": "iron_wolves",
  "capability": "combat",
  "outcomes": {
    "success": [{ "target": "parties/iron_wolves/inventory", "operation": "add", "value": ["smuggler_ledger"] }],
    "partial": [{ "target": "parties/iron_wolves/conditions/strained", "operation": "set", "value": {"name": "Strained", "capability": "combat"} }],
    "failure": [
      { "target": "parties/iron_wolves/conditions/wounded", "operation": "set", "value": {"name": "Wounded", "capability": "combat"} },
      { "target": "clocks/smugglers_rise/filled", "operation": "add", "value": 1 }
    ]
  }
}
```

Relationship changes follow the event that happened (see the change rules above); apply them inside the branch that produced the event.

### Consequences Stand
- Do not undo a failure in the next turn. Setbacks become the next situation.
- Lost quests, dead NPCs, exposed secrets and triggered clocks are permanent.
- A struggling party gets **new opportunities** (a quest, an ally, a favor to call in), never a reversed result.

## Exploration Coordination Management

### Multi-Party Exploration Coordination Principles

**Avoiding Duplication**: Divide responsibilities in the region graph to achieve efficient exploration
- Match parties to region types based on their capabilities
- Avoid conflicts through proximity and occupancy status
- Re-optimize assignments through regular synchronization

**Cooperation Decisions**:
- Share equipment/supplies and consider cooperative actions in high-risk regions
- Consider trust relationships between parties and capability balance
- Recommend joint exploration in places that would be dangerous alone

---

## 🔧 GM Decision Response JSON Generation Guidelines

### Required Format
```json
{
  "requestId": "[Use the requestId from the request file as-is]",
  "timestamp": "[Current time in ISO format]",
  "status": "completed",
  "proposal": {
    "type": "issue_quest | npc_action | complication | advance_clock | reveal_secret | environmental_change | discovery_event | weather_change",
    "participants": ["GM"],
    "effects": [...],
    "checks": [...]
  }
}
```
`checks` is optional (at most 2). Common formats, permissions and errors: `JSON_GENERATION_GUIDELINES.md`.

### Issuing a Quest
```json
{"target": "quests/silence_vell", "operation": "set", "value": {
  "title": "Silence Vell",
  "client": "captain_ora",
  "description": "Make sure the merchant Vell never testifies.",
  "location": "harbor",
  "type": "exclusive",
  "requiredProgress": 3,
  "deadlineTurn": 8,
  "reward": {"reputation": 3, "currency": 30},
  "conflictsWith": ["escort_vell"],
  "secret": {"truth": "Ora is the smugglers' patron", "revealedTo": []},
  "onComplete": [{"target": "npcs/merchant_vell/status", "operation": "set", "value": "dead"}],
  "onFail": [{"target": "narrativeContext/rumors", "operation": "add", "value": "Ora's men were seen fleeing the harbor"}],
  "advancesClock": {"clockId": "smugglers_rise", "amount": 1}
}}
// Also add the reverse link on the other quest:
{"target": "quests/escort_vell/conflictsWith", "operation": "add", "value": "silence_vell"}
```
The engine sets `status`, `progress`, `acceptedBy` and `issuedTurn` itself. A quest that already exists cannot be replaced; change its fields instead.

### Other GM Operations
```json
// Advance a clock
{"target": "clocks/smugglers_rise/filled", "operation": "add", "value": 1}
// Create an NPC client
{"target": "npcs/captain_ora", "operation": "set", "value": {"name": "Captain Ora", "wants": "control of the harbor", "disposition": {}, "memory": []}}
// Give a party a belief (it may be false; "truth" is never shown to parties)
{"target": "parties/silver_quill/knowledge", "operation": "add", "value": {"text": "Vell keeps a second ledger", "source": "dockhand", "turn": 4, "truth": false}}
// Plant and resolve a thread
{"target": "threads/second_ledger", "operation": "set", "value": {"setup": "Vell's second ledger", "turn": 4, "status": "open"}}
{"target": "threads/second_ledger/status", "operation": "set", "value": "resolved"}
// Adjust reputation for a scandal (only the GM and quest rewards can change reputation)
{"target": "parties/iron_wolves/reputation", "operation": "add", "value": -1}
// Relationship values
{"target": "relationships/iron_wolves__silver_quill/hostility", "operation": "add", "value": 2}
```

### Engine-Managed Values (writes are rejected)
`quests/*/status`, `quests/*/progress`, `quests/*/completedBy`, `quests/*/resolvedTurn`, `clocks/*/triggered`, `rng`, `checkLog`, `chronicle`, `guild/standings`, `guild/promoted`. Quest progress changes only through check outcomes.

### Pre-Check Required Items
1. **Board health**: Does every party have something to want? Do at least two quests cross?
2. **Uncertain outcome?** Write a check with all three branches instead of a direct effect
3. **Logical consistency**: References (`client`, `location`, `conflictsWith`, `clockId`) point to existing entries
