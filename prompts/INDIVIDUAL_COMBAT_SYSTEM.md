# Individual Combat System - Individual Combat System Framework

**Purpose**: Perform detailed combat processing at the individual party member level and completely record sword and magic interactions.

## 🗡️ Party Member Combat Definition

### Basic Combat Profile
```typescript
interface CombatMember {
  id: string;                    // "iron_wolves.kael", "silk_merchants.zara"
  name: string;                  // "Kael the Bold", "Zara Shadowblade"
  class: 'Fighter' | 'Wizard' | 'Rogue' | 'Cleric';
  level: number;                 // 1-10

  // Combat Status
  hp: { current: number; max: number };
  stats: {
    attack: number;              // Physical attack power (1-20)
    defense: number;             // Physical defense power (1-20)
    magic: number;               // Magic attack power (1-20)
    resistance: number;          // Magic resistance (1-20)
    speed: number;               // Action order (1-20)
    accuracy: number;            // Hit rate (1-20)
  };

  // Equipment
  equipment: {
    weapon: CombatWeapon;
    armor: CombatArmor;
    accessories?: CombatAccessory[];
  };

  // Combat Skills
  skills: CombatSkill[];

  // Combat Conditions
  conditions: StatusCondition[];  // Poison, charm, enhancement, etc.
  actionPoints: number;          // Action points for that turn
}
```

### Weapon and Armor System
```typescript
interface CombatWeapon {
  id: string;
  name: string;
  type: 'sword' | 'bow' | 'staff' | 'dagger';
  damage: { min: number; max: number };
  accuracy_bonus: number;
  special_effects?: WeaponEffect[];
  narrative_prefix: string;      // "enchanted blade", "crackling staff"
}

interface CombatArmor {
  id: string;
  name: string;
  type: 'heavy' | 'medium' | 'light' | 'robes';
  defense_bonus: number;
  resistance_bonus: number;
  special_effects?: ArmorEffect[];
}

interface CombatSkill {
  id: string;
  name: string;
  type: 'attack' | 'spell' | 'support' | 'defensive';
  cost: { actionPoints?: number; mana?: number };
  effects: SkillEffect[];
  cooldown?: number;
  narrative_template: string;    // "casts {spell_name}, conjuring {effect}"
}
```

## ⚔️ Combat Turn System

### Turn Structure
```
Phase 1: Initiative Determination
- Sort by each member's speed value
- Random order for equal speeds

Phase 2: Individual Action Execution
- Each member selects actions in turn
- Apply tactical patterns from TACTICAL_PATTERNS.md
- Decision making with GM_CORE_MIND.md / PLAYER_MIND.md

Phase 3: Simultaneous Effect Resolution
- Apply damage
- Process status conditions
- Combat end determination
```

### Action Selection Process
```
1. Extract Available Actions
   - Normal attack (always available)
   - Skill usage (cost and cooldown check)
   - Movement (tactical positioning)
   - Defense and waiting

2. Apply TACTICAL_PATTERNS.md
   - Select optimal pattern for current situation
   - Modify based on personality and class traits
   - Risk-return evaluation

3. Final Action Decision
   - Calculate pattern evaluation values
   - Weight by character personality
   - Add 5% random element
```

## 🎯 Combat Action Detailed Processing

### Physical Attack Processing
```typescript
interface PhysicalAttack {
  attacker: CombatMember;
  target: CombatMember;
  weapon: CombatWeapon;

  // Calculation Results
  hit_chance: number;            // (attacker.accuracy + weapon.accuracy_bonus) vs target.defense
  damage_roll: number;           // weapon.damage + attacker.attack
  final_damage: number;          // damage_roll - target.defense
  critical_hit: boolean;         // 5% chance for 2x damage

  // Narrative Generation
  narrative: string;             // "Kael swings his enchanted blade..."
  dialogue?: string;             // Generated from DIALOGUE_SYSTEM.md
}
```

### Magic Attack Processing
```typescript
interface MagicAttack {
  caster: CombatMember;
  targets: CombatMember[];       // Single/area attack
  spell: CombatSkill;

  // Calculation Results
  cast_success: number;          // Casting success rate
  spell_power: number;           // caster.magic + spell.power
  damage_per_target: number[];   // Damage to each target
  additional_effects: SkillEffect[]; // Status conditions, etc.

  // Narrative Generation
  incantation?: string;          // "Ancient flames, heed my call!"
  visual_effect: string;         // "crackling fireball streaks"
  impact_description: string;    // "explodes in brilliant flames"
}
```

## 📖 Combat Narrative Generation

### Detailed Combat Log Structure
```json
{
  "type": "detailed_combat",
  "participants": ["iron_wolves", "silk_merchants"],
  "combat_rounds": [
    {
      "round": 1,
      "initiative_order": ["iron_wolves.kael", "silk_merchants.finn", "silk_merchants.zara"],
      "actions": [
        {
          "actor": "iron_wolves.kael",
          "action_type": "sword_attack",
          "target": "silk_merchants.zara",
          "tactical_pattern": "charge_direct",
          "dialogue": "Let's go! Strike down the enemy!",
          "mechanics": {
            "hit_roll": 15,
            "damage_roll": 12,
            "final_damage": 8,
            "target_hp_change": [32, 24]
          },
          "narrative": "Kael roars his battle cry and charges forward with determination. His enchanted blade gleams as he brings it down in a powerful overhead strike against Zara, the steel biting deep into her shoulder guard.",
          "result": "hit_success"
        }
      ]
    }
  ],
  "combat_result": {
    "winner": "iron_wolves",
    "duration_rounds": 3,
    "casualties": ["silk_merchants.zara"],
    "survivors": {
      "iron_wolves.kael": { "hp": [40, 28], "conditions": ["exhausted"] },
      "silk_merchants.finn": { "hp": [25, 0], "conditions": ["unconscious"] }
    },
    "final_narrative": "After three grueling rounds of combat, Iron Wolves emerges victorious. Kael stands over his fallen foes, breathing heavily, his blade still dripping with the evidence of battle."
  }
}
```

### Combat Style by Character Personality

#### Fighter-type Combat Patterns (Based on PLAYER_MIND.md)
```
Brave Fighter:
- Priority Actions: charge_direct, berserker_rush
- Combat Dialogue: "Fear nothing!", "I'll be the shield!"
- Tactical Choice: Maintain frontline, prioritize ally protection

Cautious Fighter:
- Priority Actions: defensive_formation, tactical_retreat
- Combat Dialogue: "Let's watch the situation", "Let's be careful"
- Tactical Choice: Secure safety, aim for certain victory
```

#### Wizard-type Combat Patterns
```
Attack-specialized Wizard:
- Priority Actions: focus_fire, high-power spells
- Combat Dialogue: "Analysis complete, exploit the weakness", "This technique will decide it"
- Tactical Choice: Maximum effect at optimal timing

Support-specialized Wizard:
- Priority Actions: healing_priority, tactical_coordination
- Combat Dialogue: "I'm worried about everyone", "I'll prioritize healing"
- Tactical Choice: Ally support, emphasize long-term strategy
```

## 🧠 GM/Player Combat Decision Integration

### GM Perspective Combat Control (Based on GM_CORE_MIND.md)
```
NPC Combat Action Decision:
1. Battle Situation Assessment (0-10 scale)
   - Player party threat level
   - Own force remaining strength
   - Tactical advantage

2. Narrative Direction Judgment
   - Need for tension creation
   - Dramatic timing
   - Character growth opportunities

3. NPC Personality Application
   - NPC_PERSONALITIES.md patterns
   - Consistent behavioral principles
   - Emotional reaction patterns
```

### Player Perspective Combat Judgment (Based on PLAYER_MIND.md)
```
Character Combat Selection:
1. Class Aptitude Assessment
   - Fighter: Prioritize physical solutions
   - Wizard: Strategic and efficient solutions

2. Personality Trait Application
   - Frontline awareness based on bravery
   - Safety priority based on caution
   - Coordination emphasis based on cooperation

3. Tactical Pattern Application
   - Optimal selection from TACTICAL_PATTERNS.md
   - Situation compatibility × personality aptitude
   - Decision based on final evaluation value
```

---

This framework allows converting abstract `conflict` actions into **true sword and magic combat** and completely recording each character's personality and tactical judgment.