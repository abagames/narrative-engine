# Draft System - 順番指名の準備フェイズ

シーズン開始時と中盤に1回、パーティーはGMが用意した候補から順番に指名する。指名は公開され、1回ずつ行われるので、どの指名もそれまでの指名への反応になる。リクエストの`contextData.phase`が`"draft"`のとき（パーティー）、またはドラフトを準備するとき（GM）にこの文書を読む。

## 🎯 原則

1. **1ヒーロー＝1パーティー**: 各パーティーはそれぞれのエージェントが率いる。パーティーは合流しない。協力は共同依頼への誘いで行う
2. **順番は資源である**: 誰が先に選ぶかが重要である。順番は規則で決まり、貸しを使って買える
3. **指名は反応である**: 指名は指名者について何かを語る。選ぶ前にこれまでの指名を読む
4. **売れ残りには帰結がある**: 誰も取らなかった専属依頼は期限切れになり、誰も雇わなかった冒険者は他所に雇われる

## 🔄 流れ

```
GMが候補を用意する（draft.status = "pending"）
   ↓ ターン開始時: エンジンがドラフトを開く（phase = "draft"。ドラフト中はターンが進まない）
① 順番: 評判の低い順（同点はロール）。貸しを持つ側は、その貸しを使って債務者と順番を入れ替えられる
② 指名: スネーク順（1-2-3-3-2-1 ...）でpicksPerParty巡。指名1回につきリクエスト1件
③ 回答: 最後の指名の後も保留中の誘いに回答する
④ 終了: 売れ残りを処理し、ドラフト全体を1件のプレイログにまとめ、同じターンの行動フェイズへ
```

## 📦 候補

| 種別 | `pick.kind` | 指名の効果 |
|---|---|---|
| 専属依頼 | `contract` | その依頼を受けられる唯一のパーティーになる（`acceptedBy`が自分）。指名は公開されるので、競合相手も誰が持っているかを知る。受注中依頼2件の枠に数える |
| 冒険者 | `recruit` | `term`ターンの間パーティーに加わる。checkでの能力値を冒険者の`grants.capabilities`まで引き上げ、行動を解禁することもある（`unlocks`）。最大2人 |
| アイテム | `item` | 唯一品。`bonus.capability`のcheckに+1 |
| 情報 | `intel` | 事実が自分の`knowledge`に加わる。他のパーティーには「情報を買った」ことしか伝わらない。誤りの場合もある |
| 誘い | `invite` | 他のパーティー（`target`）を共同依頼に誘う |
| パス | `pass` | 何も取らない |

誰でも受けられる公開依頼はドラフトの対象に**しない**。ギルドの掲示板に残るので、受注後の競争は残る。

## 🤝 誘い

- 誘うと自分の指名を使う。誘いが保留中の間、その依頼は候補から外れる
- 誘われた側は**自分の次の指名の番**で、指名の前に回答する:
  - **受諾**: その番の指名を使う。両パーティーが共同依頼を持つ
  - **辞退**: 誘った側の指名は無駄になり、依頼は候補に戻る。辞退した側は通常どおり指名する
- 誘われた側に指名が残っていない場合は、最後の指名の後に回答する
- 回答は公開される。関係値はそれに従って動くと考える

## 🧭 指名の選び方（プレイヤー）

`contextData.draft`（候補、`picksSoFar`、`remainingSequence`、`invitesForYou`）と`contextData.rivals`（競合相手の依頼・冒険者・アイテム・目標）を読む。

各選択肢を採点する（0〜10）:
```
自分にとっての価値: 目標と順位にどれだけ役立つか
妨害の価値: 競合相手がそれを取ったらどれだけ得をするか（次に誰が選び、何を必要としているか）
関係への影響: 誘う・受ける・断ることが相手に何を伝えるか
欠点との整合: 引き金の引かれた欠点がこの指名を求めるか（PLAYER_MIND.mdと同様、スコアに優先する）
```
- `remainingSequence`を見る: 見送った候補は、次の自分の番までになくなっているかもしれない
- 競合相手の専属依頼と衝突する依頼を取れば、その相手と敵対することになる。その争いを望む場合にだけ取る
- 冒険者は自分の望みを持つ人間である。雇う前に`wants`を読む

## 📝 応答形式

```json
{
  "requestId": "[リクエストのrequestId]",
  "timestamp": "[ISO時刻]",
  "status": "completed",
  "proposal": {
    "type": "draft",
    "participants": ["[自パーティーID]"],
    "effects": [],
    "draft": {
      "respond": [{ "inviteId": "inv_draft_t1_0", "accept": false }],
      "pick": { "kind": "recruit", "id": "sister_ilse" }
    }
  },
  "meta": {
    "llmDecision": {
      "optionsConsidered": [
        { "action": "recruit sister_ilse", "score": 8.5, "reasoning": "鉄狼団には治療師が要る。先に取れば彼らから奪える" },
        { "action": "contract guard_caravan", "score": 7.0, "reasoning": "我々の強みに合う" }
      ],
      "selectedAction": { "type": "draft", "reasoning": "鉄狼団の連続指名の前に治療師を押さえる" },
      "character_voices": { "Aria": "私たちが取らなければ、向こうが取るわ" }
    }
  }
}
```
- `mode: "order"`: `"draft": { "swap": { "favorId": "f1" } }`または`"draft": {}`
- `mode: "pick"`: 自分宛ての保留中の誘いがあればすべてに`respond`で答え、誘いを受けなかった場合は`pick`を書く
- `mode: "answer"`: `respond`のみ
- ドラフト中はcheckを使えない。`effects`には自分に関する通常の効果（関係値のメモなど）を入れてもよいが、普通は空
- 理由と台詞は指名と一緒に保存され、小説に使われる。パーティーが考えるとおりに書く

## 🎲 ドラフトの準備（GM）

候補はドラフトの**前のターン**に用意する（中盤のドラフトでは`contextData.worldSummary.draftDueNextTurn`がtrueになる）。シーズン開始時のドラフトは`world_initial.json`に書く。

```json
{"target": "draft", "operation": "set", "value": {
  "status": "pending",
  "label": "中盤のドラフト",
  "picksPerParty": 2,
  "pool": {
    "contracts": ["guard_caravan", "rob_caravan"],
    "recruits": ["sister_ilse", "grim"],
    "items": ["warded_lantern"],
    "intel": ["caravan_route"],
    "invites": ["seal_crypt"]
  }
}}
```
先に各項目を作る: 専属依頼は`"contract": true`を持つ依頼。`recruits/<id>`（`name`、`role`、`personality`、`grants.capabilities`、`unlocks`、`term`、`wants`、GMだけが知る`leavesIf`、`rivalEmployer`、`ifUnhired`効果）。`items/<id>`（`name`、`description`、`bonus: {capability, amount: 1}`）。`intel/<id>`（全員に見える`title`と、買った者に渡る`fact: {text, truth}`）。

候補の設計:
- **数**: パーティー数 × picksPerParty + 1〜2。最後に選ぶ側にも選択肢を残す
- **衝突**: 衝突依頼の両側を専属依頼として候補に入れる。誰が誰の敵になるかをドラフトが決める
- **希少性**: 全パーティーが欲しがる冒険者かアイテムを1つ入れる。その直前に選ぶ者が、誰の手に渡るかを決める
- **非対称性**: 各パーティーに、そのパーティーにだけ合う選択肢を少なくとも1つ用意し、指名がばらけるようにする
- **売れ残り**: 雇われなかった冒険者には`rivalEmployer`と`ifUnhired`効果を、専属依頼には期限と`onFail`を与え、誰も選ばなかったものも世界を動かすようにする

ドラフト中、GMにはリクエストが来ない。冒険者の`leavesIf`は後でGMが執行する（条件が満たされたら`recruits/<id>/status`を`"departed"`にする）。

## ⚙️ エンジン規則のまとめ

| 規則 | 内容 |
|---|---|
| 基本の順番 | 評判の昇順、次に達成依頼数の昇順、同点はシード付きロール |
| 指名の順 | `picksPerParty`巡のスネーク順 |
| 貸しによる入れ替え | 順番が後の債権者が債務者と入れ替わる。貸しは`repaid`になる |
| 冒険者の在籍 | ドラフトのターンから`term`ターン（既定4）。その後のアップキープで去る |
| 冒険者の引き抜き | 現雇用主が対抗するcheckで、結果が`recruits/<id>/hiredBy`を自分にする |
| アイテムの奪取 | 所持者が対抗するcheckで、結果が`items/<id>/heldBy`を自分にする。所持者は自由に譲れる |
| 売れ残りの冒険者 | 状態が`rival`になり、`ifUnhired`効果が適用される |
| 売れ残りの専属依頼 | 受注されないまま期限で失効する（`onFail`、`advancesClock`） |
