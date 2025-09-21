# AI Agent File-Based Workflow

このドキュメントは、AI Coding Agent（Claude Code 等）が autonomous TRPG セッションを実行するためのワークフローガイドです。

## 🎯 設計原則

- **AI Agent 主導**: Claude Code 等の AI Coding Agent が判断・実行
- **新規コード実装禁止**: すでに実装済みツールのみを利用し、新たな自動化スクリプトなどは実装しない
- **永続化重視**: 全ての状態・決定をファイルに記録
- **完全自律**: 人間の介入なしで完全なセッション実行

## 🔧 システム構成

### ディレクトリ構造

```
autonomous_sessions/
├── inputs/                      # AI Agent 入力ファイル置き場
│   ├── world_initial.json      # AI Agent が作成する初期世界状態
│   └── session_config.json     # AI Agent が作成するセッション設定
├── sessions/                    # セッション管理
│   └── session_YYYYMMDD_HHMMSS/
│       ├── metadata.json
│       ├── world_initial.json
│       ├── world_current.json
│       ├── world_prev.json       # 前回状態（worldStateDiff計算用）
│       ├── world_final.json
│       ├── playlog.jsonl
│       └── narrative.md
└── ai_workspace/               # AI Agent作業領域
    ├── decision_requests/      # 決定要求（エンジン→AI Agent）
    ├── decision_responses/     # 決定応答（AI Agent→エンジン）
    ├── world_snapshots/       # 世界状態スナップショット
    └── results/               # 処理結果ファイル（各ツール実行結果）
        ├── session_result.json
        ├── process_result.json
        └── next_turn_result.json
```

## 🚀 AI Agent 実行フロー

### Phase 1: セッション初期化

**事前準備**: 入力ディレクトリの作成

1. **入力ディレクトリ初期化**: AI Agent が標準ディレクトリ構造を作成

```bash
# Bash ツールでディレクトリ構造作成
mkdir -p autonomous_sessions/inputs
mkdir -p autonomous_sessions/ai_workspace/decision_requests
mkdir -p autonomous_sessions/ai_workspace/decision_responses
mkdir -p autonomous_sessions/ai_workspace/world_snapshots
mkdir -p autonomous_sessions/ai_workspace/results
```

**重要**: すべての入力ファイルは `autonomous_sessions/inputs/` 配下に配置してください。これによりファイルパスが統一され、AI Agent の実行が予測可能になります。

**AI Agent 世界構築**: 初期世界状態の設計・作成

2. **世界設計**: AI Agent が地理・政治・経済状況を決定

   - 地域数と配置決定（AI Agent が適切なマップサイズを決定）
   - 各地域の名前・タイプ・特性を AI Agent が創造（forest, settlement, ruins, mountains, lakes 等）
   - 地域間の接続関係（neighbors）を AI Agent が設計
   - 各地域の容量・資源・特殊効果を AI Agent が設定
   - 初期市場価格を AI Agent が経済バランスを考慮して設定

3. **パーティー設計**: AI Agent が多様なパーティーを作成

   - パーティー数と配置決定
   - 各パーティーの能力値設定（exploration, trade, combat, diplomacy, crafting）
   - 初期リソース配分（currency, materials）
   - パーティー個性と目標設定
   - **各パーティは他のパーティと敵対や同盟関係にあり、パーティ間イベントが頻繁に発生するよう設定すること**
   - **パーティ間関係値の初期設定**: 各パーティペア間の初期関係を明確に定義
   - **Character Profile Configuration**: 各パーティーに具体的なキャラクター設定を適用

**Character Profile Configuration**:

```json
{
  "characterProfile": {
    "leadershipStyle": "collaborative_democracy",
    "decisionMaking": "cautious_analytical",
    "communicationStyle": "diplomatic_direct",

    // 🆕 個人メンバー定義（具体的な名前による対話生成）
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
  }
}
```

**Benefits**:

- Technical logs become immersive character-driven stories with named individuals
- **🆕 Specific character dialogue**: "アリアが地図を指差しながら" instead of "メンバーの一人が"
- **🆕 Role-based specialization**: Each member contributes according to their expertise
- **🆕 Party member introductions**: Each narrative begins with detailed member descriptions and party philosophy
- Deep psychological insight into party decision-making processes
- Rich dialogue and environmental descriptions with individual personality traits
- Maintains 100% data accuracy while achieving novel-quality readability

4. **パーティ間関係値初期化**: AI Agent がパーティペア間の初期関係を設定

**関係値初期化原則**:
```typescript
// 基本的な関係値分布（推奨）
relationshipDistribution = {
  敵対関係: "20-30%のペア", // hostility: 6-8, cooperation: 1-3
  中立関係: "40-50%のペア", // 全値: 4-6の範囲
  友好関係: "20-30%のペア", // cooperation: 6-8, trust: 6-8
  競争関係: "パワーバランス調整用" // competition: 7-9
};

// ペアID命名規則
pairId = `${alphabeticalFirst}_id__${alphabeticalSecond}_id`;
// 例: "emerald_hunters__fire_forge_guild"

// 関係値設定の戦略的考慮
strategicConsiderations = {
  地理的近接: "隣接地域のパーティは高competition",
  能力補完: "異なる専門性→高cooperation可能性",
  能力競合: "同じ専門性→高competition",
  物語的対立: "設定上の敵対→高hostility",
  バランス: "1つの支配勢力を避ける分散配置"
};
```

**具体的初期化例**:
```json
{
  "emerald_hunters__fire_forge_guild": {
    "hostility": 2,     // 低敵対（貿易パートナー可能性）
    "cooperation": 6,   // 高協力（探索vs製作の補完関係）
    "competition": 3,   // 低競争（異なる専門分野）
    "trust": 5,         // 中立信頼
    "lastInteraction": "turn_0",
    "history": []
  },
  "emerald_hunters__shadow_syndicate": {
    "hostility": 7,     // 高敵対（設定上の対立）
    "cooperation": 1,   // 低協力
    "competition": 8,   // 高競争（同じ地域での活動）
    "trust": 2,         // 低信頼
    "lastInteraction": "turn_0",
    "history": []
  }
}
```

5. **初期世界状態ファイル作成**: `Write` ツールで `autonomous_sessions/inputs/world_initial.json` 作成

```json
{
  "parties": {
    "[party_id]": {
      "id": "[party_id]",
      "name": "[AI Agentが決定した名前]",
      "location": "[AI Agentが決定した配置]",
      "resources": { "currency": "[AI決定値]", "materials": {...} },
      "capabilities": { "exploration": "[AI決定値]", ... },
      "morale": "[AI決定値]",
      "characterProfile": {
        "leadershipStyle": "[AI決定値]",
        "decisionMaking": "[AI決定値]",
        "communicationStyle": "[AI決定値]",
        "partyMembers": [
          {
            "name": "[AI創造のメンバー名]",
            "role": "[AI決定役割]",
            "personality": "[AI決定個性]",
            "speechStyle": "[AI決定話し方]",
            "specialization": "[AI決定専門分野]"
          }
        ],
        "speechPatterns": {
          "internal": "[AI決定内部コミュニケーション]",
          "external": "[AI決定外部コミュニケーション]"
        }
      }
    }
  },
  "regions": {
    "[AI創造の地域ID]": {
      "id": "[AI創造の地域ID]",
      "name": "[AI Agentが創造した地域名]",
      "type": "[AI Agentが決定したタイプ: forest/settlement/ruins/mountains/desert/lake等]",
      "capacity": "[AI決定値]",
      "neighbors": ["[AI設計の隣接地域ID配列]"],
      "occupantParties": ["[AI配置のパーティー]"],
      "resources": ["[AI設定の地域固有資源]"],
      "specialEffects": ["[AI設定の特殊効果]"],
      "influence": {}
    }
  },
  "market": {
    "currentPrices": { "[AI Agentが決定した価格設定]" },
    "priceHistory": [],
    "completedTrades": []
  },
  "relationships": {
    "[party1_id]__[party2_id]": {
      "hostility": "[AI決定値 0-10]",
      "cooperation": "[AI決定値 0-10]",
      "competition": "[AI決定値 0-10]",
      "trust": "[AI決定値 0-10]",
      "lastInteraction": "turn_0",
      "history": []
    },
    "[party1_id]__[party3_id]": {
      "hostility": "[AI決定値]",
      "cooperation": "[AI決定値]",
      "competition": "[AI決定値]",
      "trust": "[AI決定値]",
      "lastInteraction": "turn_0",
      "history": []
    }
  },
  "turn": 1,
  "worldAge": 1,
  "narrativeContext": {}
}
```

5. **セッション設定ファイル作成**: `Write` ツールで `autonomous_sessions/inputs/session_config.json` 作成

```json
{
  "sessionName": "[AI Agentが決定したセッション名]",
  "maxTurns": "[AI決定値]",
  "stopConditions": {
    "[AI Agentが設定した終了条件]": "[AI決定値]"
  }
}
```

6. **ツール実行**: セッション開始

- `npx tsx src/start_session.ts autonomous_sessions/inputs/world_initial.json autonomous_sessions/inputs/session_config.json`

**注意**: 環境変数 `AUTONOMOUS_SESSIONS_DIR` の設定は任意です。設定しない場合は自動的に `./autonomous_sessions` がデフォルトディレクトリとして使用されます。特定のディレクトリを指定したい場合のみ環境変数を設定してください：

```bash
# デフォルト実行（推奨）
npx tsx src/start_session.ts autonomous_sessions/inputs/world_initial.json autonomous_sessions/inputs/session_config.json

# カスタムディレクトリを使用する場合
AUTONOMOUS_SESSIONS_DIR=./custom_sessions npx tsx src/start_session.ts custom_sessions/inputs/world_initial.json custom_sessions/inputs/session_config.json
```

**start_session.ts の処理内容**:

- AI Agent が作成した `world_initial.json` を読み込み
- セッション管理ディレクトリを作成（`autonomous_sessions/sessions/session_YYYYMMDD_HHMMSS/`）
- 初期世界状態を `world_initial.json` として保存
- AI Agent 作業用ディレクトリ（`ai_workspace/`）を初期化
- 最初のターンの決定要求ファイルを生成

**出力ファイル**: `autonomous_sessions/ai_workspace/results/session_result.json`

```json
{
  "sessionId": "session_20250917_143022",
  "status": "ready",
  "firstTurnRequests": ["request_GM_143023.json", "request_party1_143024.json"],
  "workspaceDir": "./autonomous_sessions/ai_workspace/"
}
```

**生成される決定要求ファイル例**:

**GM 用**: `ai_workspace/decision_requests/request_GM_143023.json`

```json
{
  "requestId": "request_GM_143023",
  "timestamp": "2025-09-17T14:30:23Z",
  "sessionId": "session_20250917_143022",
  "worldStateFile": "../sessions/session_20250917_143022/world_current.json",
  "framework": {
    "role": "GM"
  },
  "contextData": {
    "marketData": { "currentPrices": {...}, "totalVolume": 0 },
    "worldSummary": { "turn": 1, "totalParties": 4, "activeRegions": 6 },
    "availableActions": ["price_update", "environmental_change", "market_event"],
    "recentHistory": []
  },
  "instructions": "[GM決定用指示: worldStateFileを読み込んで完全な世界状態を取得してください]"
}
```

**パーティー用**: `ai_workspace/decision_requests/request_party1_143024.json`

```json
{
  "requestId": "request_party1_143024",
  "timestamp": "2025-09-17T14:30:24Z",
  "sessionId": "session_20250917_143022",
  "worldStateFile": "../sessions/session_20250917_143022/world_current.json",
  "framework": {
    "role": "Player",
    "actorId": "party1_explorer"
  },
  "contextData": {
    "partyState": {
      "id": "party1_explorer",
      "name": "[AI Agentが決定したパーティー名]",
      "location": "[現在位置]",
      "resources": { "currency": 120, "materials": {...} },
      "capabilities": { "exploration": 8, "trade": 4, "combat": 6 },
      "morale": 7
    },
    "visibleRegions": [
      { "id": "current_region", "isAccessible": true, "resources": [...] },
      { "id": "neighboring_region", "isAccessible": true, "distance": 1 }
    ],
    "marketData": { "currentPrices": {...}, "recentTrades": [...] },
    "availableActions": ["move", "explore", "trade", "cooperate", "market_trade"],
    "recentHistory": []
  },
  "instructions": "[Player決定用指示: worldStateFileを読み込んで完全な世界状態を取得してください]"
}
```

### Phase 2: AI Agent 決定処理

#### Step 1: 決定要求の読み込み

**ツール実行**: ファイル読み込み

- `Read` ツールで `./autonomous_sessions/ai_workspace/decision_requests/` 内の全`.json`ファイルを読み込み
- 各ファイルから JSON 解析して `request` オブジェクト取得

**データ解析**: 要求内容の確認

- `request.requestId`: 要求 ID
- `request.framework.role`: 'GM' または 'Player'

#### Step 2: 世界状態取得と判断

**ツール実行**: 世界状態読み込み

- `Read` ツールで `request.worldStateFile` から完全な世界状態を読み込み

**AI Agent 判断処理**: 既読フレームワークによる意思決定

**重要原則**:

- フレームワークの評価軸を数値的に適用（0-10 点スケール）
- キャラクター個性と専門性を行動決定に反映
- 簡潔で具体的な selectedReasoning を記録

1. **世界状態分析**: 読み込んだ世界状態と `request.contextData` から現状把握
2. **フレームワーク適用**: `request.framework.role` に基づいて適切なフレームワーク（GM_CORE_MIND.md または PLAYER_MIND.md）の評価基準を適用
   - **GM 役**: 挑戦度軸、物語軸、バランス軸で環境や NPC の行動を評価
   - **Player 役**: キャラクター個性、専門性、リスク評価で行動を選択
3. **選択肢生成**: `request.contextData.availableActions` から可能なアクション選択肢を作成・評価
4. **スコア計算**: フレームワークの評価軸に従って各選択肢にスコア付け（0-10 点）
5. **最適行動選択**: 最高スコアの選択肢を決定し、評価詳細を記録

#### Step 3: アクション提案作成

**データ生成**: 決定応答 JSON 構造（world_current.json 変更指示のみ）

```json
{
  "requestId": "[request.requestId]",
  "timestamp": "[現在時刻のISO文字列]",
  "status": "completed",
  "proposal": {
    "type": "[選択したアクションタイプ]",
    "participants": ["[actor_id_or_GM]"],
    "effects": [
      {
        "target": "/path/to/state",
        "operation": "set|add",
        "value": "[変更値]"
      }
    ]
  },
  "meta": {
    "frameworkEvaluation": {
      "challengeBalance": 8,
      "narrativeTension": 7,
      "selectedReasoning": "高い協力レベルに対し新たな高価値資源で探索競争のバランスを創出"
    }
  }
}
```

**Player 用決定応答例**:

```json
{
  "requestId": "request_emerald_hunters_143024",
  "timestamp": "2025-09-18T02:30:30.000Z",
  "status": "completed",
  "proposal": {
    "type": "explore",
    "participants": ["emerald_hunters"],
    "effects": [
      {
        "target": "parties/emerald_hunters/resources/materials",
        "operation": "add",
        "value": { "rare_crystals": 4, "gems": 3 }
      }
    ]
  },
  "meta": {
    "frameworkEvaluation": {
      "explorationSpecialty": 9,
      "riskAssessment": 7,
      "resourceValue": 8,
      "selectedReasoning": "探索特化パーティーとして高品質結晶発見の好機を活用"
    }
  }
}
```

**ツール実行**: 応答ファイル保存

- `Write` ツールで `./autonomous_sessions/ai_workspace/decision_responses/${request.requestId}.json` に上記 JSON を保存

### Phase 3: 実行結果確認

**ツール実行**: AI 応答処理

- `npx tsx src/process_ai_responses.ts [sessionId]`
- 出力ファイル: `autonomous_sessions/ai_workspace/results/process_result.json`

**エラーがある場合**:

```json
{
  "processedDecisions": 4,
  "actionsExecuted": 3,
  "errors": [
    {
      "requestId": "request_party2_143025",
      "error": "Invalid action: insufficient currency",
      "details": "Party requires 50 currency but has only 30"
    }
  ],
  "failedDecisions": ["request_party2_143025"],
  "nextStatus": "error"
}
```

**全て成功した場合**:

```json
{
  "processedDecisions": 4,
  "actionsExecuted": 4,
  "errors": [],
  "failedDecisions": [],
  "nextStatus": "turn_completed"
}
```

**セッション完了の場合**:

```json
{
  "processedDecisions": 2,
  "actionsExecuted": 2,
  "errors": [],
  "failedDecisions": [],
  "nextStatus": "completed"
}
```

**process_ai_responses.ts の処理内容**:

- AI Agent が作成した決定応答ファイルを読み込み・JSON スキーマ検証実行
- 各アクションをゲームエンジンで実行・結果記録
- **完全なプレイログエントリ生成**:
  - AI Agent の思考プロセス復元（frameworkEvaluation: 評価軸とスコア）
  - 詳細ナラティブ生成
  - step 番号自動採番、actor 記録
- 世界状態を更新（`world_current.json`に保存）
- **処理済みファイルの段階的クリーンアップ**:
  - **成功時**: 成功した決定要求・応答ファイルペアのみ即座削除
  - **失敗時**: 失敗したファイルペアは保持（`errors`配列に詳細記録）
  - **リトライ完了時**: リトライ制限超過でスキップされたファイルも削除
  - **競合状態防止**: ファイル操作時はファイルロック確認後に実行

**AI Agent のエラー対応**:

- `autonomous_sessions/ai_workspace/results/process_result.json`の`errors`配列を確認
- 失敗した決定要求について:
  1. **エラー内容を分析**:
     - `currency 不足`: リソース計算ミス → 正確な残量で再計算
     - `invalid action`: 無効なアクションタイプ → 利用可能アクションから選択
     - `Schema validation failed`: **target path レベル不足** → "parties/party_id" 形式に修正
     - `Schema validation failed`: **無効な operation** → "set" または "add" のみ使用
  2. **修正された決定応答ファイルを再作成** （失敗した requestId のみ）
  3. `npx tsx src/process_ai_responses.ts [sessionId]`を再実行

**エラー処理制限**:

- **最大リトライ回数**: 同一決定要求につき最大 3 回まで再試行
- **リトライ超過時**: 該当決定をスキップし、他の決定を継続処理
- **デッドロック防止**: 全決定が 3 回連続失敗した場合、セッションを強制終了
- **エラーログ記録**: 失敗した決定とエラー理由を`error_log.json`に永続化

**継続処理**: AI Agent 主導ループ

**nextStatus の 5 つの状態**:

- `'error'`: 処理失敗、AI Agent が失敗した決定を修正・再処理（リトライ制限内）
- `'error_abort'`: エラー処理制限超過、セッション強制終了
- `'partial_success'`: 一部の決定が成功、失敗した決定の修正が必要
- `'turn_completed'`: ターン完了、AI Agent が次ターンの決定要求生成
- `'completed'`: セッション完了、AI Agent が Phase 4（ナラティブ生成）へ進行

**AI Agent 継続条件**:

- `nextStatus: "error"`: 失敗した決定要求を修正して再実行（リトライカウンタ確認）
- `nextStatus: "error_abort"`: エラーログ出力後、セッション強制終了
- `nextStatus: "partial_success"`: **成功した決定のプレイログ作成・追記** → **失敗した決定の修正・再実行** → 全成功後に次ターン生成
- `nextStatus: "turn_completed"`: **プレイログ作成・追記** → **次ターン決定要求生成**
- `nextStatus: "completed"`: **最終プレイログ作成・追記** → Phase 5（ナラティブリプレイ生成）へ進行

### Phase 4: プレイログ作成・追記

**ターン完了時（`nextStatus: "turn_completed"`）の処理**:

1. **ターンプレイログ作成**: AI Agent がそのターンのナラティブを生成

**AI Agent 実行手順**:

a) **処理済み決定応答ファイルからの情報収集**:

- `Read`ツールで`ai_workspace/decision_responses/`内の全`.json`ファイルを読み込み
- 各ファイルから以下の情報を抽出:
  - `meta.llmDecision.character_voices`: キャラクター台詞
  - `meta.llmDecision.selectedAction.reasoning`: 行動理由・動機
  - `proposal.type`と`proposal.effects`: 実行されたアクション詳細
  - `meta.llmDecision.optionsConsidered`: 検討された選択肢
- 時系列順（timestamp または requestId 順）に行動を整理

b) **世界状態変化の分析**:

- `Read`ツールで`sessions/[sessionId]/world_current.json`から最新世界状態を取得
- 前ターンからの変化を特定:
  - パーティー状態変化（リソース、士気、位置等）
  - 市場価格変動
  - 地域状況変化
  - 世界イベント発生・更新

c) **フォーカスパーティーの選択**:

- そのターンで最も重要/興味深い行動を行ったパーティーを選択
- 優先順位: 新規探索 > 初回交流 > 重要な取引 > クラフト > 移動
- 選択されたパーティー視点で物語を構築

d) **ナラティブ構造の生成**:

- フォーカスパーティーの内部視点を中心に構成
- 他パーティーの行動は環境情報・背景として組み込み
- キャラクター台詞を適切に配置
- 行動の動機と結果を因果関係で結合

**ツール実行**: ターンプレイログファイル作成

- `Write`ツールで`ai_workspace/turn_playlog.json`に以下の構造で保存:

```json
{
  "narrative": {
    "basicDescription": "火の鍛冶ギルドが市場で鉱石15単位を通貨50で購入",
    "internalPerspective": {
      "situationObservation": "市場で鉱石価格が上昇傾向、在庫確保の好機を発見",
      "internalDeliberation": "ファイターは即決を提案、ウィザードは価格分析と将来予測を重視して賛成",
      "actionMotivation": "鍛冶ギルドの中核能力である金属加工のため高品質鉱石が必要",
      "expectedOutcome": "次期鍛冶作業で高品質装備を製作し、競争優位性を確保"
    },
    "externalInteraction": {
      "approachStrategy": "信頼できる品質重視の鍛冶ギルドとしての評判を活用",
      "communicationSummary": [
        "市場価格の動向を確認",
        "品質保証された鉱石を要求",
        "迅速決済で良好な関係維持"
      ],
      "perceivedResponse": "市場参加者は鍛冶ギルドの専門性を認識し、品質重視の取引に応じる意向",
      "relationshipAssessment": "市場との継続的信頼関係が維持され、今後の優先取引が期待できる状況"
    },
    "outcomeReaction": {
      "immediateEmotionalResponse": "良質な鉱石確保への満足感と次の作業への期待",
      "strategicImplication": "鍛冶能力の活用機会増加、他パーティへの装備供給可能性",
      "futureDirectionAdjustment": "鉱石の定期調達と鍛冶製品の販売戦略検討",
      "teamMoraleImpact": "専門性を活かした成功により、ギルドメンバーの自信と結束が向上"
    },
    "environmentalContext": {
      "settingDescription": "活気ある市場広場、各種資源が取引される商業の中心地",
      "otherPartiesObservation": "他の探索パーティーも資源調達活動を活発化させている兆候",
      "worldStateAwareness": "全体的な探索・開発活動の増加により資源需要が高まっている状況"
    }
  }
}
```

**重要注意**: 決定応答ファイルのクリーンアップタイミング

- `process_ai_responses.ts`実行後、決定応答ファイルは自動削除される
- **必須**: `process_ai_responses.ts`実行直後に上記手順 a)を実行してナラティブ情報を保存
- 削除後は`meta.llmDecision.character_voices`等の詳細情報が失われる

2. **ツール実行**: プレイログ追記

- `npx tsx src/append_playlog.ts [sessionId] turn_playlog.json`

**append_playlog.ts の処理内容**:

- AI Agent が作成した`turn_playlog.json`（ナラティブのみ）を読み込み
- 対応する決定応答ファイルから`meta.frameworkEvaluation`情報を復元
- 現在の世界状態（`world_current.json`）を読み込み
- **段階的世界状態差分計算**:
  - **初回実行時**: `world_initial.json`と`world_current.json`を比較
  - **2 回目以降**: `world_prev.json`と`world_current.json`を比較
  - **差分計算後**: `world_current.json`を`world_prev.json`として保存（次回比較用）
- **完全なプレイログエントリ自動生成**:
  - `step`番号自動計算（既存 playlog.jsonl の最終 step + 1）
  - `type`, `participants`, `actor`を決定応答から復元
  - `effects`情報を決定応答から取得
  - `meta.frameworkEvaluation`を決定応答から復元（簡潔な評価情報記録）
  - `narrative`を AI Agent 作成データから取得
  - `worldStateDiff`自動生成（段階的比較による正確な変更差分）
  - `worldStateSnapshot`参照追加（`world_current.json`への相対パス）
- 完全なプレイログエントリを`playlog.jsonl`に追記

3. **ツール実行**: 次ターン決定要求生成

- `npx tsx src/generate_next_turn.ts [sessionId] ([targetTurn])`
  - `targetTurn` を省略すると `world_current.json` の現在ターン値に 1 を加算したターンが自動設定される
  - 巻き戻しや特定ターンの再生成が必要な場合のみ明示的に `targetTurn` を指定

**generate_next_turn.ts の処理内容**:

- 現在の世界状態（`world_current.json`）を読み込み
- 次ターン用の決定要求ファイルを生成：
  - GM 用: `ai_workspace/decision_requests/request_GM_[timestamp].json`
  - 各パーティー用: `ai_workspace/decision_requests/request_[partyId]_[timestamp].json`
- 各決定要求ファイルに最新の世界状態情報を反映
- contextData を現在の状況に合わせて更新

**出力ファイル**: `autonomous_sessions/ai_workspace/results/next_turn_result.json`

```json
{
  "turnGenerated": 16,
  "requestsCreated": [
    "request_GM_143125.json",
    "request_emerald_hunters_143126.json",
    "request_fire_forge_guild_143127.json"
  ],
  "status": "ready_for_next_turn"
}
```

4. **次ターンループ開始**: AI Agent は生成された決定要求ファイルから Phase 2 を再開

**セッション完了時（`nextStatus: "completed"`）の処理**:

1. **最終ターンプレイログ作成**: 上記と同様の形式で最終ターンのナラティブ生成
2. **ツール実行**: 最終プレイログ追記

- `npx tsx src/append_playlog.ts [sessionId] final_turn_playlog.json`
- append_playlog.ts は上記と同様の差分計算・追記処理を実行

## 🔧 実装変更推奨事項

**結果ファイルの配置場所変更**:

現在のツール実装では、結果ファイル（`session_result.json`, `process_result.json`, `next_turn_result.json`）がプロジェクトルートに出力されています。これを `autonomous_sessions/ai_workspace/results/` 配下に変更することを推奨します。

**変更対象ファイル**:

- `src/start_session.ts`: `./session_result.json` → `${AUTONOMOUS_SESSIONS_DIR}/ai_workspace/results/session_result.json`
- `src/process_ai_responses.ts`: `./process_result.json` → `${AUTONOMOUS_SESSIONS_DIR}/ai_workspace/results/process_result.json`
- `src/generate_next_turn.ts`: `./next_turn_result.json` → `${AUTONOMOUS_SESSIONS_DIR}/ai_workspace/results/next_turn_result.json`

**利点**:

- 作業ファイルの統一的管理
- プロジェクトルートの汚染防止
- セッション完了時の一括クリーンアップ対象化

### Phase 5: ナラティブリプレイ生成

**ツール実行**: セッション完了処理

- `npx tsx src/finalize_session.ts [sessionId]`

**finalize_session.ts の処理内容**:

- 最終世界状態を`world_final.json`として保存
- **作業ファイルの最終クリーンアップ**:
  - `ai_workspace/decision_requests/`内の全ファイル削除（セッション完了時のみ）
  - `ai_workspace/decision_responses/`内の全ファイル削除（セッション完了時のみ）
  - `ai_workspace/world_snapshots/`内の古いファイル削除（ターン進行時は最新 5 ターン分保持）
  - **注意**: 中間ターンでは作業ファイルを完全クリーンアップしない
- セッションメタデータの更新

**AI Agent 作業**: ナラティブリプレイ生成

1. **プレイログ読み込み**: `Read` ツールで `playlog.jsonl` を読み込み
2. **世界状態読み込み**: `Read` ツールで `world_initial.json` からパーティー情報とキャラクタープロファイルを取得
3. **目標進化分析**: プレイログから各パーティーの目標変化と転換点を特定
4. **AI Agent 作業**: 全プレイログから魅力的なリプレイ形式のナラティブを作成
   - **冒頭部: パーティー紹介セクション**:
     - 各パーティーの基本情報（名前、専門分野、拠点）
     - **🎯 初期目標**: 各パーティーの当初の目的・目標を明記
     - メンバー構成と役割分担（`world_initial.json`の`partyMembers`から取得）
     - 各メンバーの個性と専門性（`personality`, `speechStyle`, `specialization`）
     - パーティーの活動方針と目標設定
   - **本編部: セッション再現**:
     - 時系列順のセッション再現（1 ターンずつ個別記述、複数ターンまとめ禁止）
     - **重要ターンでの転換点マーキング**: 【🔄 目標転換点】【⚔️ 真の敵の露見】等
     - **転換の契機**: 何が目標変化を引き起こしたかを明記
     - **🎯 新たな目標**: 変更後の目標を具体的に記述
     - **🔥 敵対の根拠**: 新たな敵との敵対理由を分析・明記
     - キャラクター視点での心情描写・台詞再現
     - 環境・雰囲気の詳細描写
     - 重要な決断・転機・戦闘の詳細再現
     - パーティー間の相互作用と協力関係の描写
   - **エピローグ部: 目標達成過程の総括**:
     - **📈 目標の進化**: 段階的な目標変化を時系列で整理
     - **🌟 勢力の役割変化**: 各パーティーの役割変化を追跡
     - 最終的な目標達成と物語の結末
5. **リプレイファイル作成**: `Write` ツールで `narrative_replay.md` を作成

**推奨リプレイ構成**:

```markdown
# [セッション名] - ナラティブリプレイ

## 冒険者たちの紹介

### [パーティー名 1]

**拠点**: [location] | **専門分野**: [specialization]

- **[メンバー名]** ([role]): [personality]な性格で、[specialization]を担当
  - 口調: [speechStyle]
- **[メンバー名]** ([role]): [個性説明]

**🎯 初期目標**: [パーティーの当初の目的・目標]
**活動方針**: [characterProfile.decisionMaking]に基づく[characterProfile.leadershipStyle]

### [パーティー名 2]

[同様の構成...]

## 冒険の記録

### ターン 1: [主要イベント]

[プレイログ基づく詳細再現...]

### ターン X: [イベント名] 【🔄 目標転換点】

**転換の契機**: [何が目標変化を引き起こしたか]

**🎯 新たな目標**: [変更後の目標]

- [具体的な目標項目 1]
- [具体的な目標項目 2]

[続きの描写...]

### ターン Y: [イベント名] 【⚔️ 真の敵の露見】

**[敵の正体判明]**: [敵対勢力の発覚内容]

**🔥 敵対の根拠**:

- **[理由 1]**: [具体的な動機]
- **[理由 2]**: [具体的な動機]

**🎯 最終目標の確定**: [目標 1] → [目標 2] → **[最終目標]**

[続きの描写...]

## 🏆 エピローグ

### 📈 目標の進化：[段階数]段階の戦い

**第一段階（ターン X-Y）**: **[期間名]** 🔸

- **目標**: [この段階の目標]
- **成果**: [達成した成果]
- **象徴**: [象徴的な台詞や出来事]

**第二段階（ターン A-B）**: **[期間名]** 🔸

- **転換点**: [転換のきっかけ]
- **目標**: [この段階の目標]
- **成果**: [達成した成果]
- **象徴**: [象徴的な台詞や出来事]

### 🌟 [勢力数]勢力の役割変化

**[パーティー名]**: [初期役割] → [中期役割] → [最終役割]

[最終的な物語の結末と意義]
```

### Phase 6: 可読プレイログ生成

**目的**: プレイログの技術データを可読性の高いマークダウンファイルに変換

**AI Agent 作業**: 分析的プレイログ作成

1. **プレイログ解析**: `Read` ツールで `playlog.jsonl` を読み込み、全ターンのデータを分析
2. **初期状態抽出**: `Read` ツールで `world_initial.json` から各パーティーの初期パラメータを取得
3. **データ変換処理**: 技術データを視覚的・分析的形式に変換

**ツール実行**: 可読性プレイログファイル作成

- `Write` ツールで `playlog.md` を作成

**推奨プレイログ構成**:

```markdown
# [セッション名] - プレイログ分析

## 📊 初期パーティー状態

### ⚔️ [パーティー名 1]

**拠点**: [location] | **専門**: [specialization]

| パラメータ | 初期値     |
| ---------- | ---------- |
| 💰 通貨    | [value]    |
| 🗡️ 戦闘力  | [value]    |
| 🏃 探索力  | [value]    |
| 🤝 外交力  | [value]    |
| 📈 士気    | [value]    |
| 📍 位置    | [location] |

**リソース**: [materials list]

## 🌩️ ターン別変化ログ

### ターン X: [イベント名] [絵文字]

**GM アクション**: [action_type]

#### 📍 位置変更

- [party_icon] **[Party]**: [from] → [to] ([移動理由])

#### 🎭 パーティー間イベント

- [icon1][icon2] **[Party1] vs [Party2]**: [event_icon] **[イベント種別]** - [詳細説明]
  - 🏆 結果: [outcome]（該当する場合）

#### 📈 士気変化
```

[Party1]: [from] → [to] ([change]) [arrow] [reason]
[Party2]: [from] → [to] ([change]) [arrow] [reason]

```

#### 🎒 リソース変化
- [party_icon] **[Party]**: [resource] [from]→[to] ([change]) - [reason]

#### 💰 経済活動（該当ターンのみ）
- [party_icon] **[Party]**: [transaction details]

**🎯 重要イベント**: [key_events]

## 📊 最終統計

### 🏆 勢力ランキング（士気順）
1. [Party with highest morale]
2. [Party with medium morale]
3. [Party with lowest morale]

### 📈 士気変動グラフ
```

[ASCII graph showing morale trends]

```

### 🎯 キーイベント要約
- **ターン X**: [major_event_summary]

### 🏅 MVPアワード
- **🛡️ 最優秀防御**: [party] ([reason])
- **🕊️ 最優秀外交**: [party] ([reason])
- **🌙 最優秀粘り強さ**: [party] ([reason])
```

**作成手順**:

1. **初期状態セクション**:

   - `world_initial.json` から各パーティーの能力値・リソースを表形式で整理
   - 絵文字を活用して視覚的に分かりやすく表示

2. **ターン別詳細セクション**:

   - `playlog.jsonl` の各 step を順次処理
   - 位置変更、パーティー間イベント、士気・リソース変化を構造化
   - 戦闘・外交・経済・諜報等のイベント種別を絵文字で分類
   - 1 ターンずつ個別記述、複数ターンまとめ禁止

3. **パーティー間イベントの分析**:

   - `worldStateDiff` から各パーティーの関係性変化を抽出
   - 戦闘結果、協力関係、経済取引等を具体的に記述
   - 結果と影響を明確に表記

4. **統計・分析セクション**:
   - 士気変動を ASCII グラフで視覚化
   - 勢力ランキングと最終評価
   - キーイベント抽出と MVP 選定

**重要ポイント**:

- **絵文字活用**: 各勢力・アクション・リソースを色分け表示で識別しやすく
- **表形式**: 数値データは表やグラフで視覚的に整理
- **時系列追跡**: 各ターンの因果関係と戦略的変化を明確化
- **技術 → 物語変換**: JSON データを読みやすいストーリー形式に変換

**AI Agent 注意事項**:

- プレイログとナラティブリプレイは対応関係を保つ
- 数値変化の理由と戦略的意図を分析・記録
- パーティー間の力関係変化を客観的に評価
- 各ターンの重要度と影響度を段階的に表示

### Phase 7: 世界マップ生成

**目的**: セッションの世界状態データから包括的な世界マップドキュメントを作成

**AI Agent 作業**: 地政学的マップ作成

1. **世界状態解析**: `Read` ツールで `world_initial.json` を読み込み、地域・接続・勢力情報を抽出
2. **地理的関係分析**: 隣接関係 (`neighbors`) から地域配置とネットワーク構造を把握
3. **戦略的価値評価**: 資源・特殊効果・影響力から各地域の重要度を分析
4. **歴史的文脈統合**: `playlog.jsonl` から重要イベント発生地を特定・対応付け

**ツール実行**: 世界マップファイル作成

- `Write` ツールで `world_map.md` を作成

**推奨マップ構成**:

```markdown
# [セッション名] - 世界マップ

## 🗺️ 地域配置図
```

[ASCII 文字による地形マップ]
⛰️ [山脈名] ⛰️ 🌪️ [平原名] 🌪️
| |
🏰 [要塞名] ───── ⚔️ [要衝名] ⚔️
| |
💰 [都市名] ───── 🔮 [洞窟名] 🔮

```

## 📊 地域一覧

### 🏰 [地域名]
**タイプ**: [type] | **容量**: [capacity] | **[勢力] 拠点**

| 要素 | 詳細 |
|------|------|
| 📍 **隣接地域** | [neighbors list] |
| 🎒 **資源** | [resources list] |
| ⭐ **特殊効果** | [specialEffects list] |
| 👑 **支配勢力** | [occupant] (影響度: [influence]) |
| 🎯 **戦略価値** | [strategic_analysis] |

## 🏛️ 勢力圏分析

### [勢力名]
- **🏠 本拠地**: [base_region]
- **🎯 制圧目標**: [target_region]
- **🛡️ 戦略**: [strategy_description]

## 📈 交通・補給路

### 🛤️ 主要街道
1. **[軸名]**: [region1] ↔ [region2] ↔ [region3]

### 🚛 補給線の脆弱性
- **[重要地域]**: [vulnerability_analysis]

## 🎭 [セッション名] 重要イベント地

### ⚔️ ターン X-Y: [イベント名]
- **場所**: [region_name]
- **イベント**: [event_description]
- **結果**: [outcome]

## 🌩️ 世界の脅威と機会

### ⚡ [中立勢力名]
- **性質**: [faction_nature]
- **影響**: [impact_description]
- **活動地**: [active_regions]

### 🔮 古代遺産
- **[遺産名]**: [description_and_power]

## 🎯 戦略的要点まとめ

1. **🏆 勝利の鍵**: [victory_conditions]
2. **💰 経済支配**: [economic_control_points]
3. **🔮 技術優位**: [tech_advantages]
```

**作成手順**:

1. **地域データ抽出**:

   - `world_initial.json` の `regions` オブジェクトから全地域情報を取得
   - 各地域の `type`, `neighbors`, `resources`, `specialEffects` を整理
   - `occupantParties` と `influence` から勢力配置を把握

2. **地理的配置分析**:

   - `neighbors` 配列から隣接関係グラフを構築
   - 中心性（接続数）が高い地域を要衝として特定
   - 地形タイプ別に適切な絵文字を割り当て

3. **戦略的分析**:

   - 各パーティーの `location` から勢力圏を特定
   - `resources` と `specialEffects` から地域価値を評価
   - プレイログの重要イベントと地域を対応付け

4. **視覚化実装**:
   - ASCII 文字で地域配置図を作成
   - 表形式で地域詳細データを整理
   - 絵文字で地形・勢力・イベントを色分け表示

**重要ポイント**:

- **地政学的視点**: 単なる地図ではなく、戦略的価値と勢力関係を重視
- **歴史統合**: プレイログの重要イベントを地域と結び付け
- **視覚的明確性**: ASCII 図と絵文字で直感的理解を促進
- **戦略的洞察**: 各勢力の意図と世界の力学を分析

**AI Agent 注意事項**:

- プレイログの重要イベントと地域を正確に対応付け
- 各勢力の戦略的意図を地政学的観点で分析
- 中立勢力や古代遺産の影響を考慮した世界観構築
- 経済・軍事・外交・魔術の複合的バランス評価
- 世界マップとナラティブリプレイ・プレイログとの一貫性確保
