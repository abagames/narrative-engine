# Quest Management - 依頼と判定のルール

この文書は世界の中心となる仕組みを定める。**パーティーはギルドの依頼をめぐって競い、協力する**。**結果を決めるのはAIではなくエンジンである**。`GM_CORE_MIND.md`（依頼の発行）、`PLAYER_MIND.md`（依頼の遂行）と合わせて読む。

## 🎯 設計原則

1. **依頼が物語を動かす**: パーティーは依頼を達成して地位を上げる。資源と市場は任意の背景にすぎない
2. **進路が交差する**: 依頼は場所・目標・依頼主を共有するので、パーティーは出会う。相互作用はGMが仕組むイベントではなく構造から生まれる
3. **宣言してから振る**: AIエージェントは何を試み、各結果が何を意味するかを宣言する。エンジンがロールし、結果を1つ適用する
4. **帰結は残る**: 失敗・期限切れ・死・暴かれた秘密は残り、次の状況になる
5. **情報は不平等**: パーティーは真実の一部しか見えない。GMはすべてを見る

## 📦 ワールドのデータモデル

```json
{
  "guild": {
    "name": "灯火ギルド",
    "season": { "endsAtTurn": 12, "promotionSlots": 1, "midDraftTurn": 6 }
  },
  "quests": {
    "escort_vell": {
      "title": "ヴェルを判事のもとへ護送せよ",
      "client": "merchant_vell",
      "description": "生きて法廷に着けば、ヴェルは密輸団に不利な証言をする。",
      "location": "harbor",
      "type": "exclusive",
      "requiredProgress": 3,
      "deadlineTurn": 8,
      "reward": { "reputation": 3, "currency": 40, "items": ["vell_seal"] },
      "conflictsWith": ["silence_vell"],
      "offeredTo": [],
      "secret": { "truth": "ヴェルは法廷の証拠を持ち逃げするつもりである", "revealedTo": [] },
      "onComplete": [],
      "onFail": [{ "target": "narrativeContext/rumors", "operation": "add", "value": "ヴェルの遺体が浜に打ち上げられた" }],
      "advancesClock": { "clockId": "smugglers_rise", "amount": 1 },
      "acceptedBy": [],
      "progress": {},
      "status": "open"
    }
  },
  "npcs": {
    "merchant_vell": { "name": "ヴェル", "wants": "安全な通行", "disposition": {}, "memory": [] }
  },
  "clocks": {
    "smugglers_rise": {
      "name": "密輸団が港を掌握する",
      "segments": 4,
      "filled": 0,
      "tickPerTurn": 0,
      "visible": true,
      "consequence": "港が密輸団の支配下に落ちる",
      "onComplete": [{ "target": "regions/harbor/specialEffects", "operation": "add", "value": "smuggler_controlled" }]
    }
  },
  "favors": {
    "quill_owes_wolves_1": { "owedBy": "silver_quill", "owedTo": "iron_wolves", "reason": "地下墓所での救出", "turn": 6, "status": "owed" }
  },
  "threads": {
    "second_ledger": { "setup": "ヴェルの裏帳簿", "turn": 4, "status": "open" }
  },
  "parties": {
    "iron_wolves": {
      "reputation": 0,
      "inventory": [],
      "goals": ["銀羽根団より先に昇格する"],
      "flaws": [{ "name": "誇り", "trigger": "銀羽根団に助けを求められる", "effect": "代償を問わず断る" }],
      "knowledge": [{ "text": "オラは密輸団に金を払っている", "source": "港湾労働者", "turn": 2, "truth": true }]
    }
  },
  "rng": { "seed": 1234 }
}
```

| フィールド | 書き込む者 | 備考 |
|---|---|---|
| `quests/*`の定義 | GM | `quests/<id>`への`set`で作成する。既存の依頼は置き換えられない |
| `quests/*/contract` | GM | `true`: ドラフトでのみ取れる専属依頼（`DRAFT_SYSTEM.md`） |
| `quests/*/offeredTo` | GM | 空または未指定なら掲示板に公開。指定すると非公開の依頼になり、そのパーティーだけが見て受注できる |
| `quests/*/acceptedBy`、`abandonedBy` | パーティー（自分のみ）、GM | 1パーティーの受注中依頼は最大2件。放棄した依頼は再受注できない |
| `quests/*/progress/*` | checkの結果のみ | 0未満にはならない |
| `quests/*/status`、`completedBy`、`resolvedTurn` | エンジン | `open` → `accepted` → `completed` / `failed` / `expired` |
| `quests/*/secret/revealedTo` | checkの結果（パーティーが自分を追加）、GM | パーティーには明かされた後でのみ`secret`が見える |
| `parties/*/reputation` | エンジン（報酬）、GM | シーズンの順位を決める |
| `parties/*/capabilities` | GM | check修正値の基礎 |
| `clocks/*/filled` | GM、エンジン | `triggered`はエンジン管理 |
| `recruits/*`、`items/*`、`intel/*`、`draft` | GM（指名の適用はエンジン） | `DRAFT_SYSTEM.md`参照。冒険者はcheckの能力値を引き上げ、アイテムは+1を与える |
| `rng`、`checkLog`、`chronicle`、`guild/standings`、`guild/promoted` | エンジン | AIエージェントは読み取りのみ |

## 🎲 check（判定）

### 宣言
```json
{
  "id": "breach_vault",
  "description": "リオが階段を見張る間に、ブラスクが宝物庫の扉を打ち破る",
  "actor": "iron_wolves",
  "capability": "combat",
  "situational": 0,
  "opposedBy": { "party": "silver_quill", "capability": "exploration" },
  "outcomes": {
    "success": [ ... ],
    "partial": [ ... ],
    "failure": [ ... ]
  }
}
```
- 1応答あたり**最大2つ**。`proposal.checks`に書く
- `actor`: パーティー。パーティーの応答は自分のためにしか振れない。GMは任意のパーティーにcheckを課せる
- 3つの結果リストはすべて**必須**。中の効果はロールの**前に**権限を検証される

### 解決
```
修正値 = 能力修正 + situational      （situationalは-1〜+1に制限）
能力修正 = round((能力値 - 5) / 2.5)、-2〜+2に制限   （能力が未定義なら-1）

非対抗:  2d6 + 修正値 ≥ 10 → success | 7-9 → partial | ≤ 6 → failure
対抗:    差 = (2d6 + 修正値) - (2d6 + 相手の修正値)
         差 ≥ 3 → success | 0-2 → partial | < 0 → failure
```
確率（非対抗）: 修正値0 → success 17%、partial 42%、failure 42%。修正値+2 → success 42%、partial 42%、failure 17%。

ダイスは`hash(シード, ターン, actor, checkの順番)`から決まる。応答を出し直しても**同じダイス**になるので、出し直しによる振り直しはできない。

### 結果の書き方
| 結果 | 含めるもの |
|---|---|
| `success` | 目的が素直に進む（典型的には進捗+2、アイテム、秘密の解明） |
| `partial` | 代償つきで目的が進む（進捗+1と士気の低下、目撃者、借り、競合相手に気づかれる） |
| `failure` | 実際の後退: 士気や資源の喪失、関係の悪化、クロックの進行、位置の喪失 |

## 🔄 依頼のライフサイクル

```
GMが依頼を発行 (status: open)
   ↓ パーティーがacceptedByに自分を追加      (status: accepted)
   ↓ 依頼の場所でのcheckが進捗を加算
   ↓ 処理の最後にエンジンが依頼を解決
      exclusive: progress ≥ requiredProgressに達したパーティーが勝つ
                 （最大進捗。同点はロールで決着）
      joint:     進捗合計 ≥ requiredProgress かつ貢献者 ≥ minParties
                 評判・通貨は進捗に比例して分配。アイテムは最大貢献者へ
   ↓ completed: 報酬支払い、依頼主の感情+2、onComplete適用、
                conflictsWithの依頼は失敗（そのonFailとadvancesClockが適用される）
各ターン開始時（アップキープ）:
   deadlineTurn超過 → expired（onFail、advancesClock、受注者ごとに依頼主の感情-1）
   tickPerTurnを持つクロックが進む。満了したクロックはonCompleteを発動
シーズン終了（seasonEnd停止条件またはセッション終了）:
   評判、次に達成依頼数で順位付け。上位promotionSlotsのパーティーが昇格（同点はロール）
```

エンジンのイベントはすべて`chronicle`に追記され、playlogエントリの`engineEvents`にも記録される。

## 🧩 依頼設計パターン

| パターン | 構成 | 生まれる相互作用 |
|---|---|---|
| **衝突** | 2人の依頼主、相互に`conflictsWith`を持つ2つの依頼を、別々のパーティーへ非公開で（`offeredTo`） | どちらも選んでいない対立 |
| **競争** | 誰でも受けられる`exclusive`依頼1つ | 妨害（対抗check）、首位に対する同盟 |
| **共同** | `type: "joint"`、`minParties: 2` | 労力と取り分の交渉、ただ乗り、裏切り |
| **隠された真相** | `secret.truth`が依頼主の説明と食い違う | 調査、暴露、寝返り |
| **悪化** | `onFail`と`advancesClock` | 放置された問題が地図を変える |
| **借り** | 他パーティーの助けがないと終わらない依頼 | 貸し借り、駆け引き、返済 |

### 掲示板の健全性
- 受注可能・受注中の依頼数 ≈ パーティー数 + 1
- 常に少なくとも1組のパーティーが依頼の場所を共有している
- 各依頼にジレンマが1つある: 代償、依頼主への疑念、競合相手のいずれか
- 1〜2ターンごとに1件の依頼が決着するよう期限を散らす

## 🏁 停止条件（session_config.json）

| 条件 | 値 | 終了するとき |
|---|---|---|
| `seasonEnd` | `true` | ターンが`guild.season.endsAtTurn`を超えた |
| `questsResolved` | 数値 | その数の依頼が達成・失敗・期限切れになった |
| `questCompleted` | 依頼IDまたはリスト | 列挙した依頼のいずれかが決着した |
| `clockTriggered` | クロックIDまたはリスト | 列挙したクロックのいずれかが満了した |
| `totalPartyWealth`、`regionDevelopment` | 数値 | 旧来の経済的条件 |

## 📋 プレイヤーの依頼戦略

1. **順位で依頼を選ぶ**: 首位はリードを守り、追う側はリスクを取る
2. **競合相手を見る**: 自分の依頼で`rivalProgress: "close"`なら、今動くか、妨害するか、交渉する
3. **達成前に調べる**: 秘密を持つ依頼主のもとでは、報酬が無価値になったり、依頼自体が誤りだったりする
4. **支援を貸しと交換する**: 貸しを記録した`assist`は、後で回収できる
5. **放棄は意図して行う**: 放棄すると枠が空くが、進捗と依頼主の好意を失う
