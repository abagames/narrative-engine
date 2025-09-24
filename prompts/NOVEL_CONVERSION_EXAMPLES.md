# Novel Conversion Examples and Templates

## Purpose

Provides specific implementation examples for `PARTY_PERSPECTIVE_NOVEL_CONVERSION.md` and conversion templates for various scenarios.

## Complete Conversion Example

### Input Data Example

```json
{
  "playlog": {
    "entries": [
      {
        "step": 1,
        "type": "explore",
        "participants": ["emerald_hunters"],
        "narrative": {
          "basicDescription": "Emerald Hunters explored the northern forest and discovered ancient ruins",
          "internalPerspective": {
            "situationObservation": "Discovered stone structures deep in the forest, sensing magical aura",
            "internalDeliberation": "Fighter advocates cautious approach, Wizard proposes magical analysis",
            "actionMotivation": "Want to investigate the ruins' value while assessing potential dangers",
            "expectedOutcome": "Discovery of valuable magical knowledge or treasures, or encounter with ancient guardians"
          },
          "outcomeReaction": {
            "immediateEmotionalResponse": "Excitement about the discovery and awe of the unknown",
            "strategicImplication": "Gained new exploration opportunities, reaffirmed importance of specialized knowledge",
            "futureDirectionAdjustment": "Considering expanded investment in ancient magic research"
          },
          "environmentalContext": {
            "settingDescription": "In the dim forest, moss-covered ancient stone architecture stands mysteriously",
            "worldStateAwareness": "Discovery aligns with rumors of increased magical activity in this region"
          }
        },
        "effects": [
          {
            "target": "/treasures/ancient_rune_tablet/discoveredBy",
            "operation": "set",
            "value": "emerald_hunters"
          }
        ],
        "deltas": {
          "exploration_progress": 1
        }
      },
      {
        "step": 2,
        "type": "market_trade",
        "participants": ["emerald_hunters", "fire_forge_guild"],
        "narrative": {
          "basicDescription": "Emerald Hunters purchased 5 units of iron ore from Fire Forge Guild for 15 currency",
          "internalPerspective": {
            "situationObservation": "Iron prices stable in the market, Fire Forge Guild's quality is reliable",
            "internalDeliberation": "Need equipment enhancement for ruins investigation, prioritize procurement within budget",
            "actionMotivation": "Preparation for full-scale investigation of the discovered ruins",
            "expectedOutcome": "Securing quality iron ore and maintaining relationship with the smithing guild"
          },
          "externalInteraction": {
            "approachStrategy": "Friendly negotiation with long-term partnership in mind",
            "communicationSummary": [
              "Briefly explained the ruins investigation project overview",
              "Suggested possibility of continuous material procurement",
              "Requested quality assurance and prompt delivery"
            ],
            "perceivedResponse": "Fire Forge Guild showed interest and cooperative attitude",
            "relationshipAssessment": "Good trading relationship with mutual respect for expertise"
          },
          "outcomeReaction": {
            "immediateEmotionalResponse": "Satisfaction with smooth preparation progress",
            "strategicImplication": "Established material procurement routes, improved project feasibility",
            "futureDirectionAdjustment": "Considering expansion of technical cooperation with Fire Forge Guild"
          }
        },
        "effects": [
          {
            "target": "/parties/emerald_hunters/resources/currency",
            "operation": "add",
            "value": -15
          },
          {
            "target": "/parties/emerald_hunters/resources/iron",
            "operation": "add",
            "value": 5
          }
        ],
        "deltas": {
          "currency:emerald_hunters": -15,
          "trust:emerald_hunters:fire_forge_guild": 1
        }
      }
    ],
    "finalWorld": {
      "parties": {
        "emerald_hunters": {
          "name": "Emerald Hunters",
          "location": "settlement_center",
          "resources": {"currency": 85, "iron": 5}
        }
      }
    }
  },
  "focusPartyId": "emerald_hunters",
  "characterProfile": {
    "partyName": "Emerald Hunters",
    "leadershipStyle": "collaborative_democracy",
    "decisionMaking": "cautious_analytical",
    "communicationStyle": "diplomatic_direct",
    "coreValues": ["knowledge_pursuit", "mutual_benefit", "strategic_patience"],
    "speechPatterns": {
      "internal": "Polite language, analytical, cautious",
      "external": "Courteous, clear, cooperation-focused"
    }
  },
  "options": {
    "narrativeStyle": "novel",
    "emotionalDepth": "high",
    "dialogueDetail": "extensive"
  }
}
```

### Output Novel Example

```markdown
# Emerald Hunters' Records — Ancient Ruins Discovery Arc

## Prologue

We, the Emerald Hunters, are an exploration group that pursues knowledge and discovery. Fighters and Wizards cooperate to seek new truths in this dangerous and mysterious world. This record is the story of a momentous discovery that would change our destiny.

---

## Chapter 1: Secrets in the Deep Forest

### Turn 1: Ancient Ruins Discovery — The Door to Knowledge Opens

**Exploration of the Northern Forest**

Deep in the dim forest, we carefully advanced step by step. The patterns of light and shadow created by the dappled sunlight intertwined in complex ways, like ancient ciphers. Amid this, the Wizard stopped.

"Do you feel something? There's a magical aura..." Her voice mixed excitement with tension.

We carefully observed our surroundings. And then we found it—a moss-covered stone structure standing as if it had waited for us across time. Ancient ruins. Their presence was overwhelming, stirring our hearts.

"This is... quite ancient," the Fighter murmured while cautiously approaching. "There might be traps or guardians."

"But this magical aura. This is no mere ruin," the Wizard said, unable to contain her excitement. "Surely precious knowledge lies dormant here."

We looked at each other and confirmed the same resolve. This was not merely a chance discovery. It was an inevitable encounter guided by our quest for knowledge and expertise. However, we must not forget caution.

"Let's start with basic investigation," we reached consensus. "Before taking risks, we need to understand what these ruins are."

When we discovered characters carved on the stone surface, our hearts leaped. An ancient runic tablet—this was undoubtedly a valuable discovery. Excitement about the discovery and awe of the unknown swirled within our chests.

This discovery would greatly change our future direction. We should seriously consider investing in ancient magic research. Knowledge is our greatest weapon, after all.

---

### Turn 2: Equipment Procurement — Preparation is the First Step to Success

**Trading at the Central Market**

The day after our ruins discovery, we were at the central market. In the morning market full of vitality, various merchants were raising their voices. Among them, the Fire Forge Guild's stall particularly caught our eye.

"For full-scale ruins investigation, we need better equipment," we discussed in low voices. "The Fire Forge Guild should provide reliable quality iron ore."

Checking market prices, iron rates were stable. We could procure the necessary materials within our budget. This was convenient—we once again realized the importance of careful planning.

A craftsman from the Fire Forge Guild noticed us and approached. His expression was filled with the sincerity characteristic of artisans.

"Sorry to trouble you while you're busy, but could you spare 5 units of iron ore?" we politely opened. "Actually, we're advancing an ancient ruins investigation project and need quality materials."

"Ancient ruins, that's interesting," the craftsman's eyes lit up. "We too are interested in old techniques. How about 15 currency? We guarantee the quality."

"Thank you. Not just this time, but there's possibility for continuous transactions," we responded with future cooperation in mind. "Could we also request prompt delivery?"

"Of course. We'd very much like to have a long relationship with sincere seekers like the Emerald Hunters."

The transaction concluded smoothly. We obtained 5 units of quality iron ore and further deepened our trust relationship with the Fire Forge Guild. Respecting these craftsmen's expertise while being respected by them—this is the ideal trading relationship.

We felt satisfaction at the smooth preparation progress. Material procurement routes were established, and project feasibility greatly improved. In the future, we might be able to expand technical cooperation with the Fire Forge Guild.

We were steadily taking a step toward solving ancient mysteries. Our caution and thorough preparation would surely bring success.

---

## Epilogue

These events are merely the beginning of a new chapter for us Emerald Hunters. The discovery of ancient ruins satisfied our thirst for knowledge while bringing new questions and challenges.

Our cooperative relationship with the Fire Forge Guild suggests new possibilities for the fusion of technology and knowledge. Respecting each other's expertise and pursuing mutual benefit—this is our belief and the path to success.

In the next record, full-scale investigation of the ruins will finally begin. What will we discover there? New knowledge, ancient dangers, or truths beyond imagination?

What we can say for certain is that we will continue advancing cautiously but courageously. The pursuit of knowledge and discovery—that is the mission of us Emerald Hunters.

*(Recorded by: The Emerald Hunters)*
```

## Scenario-Based Templates

### Combat Scene Conversion Example

```typescript
// Input
{
  "type": "conflict",
  "narrative": {
    "internalPerspective": {
      "situationObservation": "Orc horde launches surprise attack, numerically disadvantaged but terrain is favorable",
      "internalDeliberation": "Fighter will buy time in front line, Wizard will decide battle with area attack magic - tactical agreement reached",
      "actionMotivation": "Want to minimize damage while reliably eliminating threats"
    }
  }
}

// Output
"The sound of clashing swords echoes through the forest. We positioned ourselves back-to-back.
'Their numbers are many, but we can manage with this terrain,' the Fighter calmly analyzes the situation.
'Magic preparation is complete,' the Wizard heightens concentration.
This is the moment our coordination is tested."
```

### Diplomatic Negotiation Conversion Example

```typescript
// Input
{
  "type": "negotiate",
  "narrative": {
    "externalInteraction": {
      "approachStrategy": "Maintain opponent's dignity while emphasizing mutual benefits",
      "communicationSummary": [
        "Statements acknowledging opponent's achievements",
        "Presentation of Win-Win proposals",
        "Suggestion of long-term cooperation possibilities"
      ],
      "perceivedResponse": "Initially wary but gradually showing interest"
    }
  }
}

// Output
"'Your achievements are widely known,' we greet with respect.
We don't miss the slight relaxation in their expression.
'Actually, we have a proposal that would benefit both parties.'
The negotiation table begins to take shape."
```

## Emotional Expression Pattern Collection

### Reactions to Success
```json
{
  "cautious_analytical": "'Results as planned. However, analyzing why we succeeded is also important.'",
  "bold_opportunistic": "'We did it! Let's keep this momentum and seize the next opportunity!'",
  "balanced_pragmatic": "'Good results. Let's apply this experience going forward.'"
}
```

### Reactions to Failure
```json
{
  "cautious_analytical": "'Unexpected. We need to examine in detail what we overlooked.'",
  "bold_opportunistic": "'This is merely a temporary setback. Let's quickly regroup.'",
  "balanced_pragmatic": "'Harsh results, but there are points to learn. Let's connect this to the next opportunity.'"
}
```

### Surprise Scenes
```json
{
  "positive_surprise": "'This is beyond expectations!' Our eyes are filled with brilliance.",
  "negative_surprise": "'This is... outside our calculations.' We quickly reevaluate the situation.",
  "mysterious_discovery": "'This phenomenon... exceeds our knowledge.' Awe fills our chests."
}
```

## Quality Checklist

### Technical Consistency
- [ ] Complete match with numerical data (deltas, effects)
- [ ] Accurate reflection of participant parties
- [ ] Maintenance of chronological order
- [ ] Accurate representation of action types

### Character Consistency
- [ ] Consistency with established personality profile
- [ ] Unified tone throughout all turns
- [ ] Expression of judgments based on values
- [ ] Natural depiction of growth and change

### Story Quality
- [ ] Natural language expression
- [ ] Appropriate scene descriptions
- [ ] Empathetic psychological descriptions
- [ ] Engaging narrative development

### Cultural Appropriateness
- [ ] Harmony with fantasy worldview
- [ ] Appropriate use of formal and polite language
- [ ] Avoidance of overly modern expressions
- [ ] Consistency with regional and cultural settings