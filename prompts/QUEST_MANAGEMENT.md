# Quest Management - Quests and Adjudication Rules

This document defines the world's central mechanism: **parties compete and cooperate over guild quests**, and **the engine, not the AI, decides outcomes**. Read it together with `GM_CORE_MIND.md` (issuing quests) and `PLAYER_MIND.md` (pursuing them).

## 🎯 Design Principles

1. **Quests drive the story**: Parties rise by completing quests. Resources and the market are optional background
2. **Paths cross**: Quests share places, targets and clients, so parties meet. Interaction comes from structure, not from GM-forced events
3. **Declare, then roll**: AI agents declare what they attempt and what each outcome means. The engine rolls and applies one outcome
4. **Consequences stand**: Failures, expirations, deaths and exposed secrets stay. They become the next situation
5. **Information is unequal**: Parties see only part of the truth. The GM sees everything

## 📦 World Data Model

```json
{
  "guild": {
    "name": "Lantern Guild",
    "season": { "endsAtTurn": 12, "promotionSlots": 1 }
  },
  "quests": {
    "escort_vell": {
      "title": "Escort Vell to the Magistrate",
      "client": "merchant_vell",
      "description": "Vell will testify against the smugglers if he lives to reach the court.",
      "location": "harbor",
      "type": "exclusive",
      "requiredProgress": 3,
      "deadlineTurn": 8,
      "reward": { "reputation": 3, "currency": 40, "items": ["vell_seal"] },
      "conflictsWith": ["silence_vell"],
      "offeredTo": [],
      "secret": { "truth": "Vell plans to flee with the court's evidence", "revealedTo": [] },
      "onComplete": [],
      "onFail": [{ "target": "narrativeContext/rumors", "operation": "add", "value": "Vell's body washed ashore" }],
      "advancesClock": { "clockId": "smugglers_rise", "amount": 1 },
      "acceptedBy": [],
      "progress": {},
      "status": "open"
    }
  },
  "npcs": {
    "merchant_vell": { "name": "Vell", "wants": "safe passage", "disposition": {}, "memory": [] }
  },
  "clocks": {
    "smugglers_rise": {
      "name": "Smugglers seize the harbor",
      "segments": 4,
      "filled": 0,
      "tickPerTurn": 0,
      "visible": true,
      "consequence": "The harbor falls under smuggler control",
      "onComplete": [{ "target": "regions/harbor/specialEffects", "operation": "add", "value": "smuggler_controlled" }]
    }
  },
  "favors": {
    "quill_owes_wolves_1": { "owedBy": "silver_quill", "owedTo": "iron_wolves", "reason": "rescue in the crypt", "turn": 6, "status": "owed" }
  },
  "threads": {
    "second_ledger": { "setup": "Vell's second ledger", "turn": 4, "status": "open" }
  },
  "parties": {
    "iron_wolves": {
      "reputation": 0,
      "inventory": [],
      "goals": ["Be promoted before the Silver Quill"],
      "flaws": [{ "name": "Pride", "trigger": "the Silver Quill asks for help", "effect": "refuses, whatever the cost" }],
      "knowledge": [{ "text": "Ora pays smugglers", "source": "dockhand", "turn": 2, "truth": true }]
    }
  },
  "rng": { "seed": 1234 }
}
```

| Field | Written by | Notes |
|---|---|---|
| `quests/*` definition | GM | Created with `set` on `quests/<id>`. An existing quest cannot be replaced |
| `quests/*/offeredTo` | GM | Empty or absent: public on the board. Non-empty: a private offer that only those parties see and may accept |
| `quests/*/acceptedBy`, `abandonedBy` | Party (itself only), GM | Max 2 active quests per party. An abandoned quest cannot be taken up again |
| `quests/*/progress/*` | Check outcomes only | Clamped at 0 |
| `quests/*/status`, `completedBy`, `resolvedTurn` | Engine | `open` → `accepted` → `completed` / `failed` / `expired` |
| `quests/*/secret/revealedTo` | Check outcomes (party adds itself), GM | Parties see `secret` only once revealed to them |
| `parties/*/reputation` | Engine (rewards), GM | Decides the season standings |
| `parties/*/capabilities` | GM | Basis of check modifiers |
| `clocks/*/filled` | GM, engine | `triggered` is engine-managed |
| `rng`, `checkLog`, `chronicle`, `guild/standings`, `guild/promoted` | Engine | Read-only for AI agents |

## 🎲 Checks

### Declaration
```json
{
  "id": "breach_vault",
  "description": "Brask batters the vault door while Lio watches the stairs",
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
- Up to **2 checks** per response, in `proposal.checks`
- `actor`: a party. A party's response may only roll for itself. The GM may impose a check on any party
- All three outcome lists are **required**. Effects in them are validated against permissions **before** the roll

### Resolution
```
modifier = capabilityModifier + situational      (situational clamped to -1..+1)
capabilityModifier = round((capability - 5) / 2.5), clamped to -2..+2   (missing capability: -1)

Unopposed:  2d6 + modifier ≥ 10 → success | 7-9 → partial | ≤ 6 → failure
Opposed:    margin = (2d6 + mod) - (2d6 + rival mod)
            margin ≥ 3 → success | 0-2 → partial | < 0 → failure
```
Probabilities (unopposed): modifier 0 → success 17%, partial 42%, failure 42%. Modifier +2 → success 42%, partial 42%, failure 17%.

Dice come from `hash(seed, turn, actor, check index)`. Resubmitting a response yields the **same dice**, so rerolling by resubmission is impossible.

### Writing Outcomes
| Outcome | Should contain |
|---|---|
| `success` | The goal advances cleanly (typically +2 progress, an item, a revealed secret) |
| `partial` | The goal advances with a cost (+1 progress and lost morale, a witness, a debt, a rival alerted) |
| `failure` | A real setback: lost morale or resources, worsened relationship, a clock advance, or a position lost |

## 🔄 Quest Lifecycle

```
GM issues quest (status: open)
   ↓ party adds itself to acceptedBy        (status: accepted)
   ↓ checks add progress at the quest location
   ↓ end of processing: engine resolves quests
      exclusive: first party with progress ≥ requiredProgress wins
                 (highest progress; ties settled by roll)
      joint:     total progress ≥ requiredProgress and ≥ minParties contributors;
                 reputation/currency split in proportion to progress, items to the top contributor
   ↓ completed: reward paid, client disposition +2, onComplete applied,
                quests in conflictsWith fail (their onFail and advancesClock apply)
start of each turn (upkeep):
   deadlineTurn passed → expired (onFail, advancesClock, client disposition -1 for each acceptor)
   clocks with tickPerTurn advance; full clocks trigger onComplete
season end (seasonEnd stop condition or session end):
   standings by reputation, then quests completed; promotionSlots top parties promoted (ties by roll)
```

All engine events are appended to `chronicle` and copied into the playlog entry's `engineEvents`.

## 🧩 Quest Design Patterns

| Pattern | Setup | Interaction it creates |
|---|---|---|
| **Collision** | Two clients, two quests with mutual `conflictsWith`, offered privately (`offeredTo`) to different parties | Opposition that neither side chose |
| **Race** | One `exclusive` quest open to all | Sabotage (opposed checks), alliances against the leader |
| **Joint** | `type: "joint"`, `minParties: 2` | Negotiation over effort and share, free-riding, betrayal |
| **Hidden truth** | `secret.truth` contradicts the client's story | Investigation, exposure, switching sides |
| **Escalation** | `onFail` + `advancesClock` | Ignored problems reshape the map |
| **Debt** | A quest that only another party's help can finish | Favors, leverage, payback |

### Quest Board Health
- Active quests ≈ number of parties + 1
- At least one pair of parties shares a quest location at any time
- Every quest has one dilemma: a cost, a doubt about the client, or a rival
- Deadlines spaced so that one quest resolves every 1-2 turns

## 🏁 Stop Conditions (session_config.json)

| Condition | Value | Ends when |
|---|---|---|
| `seasonEnd` | `true` | turn exceeds `guild.season.endsAtTurn` |
| `questsResolved` | number | that many quests are completed/failed/expired |
| `questCompleted` | quest id or list | any listed quest is resolved |
| `clockTriggered` | clock id or list | any listed clock triggers |
| `totalPartyWealth`, `regionDevelopment` | number | legacy economic conditions |

## 📋 Player Quest Strategy

1. **Choose quests by standings**: The leader protects its lead; trailing parties take risks
2. **Watch rivals**: `rivalProgress: "close"` on your quest means act now, interfere, or negotiate
3. **Investigate before finishing**: A client with a secret may make the reward worthless or the quest wrong
4. **Trade help for favors**: An `assist` paid with a recorded favor can be called in later
5. **Abandon deliberately**: Abandoning frees a slot but loses progress and the client's goodwill
