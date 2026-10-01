# Draft System - Sequential Preparation Phase

Before the season and once in mid-season, parties take turns picking from a pool the GM prepared: the quest each party will pursue, recruits, items and intel. Picks are public and made one at a time, so every pick reacts to the ones before it. Read this document whenever a request has `contextData.phase: "draft"` (parties) or when preparing a draft (GM).

## 🎯 Principles

1. **One hero, one party, one quest**: Each party is led by its own agent and pursues one quest at a time. Parties never merge; cooperation happens through invitations to joint quests
2. **Quests are public and shared**: Every quest is on the board. Several parties may take up the same quest and race for it
3. **Order is a resource**: Who picks first matters. The order is fixed by rules, and can be bought with favors
4. **Picks are reactions**: Later pickers see who took what: join a race, avoid it, or take a quest that may work against a rival
5. **Leftovers have consequences**: Quests nobody took run into their deadlines; recruits nobody hired sign with someone else

## 🔄 Flow

```
GM prepares the pool (draft.status = "pending")
   ↓ start of the turn: engine opens the draft (phase = "draft"; the turn does not advance during the draft)
① Order: lowest reputation first (ties by roll). Creditors may call in a favor to swap places with the debtor
② Picks: snake order (1-2-3-3-2-1 ...), picksPerParty rounds. One request per pick
③ Answers: invitations still pending after the last pick are answered
④ Close: leftovers resolved; one playlog entry for the whole draft; then the action phase of the same turn
```

## 📦 Pool

| Kind | `pick.kind` | Effect of picking |
|---|---|---|
| Quest | `quest` | You take up this quest (added to `acceptedBy`). It stays in the pool for others to join. Only one quest per party. For a joint quest, `target` invites another party |
| Recruit | `recruit` | Joins your party for `term` turns. Raises your capability to the recruit's `grants.capabilities` for checks, and may unlock actions (`unlocks`). Max 2 recruits |
| Item | `item` | Unique. +1 on checks with its `bonus.capability` |
| Intel | `intel` | A fact is added to your `knowledge`. Others only learn that you bought intel. It may be false |
| Pass | `pass` | Take nothing |

`draft.pool.quests[].pursuedBy` shows who is already on each quest. Parties that finish their quest between drafts may take up any open quest from the board.

## 🤝 Invitations

- Inviting is part of a quest pick: `"pick": {"kind": "quest", "id": "<joint quest>", "target": "<party>"}`. You take up the quest at once; the invitation asks the other party to join you
- Only a party that has no quest yet can be invited, and it must still have none when it accepts
- The invited party answers at its **next pick**, before picking:
  - **Accept**: uses that pick. Both parties hold the joint quest
  - **Decline**: the inviter keeps the quest and must find partners elsewhere; the decliner picks normally
- If the invited party has no picks left, it answers after the last pick
- Answers are public. Expect relationships to follow them

## 🧭 Choosing a Pick (Players)

Read `contextData.draft` (pool, `picksSoFar`, `remainingSequence`, `invitesForYou`) and `contextData.rivals` (their quests, recruits, items, goals).

Score each option (0-10):
```
Own Value: how much it advances your goals and standing
Denial Value: how much a rival would gain from it (who picks next, and what they need)
Relationship Effect: what inviting, accepting or refusing says to the other party
Flaw Fit: whether a triggered flaw demands this pick (overrides the scores, as in PLAYER_MIND.md)
```
- Look at `remainingSequence`: the item you skip may be gone before your next pick
- Joining a quest a rival already took starts a race; only one party can win an exclusive quest
- Quests may secretly collide (`conflictsWith` is hidden). Read the descriptions and clients: guarding a merchant and silencing him cannot both succeed
- Recruits are people with their own wants. Read `wants` before hiring

## 📝 Response Format

```json
{
  "requestId": "[requestId from the request]",
  "timestamp": "[ISO time]",
  "status": "completed",
  "proposal": {
    "type": "draft",
    "participants": ["[your party id]"],
    "effects": [],
    "draft": {
      "respond": [{ "inviteId": "inv_draft_t1_0", "accept": false }],
      "pick": { "kind": "recruit", "id": "sister_ilse" }
    }
  },
  "meta": {
    "llmDecision": {
      "optionsConsidered": [
        { "action": "recruit sister_ilse", "score": 8.5, "reasoning": "The Wolves need a healer; taking her first denies them" },
        { "action": "quest guard_caravan", "score": 7.0, "reasoning": "Fits our strengths, but the Lanterns already race for it" }
      ],
      "selectedAction": { "type": "draft", "reasoning": "Deny the Wolves their healer before their double pick" },
      "character_voices": { "Aria": "If we don't take her, they will." }
    }
  }
}
```
- `mode: "order"`: `"draft": { "swap": { "favorId": "f1" } }` or `"draft": {}`
- `mode: "pick"`: `respond` for every pending invitation to you (if any), then `pick` unless you accepted an invitation. Kinds: `quest` (optional `target` for joint quests), `recruit`, `item`, `intel`, `pass`
- `mode: "answer"`: only `respond`
- No checks during the draft. `effects` may hold ordinary self-effects (e.g. a relationship note) but are usually empty
- The reasoning and character voices are stored with the pick and appear in the novel. Write them as the party would think

## 🎲 Preparing a Draft (GM)

Prepare the pool on the turn **before** the draft (for mid-season drafts, `contextData.worldSummary.draftDueNextTurn` turns true), or in `world_initial.json` for the season-start draft.

```json
{"target": "draft", "operation": "set", "value": {
  "status": "pending",
  "label": "Mid-season draft",
  "picksPerParty": 2,
  "pool": {
    "quests": ["guard_caravan", "rob_caravan", "seal_crypt"],
    "recruits": ["sister_ilse", "grim"],
    "items": ["warded_lantern"],
    "intel": ["caravan_route"]
  }
}}
```
Create the entries first: quests (ordinary public quests); `recruits/<id>` (`name`, `role`, `personality`, `grants.capabilities`, `unlocks`, `term`, `wants`, GM-only `leavesIf`, `rivalEmployer`, `ifUnhired` effects); `items/<id>` (`name`, `description`, `bonus: {capability, amount: 1}`); `intel/<id>` (`title` shown to all, `fact: {text, truth}` given to the buyer).

Pool design:
- **Quests**: at least parties + 1, so that the last picker can still avoid a race. Quests are shared, so nobody is left without one
- **Collisions**: put both sides of a collision into the pool. The draft decides who stands on which side
- **Size**: quests plus picksPerParty - 1 other picks per party, + 1-2
- **Scarcity**: one recruit or item that every party wants; the picker before it decides who gets it
- **Asymmetry**: give each party at least one option that suits only it, so picks differ
- **Leftovers**: give unhired recruits a `rivalEmployer` and `ifUnhired` effects, and quests a deadline with `onFail`, so what nobody chose still shapes the world

During the draft the GM receives no requests. A recruit's `leavesIf` is the GM's to enforce later (set `recruits/<id>/status` to `"departed"` when the condition is met).

## ⚙️ Engine Rules Summary

| Rule | Value |
|---|---|
| Base order | Reputation ascending, then quests completed ascending, ties by seeded roll |
| Sequence | Snake over `picksPerParty` rounds |
| Favor swap | Creditor later in the order swaps places with the debtor; the favor becomes `repaid` |
| Recruit term | `term` turns (default 4), counted from the draft turn; leaves at upkeep afterwards |
| Luring a recruit | Check opposed by the current employer, outcome sets `recruits/<id>/hiredBy` to yourself |
| Taking an item | Check opposed by the holder, outcome sets `items/<id>/heldBy` to yourself; holders may give items freely |
| Leftover recruit | Status `rival`; `ifUnhired` effects apply |
| Quest nobody took | Stays on the board; runs into its deadline (`onFail`, `advancesClock`) unless someone takes it up later |
| Quests per party | One at a time; a party that has one cannot pick or accept another |
