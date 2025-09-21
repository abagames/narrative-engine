# Individual Combat System - 個人戦闘システムフレームワーク

**目的**: パーティメンバー個人レベルでの詳細な戦闘処理を行い、剣と魔法のやり取りを完全に記録する。

## 🗡️ パーティメンバー戦闘定義

### 基本戦闘プロファイル
```typescript
interface CombatMember {
  id: string;                    // "iron_wolves.kael", "silk_merchants.zara"
  name: string;                  // "Kael the Bold", "Zara Shadowblade"
  class: 'Fighter' | 'Wizard' | 'Rogue' | 'Cleric';
  level: number;                 // 1-10

  // 戦闘ステータス
  hp: { current: number; max: number };
  stats: {
    attack: number;              // 物理攻撃力 (1-20)
    defense: number;             // 物理防御力 (1-20)
    magic: number;               // 魔法攻撃力 (1-20)
    resistance: number;          // 魔法抵抗力 (1-20)
    speed: number;               // 行動順序 (1-20)
    accuracy: number;            // 命中率 (1-20)
  };

  // 装備
  equipment: {
    weapon: CombatWeapon;
    armor: CombatArmor;
    accessories?: CombatAccessory[];
  };

  // 戦闘スキル
  skills: CombatSkill[];

  // 戦闘状態
  conditions: StatusCondition[];  // 毒、魅了、強化等
  actionPoints: number;          // そのターンの行動ポイント
}
```

### 武器・防具システム
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

## ⚔️ 戦闘ターンシステム

### ターン構造
```
Phase 1: イニシアティブ決定
- 各メンバーのspeed値でソート
- 同速度の場合はランダム

Phase 2: 個人アクション実行
- 各メンバーが順番に行動選択
- TACTICAL_PATTERNS.mdの戦術パターン適用
- GM_CORE_MIND.md / PLAYER_MIND.mdで意思決定

Phase 3: 同時効果解決
- ダメージ適用
- 状態異常処理
- 戦闘終了判定
```

### アクション選択プロセス
```
1. 利用可能アクション抽出
   - 通常攻撃 (常時利用可能)
   - スキル使用 (コスト・クールダウンチェック)
   - 移動 (戦術的位置取り)
   - 防御・待機

2. TACTICAL_PATTERNS.md適用
   - 現在状況での最適パターン選択
   - 個性・クラス特性による修正
   - リスク・リターン評価

3. 最終アクション決定
   - パターン評価値計算
   - キャラクター個性による重み付け
   - 5%のランダム要素追加
```

## 🎯 戦闘アクション詳細処理

### 物理攻撃処理
```typescript
interface PhysicalAttack {
  attacker: CombatMember;
  target: CombatMember;
  weapon: CombatWeapon;

  // 計算結果
  hit_chance: number;            // (attacker.accuracy + weapon.accuracy_bonus) vs target.defense
  damage_roll: number;           // weapon.damage + attacker.attack
  final_damage: number;          // damage_roll - target.defense
  critical_hit: boolean;         // 5%確率で2倍ダメージ

  // ナラティブ生成
  narrative: string;             // "Kael swings his enchanted blade..."
  dialogue?: string;             // DIALOGUE_SYSTEM.mdから生成
}
```

### 魔法攻撃処理
```typescript
interface MagicAttack {
  caster: CombatMember;
  targets: CombatMember[];       // 単体/範囲攻撃
  spell: CombatSkill;

  // 計算結果
  cast_success: number;          // 詠唱成功率
  spell_power: number;           // caster.magic + spell.power
  damage_per_target: number[];   // 各ターゲットへのダメージ
  additional_effects: SkillEffect[]; // 状態異常等

  // ナラティブ生成
  incantation?: string;          // "Ancient flames, heed my call!"
  visual_effect: string;         // "crackling fireball streaks"
  impact_description: string;    // "explodes in brilliant flames"
}
```

## 📖 戦闘ナラティブ生成

### 詳細戦闘ログ構造
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
          "dialogue": "行くぞ！敵を叩く！",
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

### キャラクター個性による戦闘スタイル

#### Fighter系戦闘パターン (PLAYER_MIND.mdベース)
```
勇敢型Fighter:
- 優先アクション: charge_direct, berserker_rush
- 戦闘台詞: "恐れることはない！", "俺が盾になる！"
- 戦術的選択: 前線維持、味方庇護優先

慎重型Fighter:
- 優先アクション: defensive_formation, tactical_retreat
- 戦闘台詞: "様子を見よう", "慎重に行こう"
- 戦術的選択: 安全確保、確実な勝利狙い
```

#### Wizard系戦闘パターン
```
攻撃特化型Wizard:
- 優先アクション: focus_fire, 高威力呪文
- 戦闘台詞: "分析完了、弱点を突く", "この術式で決める"
- 戦術的選択: 最適なタイミングで最大効果

支援特化型Wizard:
- 優先アクション: healing_priority, tactical_coordination
- 戦闘台詞: "みんなが心配です", "回復を優先します"
- 戦術的選択: 味方支援、長期戦略重視
```

## 🧠 GM/プレイヤー戦闘判断統合

### GM視点戦闘制御 (GM_CORE_MIND.mdベース)
```
NPC戦闘行動決定:
1. 戦況評価 (0-10スケール)
   - プレイヤーパーティ脅威度
   - 自軍戦力残存度
   - 戦術的優位性

2. 物語的演出判断
   - 緊張感創出の必要性
   - ドラマティックなタイミング
   - キャラクター成長機会

3. NPC個性適用
   - NPC_PERSONALITIES.mdパターン
   - 一貫した行動原則
   - 感情的反応パターン
```

### プレイヤー視点戦闘判断 (PLAYER_MIND.mdベース)
```
キャラクター戦闘選択:
1. クラス適性評価
   - Fighter: 物理的解決法優先
   - Wizard: 戦略的・効率的解決

2. 個性特性適用
   - 勇敢度による前線意識
   - 慎重度による安全優先
   - 協調性による連携重視

3. 戦術パターン適用
   - TACTICAL_PATTERNS.mdから最適選択
   - 状況適合度 × 個性適性
   - 最終評価値による決定
```

---

このフレームワークにより、抽象的な`conflict`アクションを**真の剣と魔法の戦闘**に変換し、各キャラクターの個性と戦術的判断を完全に記録できます。