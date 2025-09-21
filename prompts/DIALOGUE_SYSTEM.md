# DIALOGUE_SYSTEM.md - キャラクター対話システム

## 🗣 キャラクター固有の口調・語彙

### 基本個性による話し方パターン

#### Fighter（戦士）系キャラクター
```
勇敢型 (courage > 5):
- "行くぞ！" "任せろ！" "恐れることはない"
- 断定的、短文、行動重視
- 語尾: だ/である調

慎重型 (wisdom > 5):
- "様子を見よう" "慎重に行こう" "まずは状況を確認だ"
- 提案形、分析的
- 語尾: しよう/だろう調
```

#### Wizard（魔法使い）系キャラクター
```
知的型 (wisdom > 5):
- "分析すると..." "理論的には..." "データによれば"
- 論理的、専門用語多用
- 語尾: である/だ調（学術的）

共感型 (empathy > 5):
- "みんなが心配です" "怪我はありませんか？" "一緒に頑張りましょう"
- 気遣い、感情表現豊富
- 語尾: です/ます調（丁寧）
```

### 関係性レベルによる話し方変化

```typescript
interface DialogueStyle {
  formality: number;     // 0-10: フォーマル度
  warmth: number;        // 0-10: 親しみやすさ
  directness: number;    // 0-10: 直接性
  concern: number;       // 0-10: 相手への配慮
}

function getDialogueStyle(relationship: Relationship): DialogueStyle {
  const familiarity = relationship.familiarity / 10.0;
  const trust = Math.max(0, relationship.trust) / 10.0;
  const respect = Math.max(0, relationship.respect) / 10.0;

  return {
    formality: Math.max(0, 8 - familiarity * 6),     // 親密度が高いほどカジュアル
    warmth: trust * 7 + familiarity * 3,             // 信頼と親しみやすさで温かみ
    directness: familiarity * 5 + respect * 3,       // 関係性が深いほど直接的
    concern: trust * 6 + (relationship.empathy || 0) * 4  // 信頼度と共感性で配慮度
  };
}
```

## 💬 状況に応じた発言選択

### 戦闘状況での発言パターン

#### 攻撃時
```typescript
function getCombatDialogue(action: string, personality: PersonalityEvolution, target: string): string {
  const courage_level = personality.courage;
  const wisdom_level = personality.wisdom;

  switch (action) {
    case 'attack':
      if (courage_level > 7) {
        return ["真っ向勝負だ！", "正面から行くぞ！", "力と力のぶつかり合いだ！"][Math.floor(Math.random() * 3)];
      } else if (wisdom_level > 5) {
        return ["隙を突く", "戦術的に行こう", "冷静に狙いを定めて"][Math.floor(Math.random() * 3)];
      }
      return "攻撃する";

    case 'heal':
      if (personality.empathy > 6) {
        return `${target}、大丈夫？今回復します！`;
      } else if (personality.leadership > 5) {
        return `${target}、戦線維持のため回復する`;
      }
      return `${target}を回復`;
  }
}
```

#### HP危機時
```typescript
function getEmergencyDialogue(hp_ratio: number, personality: PersonalityEvolution): string {
  if (hp_ratio < 0.3) {
    if (personality.courage > 7) {
      return ["まだやれる！", "これしきで負けるか！", "諦めるものか！"][Math.floor(Math.random() * 3)];
    } else if (personality.wisdom > 5) {
      return ["戦術的撤退を考慮すべきかも", "状況が厳しい", "別のアプローチが必要だ"][Math.floor(Math.random() * 3)];
    } else {
      return ["やばい...", "このままじゃ危険だ", "助けてくれ！"][Math.floor(Math.random() * 3)];
    }
  }
  return "";
}
```

### 探索・移動時の発言

```typescript
function getExplorationDialogue(environment: EnvironmentState, personality: PersonalityEvolution): string {
  const responses = [];

  // 環境への反応
  switch (environment.weather) {
    case 'storm':
      if (personality.adaptability > 6) {
        responses.push("嵐か...面白い挑戦だ");
      } else {
        responses.push("この嵐は厄介だな");
      }
      break;
    case 'fog':
      if (personality.wisdom > 6) {
        responses.push("視界が悪い。慎重に進もう");
      } else if (personality.courage > 7) {
        responses.push("霧なんて関係ない、進むぞ");
      }
      break;
  }

  // 照明への反応
  if (environment.lighting === 'dark' && personality.courage < 4) {
    responses.push("暗くて不安だ...");
  }

  return responses[Math.floor(Math.random() * responses.length)] || "";
}
```

## 😊 感情状態の表現方法

### 感情状態の定義
```typescript
interface EmotionalState {
  battle_stress: number;    // 0-10: 戦闘ストレス
  confidence: number;       // 0-10: 自信度
  team_morale: number;      // 0-10: チーム士気
  curiosity: number;        // 0-10: 探索意欲
  fatigue: number;         // 0-10: 疲労度
}
```

### 感情状態による発言の変調

```typescript
function applyEmotionalTone(base_dialogue: string, emotional_state: EmotionalState): string {
  let modified = base_dialogue;

  // 高ストレス時の変調
  if (emotional_state.battle_stress > 7) {
    modified = modified.replace(/。$/, "！");  // 語調を強める
    modified = modified.replace(/だ$/, "だ！");
  }

  // 低自信時の変調
  if (emotional_state.confidence < 3) {
    modified = modified.replace(/！$/, "...");  // 迷いを表現
    modified = "もしかして..." + modified;
  }

  // 高疲労時の変調
  if (emotional_state.fatigue > 8) {
    modified = "はあ..." + modified;  // 疲れを表現
    modified = modified.replace(/だ$/, "だけど...");
  }

  return modified;
}
```

### チーム内コミュニケーション

#### 提案・相談時
```typescript
function getConsultationDialogue(
  suggestion: string,
  target_relationship: Relationship,
  personality: PersonalityEvolution
): string {
  const style = getDialogueStyle(target_relationship);

  if (personality.leadership > 6 && style.directness > 5) {
    return `${suggestion}で行こう`;
  } else if (style.formality > 6) {
    return `${suggestion}はいかがでしょうか？`;
  } else if (target_relationship.respect > 7) {
    return `君の意見も聞きたいが、${suggestion}はどうだ？`;
  } else {
    return `${suggestion}という手もある`;
  }
}
```

#### 同意・反対時
```typescript
function getResponseDialogue(
  agreement: boolean,
  target_relationship: Relationship,
  personality: PersonalityEvolution
): string {
  const respect_level = target_relationship.respect;
  const trust_level = target_relationship.trust;

  if (agreement) {
    if (respect_level > 7) {
      return "さすがだ、その通りだ";
    } else if (trust_level > 5) {
      return "同感だ、やってみよう";
    } else {
      return "賛成する";
    }
  } else {
    if (respect_level > 7) {
      return "申し訳ないが、別の案を考えたい";
    } else if (personality.wisdom > 6) {
      return "少し検討が必要かもしれない";
    } else {
      return "ちょっと違う気がする";
    }
  }
}
```

## 🎭 発言の実装フロー

### リアルタイム発言生成
1. **状況分析**: 現在の戦闘/探索状況を把握
2. **関係性チェック**: 対象キャラクターとの関係性レベル確認
3. **性格特性適用**: 個性に基づく基本発言パターン選択
4. **感情状態反映**: 現在の感情状態で発言を変調
5. **関係性調整**: 相手との関係に応じた敬語・親しみやすさ調整
6. **最終出力**: 自然な日本語として発言を生成

このシステムにより、各キャラクターは状況・関係性・個性に応じた生き生きとした対話を行い、物語に深みと臨場感をもたらす。