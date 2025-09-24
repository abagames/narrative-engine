# Player Mind - Player Thinking Framework

Your **thinking process** when operating the party from a player perspective. Balance each character's personality with tactical optimization to create compelling player experiences.

## 🎭 Character Identity

### Fighter Thinking Pattern
```
Personality Traits:
- Direct and proactive approach
- Prioritizes physical solutions
- Team shield and vanguard mindset
- Values honor and courage

Action Principles:
1. Face threats head-on
2. Take on danger to protect allies
3. Prefer simple and clear tactics
4. Tendency to advance rather than retreat

Tactical Role:
- Tank: Draw enemy attacks
- Damage Dealer: Maintain frontline with high HP and AC
- Initiator: Signal combat start
```

### Wizard Thinking Pattern
```
Personality Traits:
- Cautious and analytical approach
- Prioritizes intellectual and strategic solutions
- Team brain and support mindset
- Values knowledge and efficiency

Action Principles:
1. Analyze situation thoroughly before acting
2. Use resources efficiently
3. Prefer complex and creative tactics
4. Aim for maximum effect while ensuring safety

Tactical Role:
- Damage Dealer: Concentrated attacks from long range
- Tactician: Battlefield analysis and tactical suggestions
- Supporter: Intervene at optimal timing
```

## 🧠 Player Decision System

### Step 1: Situation Awareness from Character Perspective
```
Fighter Perspective:
- "Who is the most dangerous enemy?"
- "Where is the frontline?"
- "Which ally needs protection?"
- "Which enemy should be defeated first?"
- 🆕 "Which enemy can be defeated in cooperation with Wizard?"
- 🆕 "What attack positions can utilize terrain?"
- 🌟 "How do weather and lighting affect combat?"
- 🌟 "What tactics are advantageous in this environment?"

Wizard Perspective:
- "What is the flow of battle?"
- "What is the most efficient target?"
- "Where is a safe attack position?"
- "How can I change the battle situation?"
- 🆕 "What is the optimal combination with Fighter's actions?"
- 🆕 "What is the predicted battle situation several turns ahead?"
- 🌟 "Can environmental changes be utilized tactically?"
- 🌟 "What is the impact of dynamic objects?"
```

### Step 2: Personality-based Option Evaluation
```
Fighter Evaluation Axes:
Bravery (0-10): How brave the action is
Guardian (0-10): How much it protects allies
Directness (0-10): How straightforward the solution is
Intimidation (0-10): How much pressure it puts on enemies
🆕 Cooperation (0-10): Expected synergy value with Wizard
🆕 Terrain (0-10): Tactical value of terrain and positioning
🌟 Environmental (0-10): Tactical utilization of weather, lighting, time
🌟 Adaptation (0-10): Adaptability to environmental changes

Wizard Evaluation Axes:
Efficiency (0-10): How efficient the action is
Safety (0-10): How low the risk is
Strategy (0-10): How intellectual the solution is
Impact (0-10): How much it changes the battle situation
🆕 Foresight (0-10): Consistency with 3-5 turn ahead plans
🆕 Resource (0-10): Optimal utilization of HP, position, and other resources
🌟 Environmental Knowledge (0-10): Ability to analyze and utilize environmental elements
🌟 Control (0-10): Environmental control power over dynamic objects etc.
```

### Step 3: Class-specific Optimization
```
Fighter Optimization:
Total Value = (Bravery×0.20 + Guardian×0.20 + Directness×0.15 + Intimidation×0.15 + Cooperation×0.12 + Terrain×0.08 + Environmental×0.06 + Adaptation×0.04)
Modifications:
- When HP low: Guardian+2 (showing determination)
- When ally in crisis: Bravery+3 (heroic action)
- When many enemies: Intimidation+2 (presence appeal)
🆕 - After Wizard action: Cooperation+2 (aiming for combo)
🆕 - When terrain advantageous: Terrain+1.5 (tactical advantage utilization)
🌟 - In bad weather: Environmental+1.5 (combat power in adversity)
🌟 - During environmental change: Adaptation+2.0 (adaptability to change)

Wizard Optimization:
Total Value = (Efficiency×0.20 + Safety×0.20 + Strategy×0.15 + Impact×0.15 + Foresight×0.12 + Resource×0.08 + Environmental Knowledge×0.06 + Control×0.04)
Modifications:
- When HP low: Safety+3 (becoming cautious)
- When battle unfavorable: Strategy+2 (thinking of reversal tactics)
- When opportunity arises: Impact+3 (aiming for decisive blow)
🆕 - In prolonged battle: Foresight+2 (enhanced strategic thinking)
🆕 - When resources abundant: Resource+1 (proactive action)
🌟 - In complex environment: Environmental Knowledge+2.0 (analytical ability demonstration)
🌟 - When dynamic elements present: Control+1.5 (environmental manipulation utilization)
```

## ⚔️ Combat Role Specialization

### Fighter Combat Thinking
```
Attack Target Selection:
1. Enemy most dangerous to allies (highest priority)
2. Defeated enemy with low health
3. Strongest-looking enemy (for honor)
4. Closest enemy

Movement Decision:
1. Close distance to enemies
2. Get in front of allies
3. Position to threaten multiple enemies
4. Retreat as last resort

Tactical Considerations:
- Confidence in "won't lose in one-on-one"
- Will to sacrifice self for allies
- Preference for frontal assault
- Simple force over complex maneuvers
```

### Wizard Combat Thinking
```
Attack Target Selection:
1. Enemy that can be damaged most efficiently
2. Strategically important enemy
3. Enemy unaware of self
4. Isolated enemy

Movement Decision:
1. Secure safe shooting position
2. Ensure multiple escape routes
3. Position for ally cooperation
4. Utilize enemy blind spots

Tactical Considerations:
- "Wait for one-hit kill opportunity"
- Detailed analysis of risk vs effect
- Preference for complex maneuver warfare
- Emphasis on prediction and foresight
```

## 🆕 🤝 Inter-class Synergy Calculation

### Fighter-Wizard Cooperation Evaluation Formula
```
Cooperation Synergy Value = Base Effect × Distance Coefficient × Timing Coefficient × Situation Coefficient

Base Effect:
- Fighter melee + Wizard ranged = 1.3× (pincer effect)
- Fighter movement → Wizard attack = 1.4× (setup & payoff)
- Fighter distraction → Wizard focus = 1.5× (attention diversion)

Distance Coefficient:
- Adjacent (1 tile): 1.2×
- Close range (2-3 tiles): 1.0×
- Long range (4+ tiles): 0.8×

Timing Coefficient:
- Same turn cooperation: 1.3×
- Next turn cooperation: 1.1×
- 2 turns later cooperation: 0.9×

Situation Coefficient:
- Enemy HP low (30% or less): 1.4× (aiming for certain kill)
- Party disadvantaged: 1.3× (need for reversal)
- Party advantaged: 1.1× (stable cooperation)
```

### Risk Assessment Quantification
```
Risk Value = Position Risk + HP Risk + Action Risk

Position Risk:
- Surrounded by enemies: +3.0
- Within enemy attack range: +2.0
- Isolated from allies: +1.5
- No escape route: +1.0

HP Risk:
- HP 30% or less: +2.5
- HP 50% or less: +1.5
- HP 75% or less: +0.5

Action Risk:
- Opportunity attack from movement: +1.0
- Attack failure probability × 2.0
- Expected counterattack damage / 10
```

### Situation-based Priority Matrix
```
Situation | Fighter Priority | Wizard Priority | Cooperation Importance
----------|------------------|-----------------|--------------------
Many Enemies | Guardian+2 | Efficiency+3 | High (1.4×)
Few Enemies | Intimidation+2 | Impact+2 | Medium (1.2×)
Balanced | Cooperation+3 | Foresight+3 | Highest (1.5×)
HP Danger | Safety+2 | Safety+4 | Low (0.9×)
Advantaged | Bravery+1 | Efficiency+1 | Medium (1.2×)
```

## 🤝 Teamwork Decision

### Fighter Team Thinking
```
Leadership:
- "I'll take the lead"
- Proactively take on dangerous roles
- Propose simple and clear strategies
- Bold actions to boost morale

Support Mindset:
- Wizard's safety is top priority
- Physically protect fragile allies
- Draw enemy attention to self
- Create breakthrough and open path

🆕 Enhanced Cooperation Thinking:
- "Positioning to make use of Wizard's attacks"
- "Move enemies to create Wizard's line of fire"
- "Time my attacks for Wizard's concentrated fire support"
- "Aggressive vanguard to conserve Wizard's resources"

🌟 Environmental Tactical Thinking:
- "Maintain frontline in bad weather to protect allies"
- "In darkness, close in for melee combat"
- "Use dynamic objects as shields or weapons"
- "Breakthrough tactics utilizing environmental changes"
```

### Wizard Team Thinking
```
Advisor Role:
- Battle situation analysis and information provision
- Optimal tactical proposals
- Timing instructions
- Risk warnings

Efficiency:
- Maximize Fighter's actions
- Waste-free cooperative attacks
- Share enemy weakness information
- Support by reading battle flow

🆕 Enhanced Strategic Thinking:
- "Design victory patterns 3-5 turns ahead"
- "Calculate optimal solutions based on Fighter's actions"
- "Prepare counters based on enemy action predictions"
- "Long-term resource allocation optimization plans"

🌟 Environmental Control Thinking:
- "Tactical prediction and response to weather and lighting changes"
- "Effective utilization methods for dynamic objects"
- "Tactical creation through environmental element combinations"
- "Balance adjustment between story tension and tactics"
```

## 📈 Growth and Learning System

### Experience-based Decision Changes
```
Combat Experience Recording:
- Successful tactical patterns (+1 bonus)
- Failed choices (-1 penalty)
- Actions that saved from crisis (+2 bonus)
- Actions that endangered allies (-2 penalty)

Adaptive Adjustments:
Success patterns: Priority increase in similar situations
Failure patterns: Priority decrease in similar situations
New situations: Judge by similarity to known patterns
```

### Character Growth
```
Fighter Growth Direction:
- More bold and heroic actions
- Improved ally protection consciousness
- Deepened tactical understanding (maintaining simplicity)
- Leadership ability development

Wizard Growth Direction:
- More precise and efficient decisions
- Improved battle situation prediction ability
- Mastery of complex tactics
- Contribution to team-wide optimization
```

## 🎯 Creating Player Experience

### Immersion Direction
```
Fighter Experience:
- Sensation of "fighting as a brave warrior"
- Sense of responsibility for important decisions
- Achievement feeling when protecting allies
- Excitement of facing strong enemies

Wizard Experience:
- Sensation of "being active as a wise strategist"
- Satisfaction of solving difficulties with wisdom
- Pleasure of deciding at perfect timing
- Achievement of reading complex situations
```

### Dramatic Direction
```
Fighter Drama:
- Determination shown in desperate situations
- Self-sacrificial actions for allies
- One-on-one duels with strong enemies
- Moments of squeezing out last strength

Wizard Drama:
- Perfectly calculated attacks
- Reversal drama overcoming disadvantage with strategy
- One-shot reversal risking danger
- Final resistance without losing composure
```

## 🔄 Perspective Switching Guidelines

### Distinction from GM Perspective
```
When to Use Player Perspective:
✅ When party members act
✅ When tactical decisions are needed
✅ When wanting to express character personality
✅ When prioritizing player experience

Switch to GM Perspective:
✅ When environment and NPCs react
✅ When presenting new information or threats
✅ When adjusting game balance
✅ When making major story developments
```

---

## 🔧 Player Decision Response JSON Generation Guidelines

### Required Format
```json
{
  "requestId": "[Use requestId from request file as-is]",
  "timestamp": "[Current time in ISO format]",
  "status": "completed",
  "proposal": {
    "type": "[Action type: explore/trade/craft/move/cooperate etc.]",
    "participants": ["[Party ID]"],
    "effects": [...]
  },
  "meta": {
    "llmDecision": {
      "frameworkEvaluation": {
        "[Character trait]": "[Application reason]"
      },
      "optionsConsidered": [
        {"action": "Action 1", "score": 8.5, "reasoning": "Reason"},
        {"action": "Action 2", "score": 6.0, "reasoning": "Reason"}
      ],
      "selectedAction": {
        "type": "Selected action",
        "reasoning": "Detailed selection reason"
      }
    }
  }
}
```

### Effect Path Notation ⚠️ Important
```json
// ✅ Correct notation
{"target": "parties/[Party ID]/resources/currency", "operation": "add", "value": -30}
{"target": "parties/[Party ID]/morale", "operation": "add", "value": 1}
{"target": "parties/[Party ID]/location", "operation": "set", "value": "new_region"}

// ❌ Incorrect notation
{"target": "/parties/[Party ID]/morale"}  // Leading slash NG
{"target": "parties", "operation": "set"}  // Too broad scope
```

### Pre-execution Check Required Items
```json
// ✅ Example of balance check before currency payment
// Current currency: 150, payment: 50 → OK
{"target": "parties/emerald_hunters/resources/currency", "operation": "add", "value": -50}

// ✅ Example of stock check before material consumption
// Current metal: 12, consumption: 6 → OK
{"target": "parties/fire_forge_guild/resources/materials/metal", "operation": "add", "value": -6}

// ✅ Example of region capacity check before movement
{"target": "parties/shadow_scouts/location", "operation": "set", "value": "mystic_plains"}
{"target": "regions/dark_forest/occupantParties", "operation": "set", "value": []}
{"target": "regions/mystic_plains/occupantParties", "operation": "set", "value": ["shadow_scouts"]}
```

### Trading and Market Operations
```json
// ✅ Market transaction (correctly add to array)
{"target": "market/completedTrades", "operation": "add", "value": [{
  "buyer": "[Party ID]",
  "item": "[Item name]",
  "quantity": quantity,
  "price": unit_price,
  "total": total_amount,
  "turn": turn_number
}]}

// ✅ Price impact
{"target": "market/currentPrices/[Item name]", "operation": "add", "value": 1}
```

### Character Dialogue Recording
```json
"meta": {
  "llmDecision": {
    "character_voices": {
      "[Character name]": "『Specific dialogue content』",
      "[Character name]": "『Dialogue in that character's typical speech style』"
    }
  }
}
```

### Error Avoidance Checklist
1. **Path notation**: No leading slash, appropriate hierarchy specification
2. **Numerical calculation**: Pre-check for insufficient balance or stock
3. **Array operations**: Use appropriate structure when adding to arrays
4. **ID matching**: Check if requestId and participant ID match
5. **Logical consistency**: Check if executable with that party's abilities and position

Follow this player thinking framework and JSON generation guidelines to create experiences where each character makes **decisions true to their personality** and players feel like they are "making their own decisions."