# Party Perspective Novel Conversion

## 目的

プレイログを特定パーティー視点の小説的ナラティブに変換する。ターンごとに「観察→思考→行動→結果」のサイクルを自然な物語として表現し、キャラクター心理と対話を重視した読み物を生成する。

## 基本方針

### ナラティブ構造
各ターンは以下の要素で構成：
1. **状況観察** - そのパーティーが何を見て、感じたか
2. **内部思考** - パーティー内でどう相談し、何を考えたか
3. **行動実行** - 決定した行動とその実行過程
4. **結果認識** - 行動結果と他者の反応をどう受け取ったか

### 文体・語調
- **一人称複数視点**: 「私たち」「我々」を主語とする
- **現在進行形**: 体験しているような臨場感を演出
- **内省的描写**: 意思決定の心理過程を詳述
- **対話重視**: キャラクター間の会話で関係性を表現

## 入力仕様

```json
{
  "playlog": {
    "entries": [/* LifePlayEntry[] */],
    "finalWorld": {/* LifeSimulationWorldState */}
  },
  "focusPartyId": "emerald_hunters",
  "narrativeStyle": "novel" | "journal" | "memoir",
  "characterProfile": {
    "partyName": "エメラルド・ハンターズ",
    "leadershipStyle": "collaborative_democracy",
    "decisionMaking": "cautious_analytical",
    "communicationStyle": "diplomatic_direct",
    "coreValues": ["mutual_benefit", "knowledge_pursuit", "strategic_patience"],

    // 🆕 個人メンバー定義（具体的な名前と役割による対話生成）
    "partyMembers": [
      {
        "name": "アリア",
        "role": "リーダー",
        "personality": "分析的",
        "speechStyle": "冷静で理論的、データを重視した発言",
        "specialization": "戦略立案"
      },
      {
        "name": "カイト",
        "role": "スカウト",
        "personality": "慎重",
        "speechStyle": "簡潔で実用的、リスクを重視した警告",
        "specialization": "偵察・危険察知"
      },
      {
        "name": "ミラ",
        "role": "学者",
        "personality": "好奇心旺盛",
        "speechStyle": "学術的で詳細、発見への興奮を表現",
        "specialization": "知識・研究"
      }
    ],

    "speechPatterns": {
      "internal": "丁寧語、分析的、慎重",
      "external": "礼儀正しく、明確、交渉上手"
    }
  },
  "options": {
    "emotionalDepth": "high",
    "dialogueDetail": "extensive",
    "environmentalDescription": "rich",
    "introspectionLevel": "deep"
  }
}
```

## 出力構造

### メイン構成
```markdown
# [パーティー名] の記録 — [期間]

## 🆕 パーティー紹介
### 私たちについて

私たちは[パーティー名]。[パーティーの基本コンセプト・目標]を掲げて活動する冒険者たちです。

**メンバー構成:**

**[名前1]**（[役割]）
: [個性・性格の説明]。[専門分野]に長けており、[典型的な発言スタイルの説明]。チーム内では[役割・責任]を担っている。

**[名前2]**（[役割]）
: [個性・性格の説明]。[専門分野]を得意とし、[典型的な発言スタイルの説明]。私たちの[役割・責任]として活動している。

**[名前3]**（[役割]）
: [個性・性格の説明]。[専門分野]への深い知識を持ち、[典型的な発言スタイルの説明]。[役割・責任]で貢献している。

**私たちの行動方針:**
- **[価値観1]**: [具体的な行動指針の説明]
- **[価値観2]**: [具体的な行動指針の説明]
- **[価値観3]**: [具体的な行動指針の説明]

---

## プロローグ
[背景設定、初期状況、目標の説明]

## 第一章: [テーマ的タイトル]
### ターン1-5の物語

## 第二章: [テーマ的タイトル]
### ターン6-12の物語

## エピローグ
[総括、学び、今後への示唆]
```

### ターン内構造テンプレート（🆕 個人名活用版）

```markdown
**ターン X: [行動タイプ] — [簡潔な要約]**

[環境・状況描写]

「[内部対話1]」とアリアが地図を指差しながら分析する。私たちは互いに視線を交わす。[心理描写]。

[観察した状況の詳細]。これを受けて、私たちは[思考プロセス]。

「[戦略的提案]」とアリアが慎重に述べる。
「[リスク評価]」とカイトが警告を加える。
「[学術的見解]」とミラが興奮気味に付け加える。
「[最終決定]」私たちは合意に達する。

[行動実行の過程描写]

[他者との相互作用がある場合]
「[外部対話1]」とアリアが[相手方]に礼儀正しく提案する。
「[相手の応答]」[相手の名前]が答える。
「[私たちの応答]」とカイトが実用的な観点から応じる。

[結果の認識と感情的反応]

---
```

### 🆕 個人メンバー活用ガイドライン

**対話の割り振り原則:**
- **戦略・分析**: アリア（リーダー）が主導
- **危険・リスク警告**: カイト（スカウト）が担当
- **知識・発見への興奮**: ミラ（学者）が表現
- **合意形成**: 全員参加の合議制で決定

**話法の個性化:**
```markdown
アリア: 「データを整理すると、この選択肢が最も合理的です」
カイト: 「ちょっと待て。その道は危険すぎる」
ミラ: 「興味深い！古代文献にも似た記録があります」
```

**専門性に応じた役割分担:**
- **戦略立案**: アリアが全体戦略を提案
- **偵察・警戒**: カイトが危険察知と状況報告
- **知識・研究**: ミラが学術的背景と発見の価値を説明

## キャラクター性格パターン

### リーダーシップタイプ
- **collaborative_democracy**: 全員の意見を聞いて合議
- **experienced_guidance**: リーダーが方針決定、メンバーが助言
- **specialization_based**: 専門分野別に判断権を委譲
- **adaptive_situational**: 状況に応じてリーダーシップ形式を変更

### 意思決定スタイル
- **cautious_analytical**: リスク評価重視、長期計画指向
- **bold_opportunistic**: 機会重視、積極的行動
- **balanced_pragmatic**: 現実的、バランス重視
- **innovative_experimental**: 新しいアプローチを好む

### コミュニケーション様式
- **diplomatic_direct**: 礼儀正しく明確
- **friendly_casual**: 親しみやすく気さく
- **professional_formal**: ビジネスライク、効率重視
- **warm_empathetic**: 感情に配慮、関係性重視

## 変換処理アルゴリズム

### 段階1: データ準備
```
for each entry in playlog.entries:
  if focusPartyId in entry.participants:
    extract relevant context from entry.meta.llmDecision
    extract narrative elements from entry.narrative
    identify other parties involved
    calculate resource/relationship changes
```

### 段階2: 物語構築
```
group entries by narrative arc (5-8 turns per chapter)
for each chapter:
  identify central theme/conflict
  select representative key moments
  develop character arc progression
```

### 段階3: 文章生成
```
for each turn:
  generate environmental setting
  create internal dialogue based on meta.llmDecision
  develop external interactions based on participants
  describe emotional responses to outcomes
  transition to next turn context
```

## 品質要件

### 物語の一貫性
- キャラクター性格の一貫性維持
- 時系列の論理的連続性
- 感情的弧を通じた成長描写

### 技術的正確性
- プレイログの数値データと100%整合
- 行動の因果関係の正確な反映
- 他パーティーとの相互作用の客観的記述

### 読み物としての品質
- 自然な日本語での物語記述
- キャラクター間の差別化された対話
- 読者の感情移入を促す心理描写

## 使用例

### 入力プレイログエントリー
```json
{
  "step": 5,
  "type": "market_trade",
  "participants": ["emerald_hunters", "fire_forge_guild"],
  "narrative": "エメラルド・ハンターズが木材10単位を通貨30で購入",
  "meta": {
    "llmDecision": {
      "state_digest": "木材不足、建設資材必要、火の鍛冶ギルドと交渉機会",
      "reasoning": "長期建設計画のため安定供給源確保が重要",
      "framework_evaluation": {...}
    }
  },
  "deltas": {
    "currency:emerald_hunters": -30,
    "trust:emerald_hunters:fire_forge_guild": +1
  }
}
```

### 出力ナラティブ例
```markdown
**ターン5: 木材調達交渉 — 建設計画への第一歩**

市場の喧騒の中、私たちは火の鍛冶ギルドの露店前に立っていた。積み上げられた良質な木材が朝日に照らされ、その木目の美しさが目を引く。

「建設計画を進めるには、やはり信頼できる供給源が必要だ」と私たちは小声で相談する。手持ちの通貨30は決して少なくない額だが、長期的な視野に立てば必要な投資だろう。

火の鍛冶ギルドの商人が私たちに気づいて近づいてくる。その表情は友好的で、過去の取引での信頼関係が感じられる。

「木材10単位をお譲りいただきたいのですが」と私たちは丁寧に切り出す。
「もちろんです。エメラルド・ハンターズの皆さんでしたら、通貨30でいかがでしょう」相手の返答は迅速で、価格も妥当だ。
「ありがとうございます。今後ともよろしくお願いいたします」

取引は円滑に進み、質の良い木材を手に入れることができた。この交渉で築いた信頼は、きっと将来の協力関係の礎となるだろう。私たちは満足げに新たな建設資材を見つめている。

---
```

## 注意事項

### 創作範囲の制限
- 数値データ（通貨、リソース変化）は厳格に遵守
- 参加者、行動タイプは改変禁止
- 時系列順序は変更不可

### 補完可能要素
- キャラクターの感情・動機
- 環境・雰囲気の描写
- 対話の具体的内容（論理的整合性保持下で）
- 意思決定の心理過程