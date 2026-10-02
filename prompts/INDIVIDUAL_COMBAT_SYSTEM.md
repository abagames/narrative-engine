# Individual Combat System - Fighting Through Checks, Told Blow by Blow

**Purpose**: Fights are decided by the engine's checks, and told at the level of individual party members: every sword stroke, spell and wound is written out, and every one of them agrees with the result the dice gave.

There are no hit points, damage rolls or random elements in this document. If you compute who wins a fight yourself, you are deciding an outcome you did not roll for.

## ⚔️ Before the Roll: Declaring a Fight

A fight is a **check** (`QUEST_MANAGEMENT.md`). Declare it like any other:

| Situation | Check |
|---|---|
| Party against NPCs, beasts, the risen dead | Unopposed check by the party (`capability: "combat"` or what the approach uses). The GM may impose it |
| Party against party | Opposed check, `opposedBy` = the other party |
| Third clash between the same two parties over quests | Showdown (engine rule): no partial result; winner +2 on its quest, loser's progress to 0 |

Choosing the approach:
1. **Pick the tactic** from `TACTICAL_PATTERNS.md` that fits the members, the terrain and the enemy
2. **The tactic decides the capability**: a shield wall is `combat`, an ambush from the tunnels may be `exploration`, breaking a ward mid-fight is `investigation`, talking a mercenary into dropping his blade is `diplomacy`
3. **The tactic may justify `situational` ±1**: high ground, surprise, a ward already broken (+1); fighting in the dark, a wounded leader (-1). Say why in `description`
4. **Write the three outcomes** so each changes the story:

| Outcome | Typical effects |
|---|---|
| `success` | Quest progress, the enemy driven off, an item taken, a rival's progress chipped (-1) |
| `partial` | The same gain with a cost: a **condition** on one member (`{"name": "Brask wounded", "capability": "combat"}`), a resource spent, a witness |
| `failure` | A real setback: a condition, a rival's gain, a lost position, a clock advance |

Name conditions after the member and the wound: they appear in the novel and hamper later checks.

## 📖 After the Roll: Telling the Fight

Read the result in `engineResolution.checks` (dice, modifier, outcome, `bonuses.recruit`, `bonuses.item`, `bonuses.conditions`, `showdown`). Then write the fight blow by blow.

### Beats by Outcome
| Outcome | Shape of the scene |
|---|---|
| `success` | 3-4 beats: an opening move, a counter, a turn in the party's favor, a decisive blow by a named member |
| `partial` | 3-4 beats: the party wins the exchange but someone pays. The condition taken must appear on the page |
| `failure` | 3-4 beats: a promising start, the enemy's answer, the moment it goes wrong, the retreat or loss. Do not soften it into a win |
| Showdown | 5-6 beats, the climax of the rivalry: both leaders, the decisive exchange, the loser's quest collapsing |

### What Each Beat Contains
- **Who acts**: a named member, never "the party"
- **What they do**: the weapon, the spell, the footwork, the terrain they use
- **What it costs or gains**: tied to the effects that actually applied
- **One line of dialogue** where it fits (`DIALOGUE_SYSTEM.md`), in the member's speech style

### Using the Modifiers in the Story
- `bonuses.recruit`: the recruit's skill carried the moment. Show the recruit acting
- `bonuses.item`: show the item in use
- `bonuses.conditions`: show the old wound slowing someone down
- A high roll with a low modifier is luck; a low roll with a high modifier is the enemy's skill or bad footing. Let the narration reflect which

### Combat Log in the Playlog
Put the blow-by-blow account in the turn's narrative (`externalInteraction.communicationSummary` for the beats, `outcomeReaction` for the aftermath). Do not invent numbers: no HP, no damage figures. The only numbers are the dice the engine rolled.

```json
"communicationSummary": [
  "Lio spots the smugglers' lamps on the stair and whistles once",
  "Brask locks shields with Hedda in the narrow passage; the first rush breaks on them",
  "A hooked blade slips under Brask's guard and opens his arm (Brask wounded)",
  "Sister Ilse binds the arm while Brask, one-handed, drives the last smuggler into the sea"
]
```

## 🎭 Combat Style by Personality

The style shapes which tactic a party chooses before the roll and how members act in the telling. It never changes the result.

| Type | Choices before the roll | In the telling |
|---|---|---|
| Brave fighter | Direct tactics, `combat`, accepts conditions as the cost | Steps in front of allies, takes the wound for someone else |
| Calm fighter | Defensive tactics, situational +1 from positioning | Waits for the opening, few words |
| Analytical caster | Wards, terrain, `investigation` or `exploration` approaches | Explains the plan in a sentence, then executes it |
| Reckless caster | High-risk tactics, failure branches with heavy costs | Overreaches, the spell backfires on failure |
| Cunning rogue | Ambush, opposed `exploration`, sabotage within the -1 limit | Strikes where no one looks, gone before the answer |

## 🧠 GM and Player Roles in a Fight

- **GM**: stages the enemy and the ground, imposes checks for threats (`actor` = the threatened party), and never declares who wins
- **Player**: chooses the tactic, the capability and the stakes before the roll, then tells the fight as it fell
