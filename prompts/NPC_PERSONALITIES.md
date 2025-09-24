# NPC Personality System

Defines NPC personalities and behavior patterns to achieve more diverse and unpredictable tactical decisions.

## 🎭 Basic Personality Types

### Aggressive

```
Aggressiveness: 8-10
Intelligence: 4-7
Loyalty: 6-8

Behavioral Traits:
- Prefers close combat
- Actively attacks even when HP is below 50%
- Prioritizes attacking enemies over supporting allies
- Moves in straight lines ignoring terrain

Tactical Patterns:
- "charge_closest": Charges at the nearest enemy
- "berserker_rush": Reckless attacks when HP is low
- "intimidate_advance": Advances while intimidating
```

### Cautious

```
Aggressiveness: 2-5
Intelligence: 7-9
Loyalty: 7-10

Behavioral Traits:
- Values defensive positioning
- Considers retreat when HP drops below 75%
- Prioritizes coordination with allies
- Tactically utilizes terrain

Tactical Patterns:
- "defensive_formation": Forms defensive formation with allies
- "tactical_retreat": Planned retreat
- "cover_seeking": Utilizes cover
```

### Cunning

```
Aggressiveness: 5-8
Intelligence: 8-10
Loyalty: 3-6

Behavioral Traits:
- Aims for surprise attacks and ambushes
- Prioritizes attacking weakened enemies
- Uses allies as shields
- Unpredictable movement patterns

Tactical Patterns:
- "flank_attack": Flanking attack
- "opportunist_strike": Opportunity attack
- "feint_maneuver": Feint movement
```

### Heroic

```
Aggressiveness: 6-8
Intelligence: 6-8
Loyalty: 9-10

Behavioral Traits:
- Prioritizes ally protection above all
- Never flees even when disadvantaged
- Makes tactically optimal decisions
- Predictable but effective

Tactical Patterns:
- "protect_allies": Prioritizes ally support
- "last_stand": Last stand resistance
- "coordinated_attack": Coordinated attack
```

### Chaotic

```
Aggressiveness: 1-10 (Random)
Intelligence: 3-7
Loyalty: 1-8

Behavioral Traits:
- Unpredictable actions
- Decisions influenced by emotions
- Tends to make extreme choices
- Personality changes each turn

Tactical Patterns:
- "random_chaos": Completely random actions
- "mood_swing": Tactical changes based on mood
- "wild_card": Unexpected actions
```

## 🧮 Personality-Based Decision Algorithms

### Aggressive Type Evaluation Formula

```
Choice Score = Base Score + Personality Modifier

Personality Modifiers:
- Attack actions: +3.0
- Advance actions: +2.0
- Defense actions: -2.0
- Retreat actions: -3.0
- Close distance to enemy: +1.5
- Aggressiveness bonus from HP reduction: (100 - HP%) * 0.02
```

### Cautious Type Evaluation Formula

```
Personality Modifiers:
- Defense actions: +3.0
- Coordination with allies: +2.5
- Terrain utilization: +2.0
- Reckless attacks: -3.0
- HP safety margin: (Current HP / Max HP) * 2.0
- Maintaining distance to allies: Within distance 2 +1.5
```

### Cunning Type Evaluation Formula

```
Personality Modifiers:
- Flank/rear attacks: +3.5
- Attacks on weakened enemies: +(100 - Enemy HP%) * 0.03
- Attacks with numerical advantage: +2.0
- Frontal attacks: -1.5
- Escape in disadvantageous situations: +2.5
```

### Heroic Type Evaluation Formula

```
Personality Modifiers:
- Ally protection actions: +4.0
- Coordinated attacks: +2.5
- Tactically optimal solutions: +2.0
- Abandoning allies: -5.0
- Approaching endangered allies: +1.5
```

### Chaotic Type Evaluation Formula

```
Personality Modifiers:
- Random coefficient: (-2.0 to +2.0)
- Mood value modifier: Current mood * 0.5
- Same action as previous turn: -1.0
- Unpredictability bonus: +0.5 to +2.0

Mood Value Changes:
- Attack success: +2
- Attack failure: -1
- Taking damage: -1
- Ally defeated: -2
```

## 🎲 Implementation Guide for Personality Application

### Personality Reference in GM_CORE_MIND.md

```
Step 2.5: NPC Personality Application

1. Check NPC personality type
2. Reference corresponding behavioral traits
3. Generate choices from tactical patterns
4. Calculate modifier values using personality-specific evaluation formulas
5. Determine action based on final score
```

### Dynamic Personality Changes

```
Changes through Experience:
- Consecutive successes → Aggressiveness +1, Intelligence +1
- Consecutive failures → Aggressiveness -1, Caution +1
- Ally death → Loyalty change, Aggressiveness change
- Continued disadvantage → Intelligence +1, Aggressiveness adjustment

Change Limits: ±3 points (prevents extreme changes)
```

### Interactions Between Multiple NPCs

```
Compatibility System:
- Aggressive + Cautious = Balanced coordination
- Cunning + Aggressive = High risk, high return
- Heroic + Any = Other NPCs' loyalty +1
- Chaotic + Any = Unpredictable coordination

Influence Range: NPCs within adjacent tiles
```

## 📊 Measuring Personality System Effectiveness

### Diversity Metrics

- Reduction in consecutive identical actions (Target: Less than 3 times)
- Distribution of tactical pattern usage
- Decrease in player prediction accuracy

### Narrative Effects

- Memorability of NPC characters
- Combat tension level
- Narrative unpredictability

---

This personality system enables each NPC to maintain consistent personality while achieving rich tactical diversity that dynamically changes according to situations.
