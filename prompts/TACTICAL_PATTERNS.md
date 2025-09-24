# Tactical Patterns Library - 戦術パターンライブラリ

A tactical pattern definition collection for achieving more strategic and diverse actions in combat.

## ⚔️ Basic Tactical Categories

### 1. Attack Patterns

#### Charge Patterns
```
"charge_direct": Direct Charge
- Conditions: Within 3 tiles of enemy, no obstacles in between
- Effects: Movement + Attack, Attack Power +20%, Damage Taken +10%
- Evaluation: Higher rating for closer distance (distance <= 2: +3.0)

"charge_flank": Flanking Charge
- Conditions: Can maneuver to enemy's flank or rear
- Effects: Movement + Attack, Attack Power +30%, Counterattack Avoidance 50%
- Evaluation: Flank attack +2.5, Rear attack +4.0

"berserker_rush": Berserker Rush
- Conditions: HP 50% or below, within 2 tiles of enemy
- Effects: Movement + Attack, Attack Power +50%, Defense -30%
- Evaluation: Higher rating for lower HP +(50-current HP%)*0.1
```

#### Coordinated Patterns
```
"pincer_attack": Pincer Attack
- Conditions: Allies positioned to flank enemy
- Effects: Attack Power +25%, Enemy escape restriction
- Evaluation: Participating allies × 1.5, Enemy encirclement degree × 2.0

"focus_fire": Focus Fire
- Conditions: Multiple allies can target same enemy
- Effects: All Attack Power +15%, Aiming for certain elimination
- Evaluation: Higher rating for lower enemy HP +(100-enemy HP%)*0.05

"formation_strike": Formation Strike
- Conditions: 3 or more allies maintaining formation
- Effects: Attack Power +10%, Counterattack Damage -20%
- Evaluation: Formation integrity × 2.0, Ally count × 0.8
```

### 2. Defense Patterns

#### Positioning Patterns
```
"defensive_formation": Defensive Formation
- Conditions: 2 or more allies
- Effects: Damage Taken -15%, Ally Support +1 action
- Evaluation: Consider total ally HP, Danger level -1.5

"cover_seeking": Cover Utilization
- Conditions: Walls or obstacles adjacent
- Effects: Ranged Attack Damage -50%
- Evaluation: Enemy ranged attackers × 2.0

"chokepoint_hold": Chokepoint Defense
- Conditions: 1-2 tile width passage
- Effects: Passage blockade, Enemy movement restriction
- Evaluation: Passage narrowness × 2.5, Rear safety × 1.5
```

#### Retreat Patterns
```
"tactical_retreat": Tactical Retreat
- Conditions: HP 30% or below or numerical disadvantage
- Effects: Movement distance +1, Counterattack avoidance
- Evaluation: Danger level × 2.0, Inversely proportional to remaining HP

"fighting_withdrawal": Fighting Withdrawal
- Conditions: Can attack while retreating
- Effects: Movement + Attack, Attack Power -20%
- Evaluation: Rear safety × 1.8, Enemy pursuit possibility -1.0

"sacrifice_cover": Sacrificial Cover
- Conditions: For securing ally escape route
- Effects: Ally movement +2, Self danger +50%
- Evaluation: Rescue target value × 3.0, Heroic personality +2.0
```

### 3. Mobility Patterns

#### Movement Patterns
```
"flanking_maneuver": Flanking Maneuver
- Conditions: Movement route to enemy flank available
- Effects: Next turn attack +30%
- Evaluation: Flanking completion degree × 2.2

"hit_and_run": Hit and Run
- Conditions: Can retreat after attack
- Effects: Attack + Movement, Counterattack avoidance 80%
- Evaluation: Mobility × 1.8, Cunning personality +1.5

"positioning_advance": Positional Advance
- Conditions: Movement to more advantageous position
- Effects: Next turn all actions +15% effect
- Evaluation: Positional advantage × 2.0

"evasive_maneuver": Evasive Maneuver
- Conditions: Surrounded by multiple enemies
- Effects: All attack evasion +25%
- Evaluation: Surrounding enemies × 1.5, Inversely proportional to remaining HP
```

### 4. Support Patterns

#### Allied Support
```
"bodyguard_position": Bodyguard Position
- Conditions: Adjacent position to important ally
- Effects: Take attacks meant for ally
- Evaluation: Protected ally importance × 2.5

"healing_priority": Healing Priority
- Conditions: Ally HP 30% or below
- Effects: Healing effect +50%
- Evaluation: Ally HP danger level × 3.0

"tactical_coordination": Tactical Coordination
- Conditions: Can coordinate with ally actions
- Effects: Coordination effect +25%
- Evaluation: Coordination participants × 1.2, Predicted effect value × 2.0
```

## 🧠 Pattern Selection Algorithm

### Basic Selection Process
```
1. Current Situation Assessment
   - Force comparison (allies vs enemies)
   - Positional relationship analysis
   - HP/Resource status

2. Available Pattern Extraction
   - Condition checking
   - Resource requirement verification
   - Personality aptitude assessment

3. Pattern Evaluation Calculation
   Base evaluation = Situation fit × Pattern effect value
   Personality modifier = Personality type aptitude × Personality strength
   Final evaluation = Base evaluation + Personality modifier

4. Optimal Pattern Selection
   - Select from top 3 evaluated patterns
   - Add 5% random element
   - Avoid duplication with previous turn
```

### Situational Priority Patterns

#### Numerical Advantage (Ally Majority)
```
Priority order:
1. "focus_fire" - Reliable enemy elimination
2. "pincer_attack" - Suppression through encirclement
3. "formation_strike" - Pressure through formation
4. "flanking_maneuver" - Flank attack preparation
```

#### Numerical Disadvantage (Enemy Majority)
```
Priority order:
1. "chokepoint_hold" - Terrain-based defense
2. "tactical_retreat" - Tactical withdrawal
3. "hit_and_run" - Guerrilla tactics
4. "evasive_maneuver" - Encirclement breakthrough
```

#### HP Critical (30% or below)
```
Priority order:
1. "tactical_retreat" - Safety securing
2. "cover_seeking" - Cover utilization
3. "fighting_withdrawal" - Combat withdrawal
4. "berserker_rush" - Final attack
```

#### Balanced State
```
Priority order:
1. "positioning_advance" - Advantageous position securing
2. "tactical_coordination" - Ally coordination
3. "flanking_maneuver" - Flank attack preparation
4. "defensive_formation" - Stable formation
```

## 📈 Pattern Learning System

### Success/Failure Recording
```
Pattern Success:
- Corresponding pattern evaluation +0.2
- Increased selection probability in similar situations
- Personality aptitude fine-tuning

Pattern Failure:
- Corresponding pattern evaluation -0.1
- Alternative pattern consideration
- Failure factor analysis recording
```

### Adaptive Pattern Generation
```
Existing Pattern Combinations:
- Fusion of 2 successful patterns
- Situation-specialized derivative creation
- Automatic generation of personality-specialized patterns

Learning Limits:
- Pattern count limit: 50
- Evaluation value fluctuation range: ±2.0
- Learning period: Reset every 100 turns
```

---

This tactical pattern library enables NPCs to take diverse and strategic actions appropriate to situations, providing players with constant new challenges.