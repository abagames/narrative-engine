# JSON生成ガイドライン - 共通仕様

## 🎯 概要

このドキュメントは、AI Agentが決定応答JSONを生成する際の共通ガイドラインです。GM_CORE_MIND.mdとPLAYER_MIND.mdの両方で参照され、エラーのない正確なJSON生成を支援します。依頼とcheckのルール自体はQUEST_MANAGEMENT.mdで定めています。

## ⚠️ よくあるエラーパターンと対策

### 1. パス記法エラー
```json
// ❌ 絶対にNG: 先頭スラッシュ
{"target": "/parties/emerald_hunters/location"}

// ✅ 正しい記法
{"target": "parties/emerald_hunters/location"}
```

### 2. 一括設定エラー
```json
// ❌ 複数オブジェクトの一括設定はNG
{"target": "parties", "operation": "set", "value": {
  "emerald_hunters": {...},
  "fire_forge_guild": {...}
}}

// ✅ 個別のeffectに分割
[
  {"target": "parties/emerald_hunters", "operation": "set", "value": {...}},
  {"target": "parties/fire_forge_guild", "operation": "set", "value": {...}}
]
```

### 3. 不確かな結果を自分で決める
```json
// ❌ 依頼の進捗を直接書く（拒否: "only change through a check outcome"）
{"target": "quests/escort_vell/progress/iron_wolves", "operation": "add", "value": 3}

// ✅ checkを宣言する。エンジンがロールし、分岐を1つ適用する
"checks": [{
  "id": "guard_the_wagon", "actor": "iron_wolves", "capability": "combat",
  "outcomes": {
    "success": [{"target": "quests/escort_vell/progress/iron_wolves", "operation": "add", "value": 2}],
    "partial": [{"target": "quests/escort_vell/progress/iron_wolves", "operation": "add", "value": 1},
                {"target": "parties/iron_wolves/conditions/strained", "operation": "set", "value": {"name": "Strained", "capability": "combat"}}],
    "failure": [{"target": "parties/iron_wolves/conditions/wounded", "operation": "set", "value": {"name": "Wounded", "capability": "combat"}}]
  }
}]
```

### 4. 権限外への書き込み
```json
// ❌ パーティーが自分の能力値や評判を上げる
{"target": "parties/iron_wolves/capabilities/combat", "operation": "add", "value": 2}
// ❌ 対抗checkなしで競合相手に損害を与える
{"target": "parties/silver_quill/conditions/wounded", "operation": "set", "value": {"name": "Wounded", "capability": "investigation"}}
// ❌ エンジン管理値を設定する（誰であっても）
{"target": "quests/escort_vell/status", "operation": "set", "value": "completed"}
```
エラーメッセージ`Permission denied: <target> (<理由>)`が該当ルールを示します。権限表はPLAYER_MIND.mdとGM_CORE_MIND.mdを参照してください。

### 5. 残高チェック漏れ
```json
// ❌ 残高確認なしの支払い
{"target": "parties/party_id/resources/currency", "operation": "add", "value": -100}

// ✅ 事前に残高を確認してから実行
// 現在の通貨: 80、支払い: 100 → 実行不可
// 現在の通貨: 150、支払い: 100 → 実行可能
```
資源は0未満にできません。1つでも下回るeffectがあれば、**応答全体**が拒否され、何も適用されません。

### 6. 不完全なcheck
```json
// ❌ failure分岐がない（ロール前に拒否）
{"id": "c1", "actor": "iron_wolves", "capability": "combat", "outcomes": {"success": [...], "partial": [...]}}

// ❌ situationalが-1〜+1の範囲外、checkが3つ以上、actorが自パーティー以外
```

## 🔧 基本JSON構造

### GM決定応答
```json
{
  "requestId": "request_GM_1234567890",
  "timestamp": "2025-09-17T22:00:00.000Z",
  "status": "completed",
  "proposal": {
    "type": "issue_quest",
    "participants": ["GM"],
    "effects": [
      {
        "target": "quests/find_the_heir",
        "operation": "set",
        "value": {"title": "跡継ぎを探せ", "client": "duchess_ilse", "location": "old_road", "requiredProgress": 3, "deadlineTurn": 9, "reward": {"reputation": 3}}
      }
    ]
  }
}
```

### プレイヤー決定応答
```json
{
  "requestId": "request_emerald_hunters_1234567890",
  "timestamp": "2025-09-17T22:00:00.000Z",
  "status": "completed",
  "proposal": {
    "type": "pursue_quest",
    "participants": ["emerald_hunters"],
    "effects": [],
    "checks": [
      {
        "id": "track_the_heir",
        "description": "レックスが霧の中へ続く轍を追う",
        "actor": "emerald_hunters",
        "capability": "exploration",
        "outcomes": {
          "success": [{"target": "quests/find_the_heir/progress/emerald_hunters", "operation": "add", "value": 2}],
          "partial": [{"target": "quests/find_the_heir/progress/emerald_hunters", "operation": "add", "value": 1},
                      {"target": "parties/emerald_hunters/conditions/strained", "operation": "set", "value": {"name": "Strained", "capability": "exploration"}}],
          "failure": [{"target": "parties/emerald_hunters/conditions/wounded", "operation": "set", "value": {"name": "Wounded", "capability": "exploration"}}]
        }
      }
    ]
  },
  "meta": {
    "llmDecision": {
      "frameworkEvaluation": {
        "aggressive_opportunist": "適用理由",
        "risk_taking_decisive": "適用理由"
      },
      "character_voices": {
        "Rex": "『キャラクターの発言』",
        "Ruby": "『キャラクターの発言』"
      },
      "selectedAction": {
        "type": "pursue_quest",
        "reasoning": "詳細な選択理由"
      }
    }
  }
}
```

## 📝 操作タイプ

### "set" - 値の完全置換
```json
{"target": "parties/party_id/location", "operation": "set", "value": "new_region"}
{"target": "threads/thread_id/status", "operation": "set", "value": "resolved"}
```

### "add" - 値の加算・追加
```json
// 数値加算
{"target": "clocks/clock_id/filled", "operation": "add", "value": 1}
{"target": "parties/party_id/resources/currency", "operation": "add", "value": -50}

// オブジェクトのマージ
{"target": "parties/party_id/resources/materials", "operation": "add", "value": {"gems": 3}}

// 配列への追加（単一要素または要素の配列）
{"target": "quests/quest_id/acceptedBy", "operation": "add", "value": "party_id"}
{"target": "narrativeContext/rumors", "operation": "add", "value": ["噂その1", "噂その2"]}
```

### エンジンが維持する値
- パーティーを移動させると（`parties/<id>/location`）、`regions/*/occupantParties`は自動で更新されます。手動で書き換えないでください
- 依頼の進捗はターン終了時に0以上に丸められます。士気はもうありません: 後退は状態として表します（`parties/<id>/conditions/<key>` = `{name, capability}`。`null`で解除）
- `quests/*/status`、`quests/*/progress`（check外）、`clocks/*/triggered`、`rng`、`checkLog`、`chronicle`、`guild/standings`、`guild/promoted`は書き込めません

## 🔍 事前チェック手順

1. **worldStateFileの読み込み**: 決定要求の`worldStateFile`から現在の状態を取得
2. **権限チェック**: すべてのtargetが自分の役割の権限内にある（GM / Playerの表）
3. **不確実性チェック**: 不確かな結果は3つの分岐を持つcheckにする
4. **残高・場所チェック**: 資源が0未満にならない。依頼の進捗は依頼の場所でのみ。移動は隣接地域のみ
5. **ID整合性チェック**: requestIdと`participants[0]`が同じパーティーを指す
6. **パス記法チェック**: 先頭スラッシュなし、適切な階層構造

これらのガイドラインに従うことで、エラーのない安定したJSON生成が可能になります。
