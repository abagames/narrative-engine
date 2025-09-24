# JSON生成ガイドライン - 共通仕様

## 🎯 概要

このドキュメントは、AI Agentが決定応答JSONを生成する際の共通ガイドラインです。GM_CORE_MIND.mdとPLAYER_MIND.mdの両方で参照され、エラーのない正確なJSON生成を支援します。

## ⚠️ よくあるエラーパターンと対策

### 1. パス記法エラー
```json
// ❌ 絶対にNG: 先頭スラッシュ
{"target": "/parties/emerald_hunters/morale"}

// ✅ 正しい記法
{"target": "parties/emerald_hunters/morale"}
```

### 2. 一括設定エラー
```json
// ❌ 複数オブジェクトの一括設定はNG
{"target": "parties", "operation": "set", "value": {
  "emerald_hunters": {...},
  "fire_forge_guild": {...}
}}

// ✅ 個別エフェクトに分割
[
  {"target": "parties/emerald_hunters", "operation": "set", "value": {...}},
  {"target": "parties/fire_forge_guild", "operation": "set", "value": {...}}
]
```

### 3. 配列操作エラー
```json
// ❌ 配列への追加で構造が不適切
{"target": "market/completedTrades", "operation": "add", "value": {
  "buyer": "swift_merchants",
  "item": "herbs"
}}

// ✅ 配列として正しく構造化
{"target": "market/completedTrades", "operation": "add", "value": [{
  "buyer": "swift_merchants",
  "item": "herbs",
  "quantity": 3,
  "price": 12,
  "total": 36,
  "turn": 2
}]}
```

### 4. 残高チェック漏れ
```json
// ❌ 残高確認なしの支払い
{"target": "parties/party_id/resources/currency", "operation": "add", "value": -100}

// ✅ 事前に残高を確認してから実行
// 現在通貨: 80, 支払い: 100 → 実行不可能
// 現在通貨: 150, 支払い: 100 → 実行可能
```

## 🔧 基本JSON構造

### GM決定応答
```json
{
  "requestId": "request_GM_1234567890",
  "timestamp": "2025-09-17T22:00:00.000Z",
  "status": "completed",
  "proposal": {
    "type": "environmental_change",
    "participants": ["GM"],
    "effects": [
      {
        "target": "market/currentPrices/wood",
        "operation": "add",
        "value": 1
      }
    ]
  }
}
```

### Player決定応答
```json
{
  "requestId": "request_emerald_hunters_1234567890",
  "timestamp": "2025-09-17T22:00:00.000Z",
  "status": "completed",
  "proposal": {
    "type": "explore",
    "participants": ["emerald_hunters"],
    "effects": [
      {
        "target": "parties/emerald_hunters/resources/materials",
        "operation": "add",
        "value": {"gems": 5}
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
        "レックス": "『キャラクターの発言』",
        "ルビー": "『キャラクターの発言』"
      },
      "selectedAction": {
        "type": "explore",
        "reasoning": "詳細な選択理由"
      }
    }
  }
}
```

## 📝 operation タイプ

### "set" - 値の完全置換
```json
{"target": "parties/party_id/location", "operation": "set", "value": "new_region"}
{"target": "regions/region_id/occupantParties", "operation": "set", "value": ["party1"]}
```

### "add" - 値の加算・追加
```json
// 数値の加算
{"target": "parties/party_id/morale", "operation": "add", "value": 2}
{"target": "parties/party_id/resources/currency", "operation": "add", "value": -50}

// オブジェクトのマージ
{"target": "parties/party_id/resources/materials", "operation": "add", "value": {"gems": 3}}

// 配列への追加
{"target": "market/completedTrades", "operation": "add", "value": [新規取引オブジェクト]}
```

## 🎯 パーティー固有のパス例

### エメラルドハンターズ
```json
{"target": "parties/emerald_hunters/morale", "operation": "add", "value": 1}
{"target": "parties/emerald_hunters/resources/materials", "operation": "add", "value": {"gems": 8, "rare_crystals": 3}}
```

### 炎の鍛冶ギルド
```json
{"target": "parties/fire_forge_guild/resources/materials/metal", "operation": "add", "value": -6}
{"target": "parties/fire_forge_guild/resources/materials", "operation": "add", "value": {"crafted_weapons": 4}}
```

### 迅速商会
```json
{"target": "parties/swift_merchants/resources/currency", "operation": "add", "value": -36}
{"target": "parties/swift_merchants/resources/materials", "operation": "add", "value": {"magical_herbs": 3}}
```

### 知恵の探求者団
```json
{"target": "parties/wisdom_seekers/capabilities/diplomacy", "operation": "add", "value": 1}
{"target": "parties/wisdom_seekers/resources/materials", "operation": "add", "value": {"ancient_knowledge": 5}}
```

### 影の斥候団
```json
{"target": "parties/shadow_scouts/location", "operation": "set", "value": "mystic_plains"}
{"target": "parties/shadow_scouts/resources/materials", "operation": "add", "value": {"intelligence_data": 2}}
```

## 🔍 事前チェック手順

1. **worldStateFileの読み込み**: 決定要求の `worldStateFile` から現在状態を取得
2. **残高・在庫確認**: 消費系エフェクトの実行可能性チェック
3. **論理整合性確認**: パーティーの位置・能力で実行可能か
4. **ID整合性確認**: requestIdとパーティーIDが一致しているか
5. **パス記法確認**: 先頭スラッシュなし、適切な階層構造か

このガイドラインに従うことで、エラーのない安定したJSON生成が可能になります。