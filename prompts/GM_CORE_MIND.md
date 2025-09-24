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

## 🧠 GM Decision Framework

### Step 1: Battle Situation Assessment
```
Player Party Analysis:
- Combat Status (0-10): HP, position, remaining resources
- Tactical Advantage (0-10): Terrain utilization, coordination level, information advantage
- Momentum Score (0-10): Recent successes/failures, morale status
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
- **Fairness**: Avoids one-sided developments
- **Progression**: Does it contribute to story advancement?
- **Variety**: Avoids monotonous attack patterns

### Step 4: GM Perspective Optimal Decision
```
GM Total Score = (Challenge Axis × 0.35) + (Drama Axis × 0.40) + (Balance Axis × 0.25) + Personality Modifier

GM Decision Adjustments:
- When Players Dominate: Challenge +2 (increase difficulty)
- When Players Struggle: Challenge -1 (relief element)
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
- Direct NPC tactical mistakes
- Provide environmental aid (discovering advantageous terrain, etc.)
- Direct fortunate coincidences
- 🆕 Make Aggressive personality NPCs more cautious
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

### Event Trigger Determination Framework

#### Step 1: Party Pair Relationship Analysis
```typescript
partyPairAnalysis = evaluateAllPairs({
  parties: activeParties,
  relationships: currentRelationships,
  proximity: geographicalDistance,
  resourceOverlap: competingInterests,
  powerBalance: capabilityComparison
});

// Tension level calculation for each pair
tensionLevel =
  (hostility * 0.4) +
  (competition * 0.3) +
  (resourceOverlap * 0.2) +
  ((10 - trust) * 0.1);

// Cooperation potential calculation
cooperationPotential =
  (cooperation * 0.4) +
  (trust * 0.3) +
  (complementaryCapabilities * 0.2) +
  (sharedThreats * 0.1);
```

#### Step 2: Event Type Occurrence Probability

**Attack Event Occurrence Probability**:
```typescript
attackProbability = calculateEventChance({
  baseProbability: 0.1, // 10%
  hostilityModifier: hostility * 0.05, // Significant increase with hostility level
  proximityModifier: proximity < 2 ? 0.03 : 0,
  resourceModifier: resourceOverlap > 7 ? 0.04 : 0,
  powerImbalanceModifier: Math.abs(powerDifference) > 3 ? 0.02 : 0,
  narrativeTensionModifier: storyTension > 7 ? 0.03 : 0
});

// Maximum probability: 27% (high hostility + proximity + resource conflict + power difference + tension)
```

**Cooperation Event Occurrence Probability**:
```typescript
cooperationProbability = calculateEventChance({
  baseProbability: 0.08, // 8%
  cooperationModifier: cooperation * 0.04,
  trustModifier: trust * 0.03,
  complementaryModifier: capabilityComplement > 6 ? 0.05 : 0,
  sharedThreatModifier: externalThreat > 5 ? 0.06 : 0,
  weaknessModifier: partyInCrisis ? 0.04 : 0
});

// Maximum probability: 31% (high cooperation + high trust + capability complement + external threat + crisis)
```

**Negotiation Event Occurrence Probability**:
```typescript
negotiationProbability = calculateEventChance({
  baseProbability: 0.12, // 12%
  diplomacyModifier: Math.max(party1.diplomacy, party2.diplomacy) * 0.02,
  tensionModifier: tensionLevel > 6 && tensionLevel < 9 ? 0.04 : 0,
  opportunityModifier: mutualOpportunity > 5 ? 0.03 : 0,
  timeModifier: sinceLastInteraction > 3 ? 0.02 : 0
});

// Maximum probability: 25% (high diplomacy + moderate tension + mutual opportunity + time passage)
```

**Competition Event Occurrence Probability**:
```typescript
competitionProbability = calculateEventChance({
  baseProbability: 0.15, // 15%
  competitionModifier: competition * 0.03,
  similarCapabilityModifier: capabilitySimilarity > 7 ? 0.04 : 0,
  resourceScarcityModifier: scarceResources > 6 ? 0.05 : 0,
  achievementModifier: recentSuccess ? 0.03 : 0
});

// Maximum probability: 30% (high competition + similar capabilities + resource scarcity + recent success)
```

#### Step 3: GM Perspective Event Execution Decision

```typescript
gmEventDecision = evaluateEventTrigger({
  eventType: selectedEventType,
  involvedParties: [party1, party2],
  currentRelations: partyRelationships,
  narrativeImpact: storyValue,
  balanceImpact: gameBalance,
  playerEngagement: satisfactionLevel
});

// Final decision on GM evaluation axes
finalEventScore =
  eventProbability * 0.3 +          // Numerical probability
  narrativeValue * 0.35 +           // Story value
  balanceContribution * 0.25 +      // Game balance contribution
  playerExcitement * 0.1;           // Player excitement level

// Execution threshold: Event triggers at 6.5 or above
if (finalEventScore >= 6.5) {
  triggerInterPartyEvent(eventType, involvedParties);
}
```

### Inter-Party Event Execution Framework

#### Attack Event Execution
```typescript
conflictEvent = {
  type: 'inter_party_conflict',
  participants: [aggressorParty, targetParty],
  effects: [
    // Relationship value changes
    { target: `relationships/${pair_id}/hostility`, operation: 'add', value: 3 },
    { target: `relationships/${pair_id}/trust`, operation: 'add', value: -2 },

    // Resource and morale changes based on combat results
    { target: `parties/${winnerId}/morale`, operation: 'add', value: 2 },
    { target: `parties/${loserId}/morale`, operation: 'add', value: -3 },
    { target: `parties/${loserId}/resources/currency`, operation: 'add', value: -lootAmount }
  ]
};
```

#### Cooperation Event Execution
```typescript
cooperationEvent = {
  type: 'inter_party_cooperation',
  participants: [party1, party2],
  effects: [
    // Relationship value improvement
    { target: `relationships/${pair_id}/cooperation`, operation: 'add', value: 2 },
    { target: `relationships/${pair_id}/trust`, operation: 'add', value: 1 },

    // Mutual benefits
    { target: `parties/${party1}/morale`, operation: 'add', value: 1 },
    { target: `parties/${party2}/morale`, operation: 'add', value: 1 },

    // Joint project outcomes
    { target: `parties/${party1}/resources/materials`, operation: 'add', value: sharedReward },
    { target: `parties/${party2}/resources/materials`, operation: 'add', value: sharedReward }
  ]
};
```

#### Negotiation Event Execution
```typescript
negotiationEvent = {
  type: 'inter_party_negotiation',
  participants: [party1, party2],
  effects: [
    // Relationship adjustment
    { target: `relationships/${pair_id}/hostility`, operation: 'add', value: -1 },
    { target: `relationships/${pair_id}/cooperation`, operation: 'add', value: 1 },

    // Resource trading based on agreement terms
    { target: `parties/${party1}/resources/currency`, operation: 'add', value: -tradeAmount },
    { target: `parties/${party2}/resources/currency`, operation: 'add', value: tradeAmount },
    { target: `parties/${party1}/resources/materials/gems`, operation: 'add', value: gemAmount },
    { target: `parties/${party2}/resources/materials/gems`, operation: 'add', value: -gemAmount }
  ]
};
```

#### Competition Event Execution
```typescript
competitionEvent = {
  type: 'inter_party_competition',
  participants: [party1, party2],
  effects: [
    // Strengthen competitive relationship
    { target: `relationships/${pair_id}/competition`, operation: 'add', value: 2 },
    { target: `relationships/${pair_id}/cooperation`, operation: 'add', value: -1 },

    // Winner rewards and loser penalties
    { target: `parties/${winnerId}/morale`, operation: 'add', value: 3 },
    { target: `parties/${winnerId}/resources/materials`, operation: 'add', value: prize },
    { target: `parties/${loserId}/morale`, operation: 'add', value: -1 }
  ]
};
```

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
    "type": "[Action type]",
    "participants": ["GM"],
    "effects": [...]
  }
}
```

### Effect Path Notation ⚠️ Important
```json
// ✅ Correct notation
{"target": "parties/emerald_hunters/morale", "operation": "add", "value": 1}
{"target": "market/currentPrices/gems", "operation": "set", "value": 20}
{"target": "regions/crystal_caves/occupantParties", "operation": "set", "value": ["emerald_hunters"]}

// ❌ Incorrect notation
{"target": "/parties/emerald_hunters/morale"}  // Leading slash NG
{"target": "parties", "operation": "set", "value": {...all parties...}}  // Bulk setting NG
```

### Currency and Resource Operations
```json
// ✅ Currency decrease (payment)
{"target": "parties/party_id/resources/currency", "operation": "add", "value": -50}

// ✅ Material consumption
{"target": "parties/party_id/resources/materials/metal", "operation": "add", "value": -3}

// ✅ Add new materials
{"target": "parties/party_id/resources/materials", "operation": "add", "value": {"new_item": 5}}
```

### Inter-Party Relationship Value Operations
```json
// ✅ Increase hostility (after attack event)
{"target": "relationships/party1_id__party2_id/hostility", "operation": "add", "value": 3}

// ✅ Improve cooperation (after joint project)
{"target": "relationships/emerald_hunters__fire_forge_guild/cooperation", "operation": "add", "value": 2}

// ✅ Decrease trust (after betrayal)
{"target": "relationships/party1_id__party2_id/trust", "operation": "add", "value": -4}

// ✅ Set competition level (establish rival relationship)
{"target": "relationships/party1_id__party2_id/competition", "operation": "set", "value": 8}

// ✅ Update last interaction
{"target": "relationships/party1_id__party2_id/lastInteraction", "operation": "set", "value": "turn_5"}

// ✅ Add interaction history (add as array)
{"target": "relationships/party1_id__party2_id/history", "operation": "add", "value": [{"turn": 5, "event": "conflict", "impact": "+3_hostility", "description": "Armed conflict over resource dispute"}]}
```

### Array Operations
```json
// ✅ Update region occupants
{"target": "regions/region_id/occupantParties", "operation": "set", "value": ["party1", "party2"]}

// ✅ Add to trading history (as array)
{"target": "market/completedTrades", "operation": "add", "value": [{"buyer": "party_id", "item": "wood", "quantity": 10, "price": 3, "total": 30, "turn": 2}]}
```

### Pre-Check Required Items
1. **Balance Verification**: Check current values when consuming currency/materials
2. **Region Capacity**: Check capacity limits when moving
3. **Logical Consistency**: Verify that actions are appropriate for the situation

Follow this GM thinking framework and JSON generation guidelines to provide appropriate challenges and story experiences to players. When player perspective judgment is needed, switch to `PLAYER_MIND.md`.