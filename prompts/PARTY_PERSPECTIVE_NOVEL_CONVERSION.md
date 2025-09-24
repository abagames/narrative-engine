# Party Perspective Novel Conversion

## Purpose

Convert play logs into novel-style narratives from the perspective of a specific party. Express the "observation → thinking → action → result" cycle of each turn as a natural story, generating readable content that emphasizes character psychology and dialogue.

## Basic Policy

### Narrative Structure
Each turn consists of the following elements:
1. **Situation Observation** - What the party saw and felt
2. **Internal Thinking** - How they consulted within the party and what they thought
3. **Action Execution** - The decided action and its execution process
4. **Result Recognition** - How they received the action results and others' reactions

### Writing Style and Tone
- **First-person plural perspective**: Using "we" and "us" as subjects
- **Present progressive form**: Creating a sense of presence as if experiencing events
- **Introspective description**: Detailed description of decision-making psychological processes
- **Dialogue emphasis**: Expressing relationships through conversations between characters

## Input Specification

```json
{
  "playlog": {
    "entries": [/* LifePlayEntry[] */],
    "finalWorld": {/* LifeSimulationWorldState */}
  },
  "focusPartyId": "emerald_hunters",
  "narrativeStyle": "novel" | "journal" | "memoir",
  "characterProfile": {
    "partyName": "Emerald Hunters",
    "leadershipStyle": "collaborative_democracy",
    "decisionMaking": "cautious_analytical",
    "communicationStyle": "diplomatic_direct",
    "coreValues": ["mutual_benefit", "knowledge_pursuit", "strategic_patience"],

    // 🆕 Individual member definitions (dialogue generation using specific names and roles)
    "partyMembers": [
      {
        "name": "Aria",
        "role": "Leader",
        "personality": "Analytical",
        "speechStyle": "Calm and logical, data-focused statements",
        "specialization": "Strategic planning"
      },
      {
        "name": "Kite",
        "role": "Scout",
        "personality": "Cautious",
        "speechStyle": "Concise and practical, risk-focused warnings",
        "specialization": "Reconnaissance and danger detection"
      },
      {
        "name": "Mira",
        "role": "Scholar",
        "personality": "Curious",
        "speechStyle": "Academic and detailed, expressing excitement about discoveries",
        "specialization": "Knowledge and research"
      }
    ],

    "speechPatterns": {
      "internal": "Polite language, analytical, cautious",
      "external": "Courteous, clear, skilled at negotiation"
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

## Output Structure

### Main Composition
```markdown
# [Party Name] Records — [Period]

## 🆕 Party Introduction
### About Us

We are [Party Name]. We are adventurers who operate under the banner of [Party's basic concept and goals].

**Member Composition:**

**[Name1]** ([Role])
: [Personality and character description]. Skilled in [specialization], [typical speaking style description]. Within the team, they handle [role and responsibilities].

**[Name2]** ([Role])
: [Personality and character description]. Proficient in [specialization], [typical speaking style description]. They operate as our [role and responsibilities].

**[Name3]** ([Role])
: [Personality and character description]. Possessing deep knowledge in [specialization], [typical speaking style description]. They contribute through [role and responsibilities].

**Our Action Principles:**
- **[Value1]**: [Specific action guideline description]
- **[Value2]**: [Specific action guideline description]
- **[Value3]**: [Specific action guideline description]

---

## Prologue
[Background setting, initial situation, goal description]

## Chapter 1: [Thematic Title]
### The Story of Turns 1-5

## Chapter 2: [Thematic Title]
### The Story of Turns 6-12

## Epilogue
[Summary, learnings, implications for the future]
```

### Turn Structure Template (🆕 Individual Name Utilization Version)

```markdown
**Turn X: [Action Type] — [Brief Summary]**

[Environmental and situational description]

"[Internal dialogue 1]" Aria analyzes while pointing at the map. We exchange glances with each other. [Psychological description].

[Details of observed situation]. In response to this, we [thought process].

"[Strategic proposal]" Aria states cautiously.
"[Risk assessment]" Kite adds a warning.
"[Academic perspective]" Mira adds excitedly.
"[Final decision]" We reach consensus.

[Process description of action execution]

[In case of interaction with others]
"[External dialogue 1]" Aria politely proposes to [other party].
"[Other party's response]" [Other party's name] responds.
"[Our response]" Kite responds from a practical perspective.

[Recognition of results and emotional reaction]

---
```

### 🆕 Individual Member Utilization Guidelines

**Dialogue Allocation Principles:**
- **Strategy & Analysis**: Led by Aria (Leader)
- **Danger & Risk Warning**: Handled by Kite (Scout)
- **Knowledge & Discovery Excitement**: Expressed by Mira (Scholar)
- **Consensus Building**: Decided through full participation consensus system

**Speech Individualization:**
```markdown
Aria: "Looking at the data, this option is the most rational"
Kite: "Wait a minute. That path is too dangerous"
Mira: "Fascinating! There are similar records in ancient literature"
```

**Role Division Based on Expertise:**
- **Strategic Planning**: Aria proposes overall strategy
- **Reconnaissance & Alert**: Kite handles danger detection and situation reporting
- **Knowledge & Research**: Mira explains academic background and value of discoveries

## Character Personality Patterns

### Leadership Types
- **collaborative_democracy**: Listen to everyone's opinions and reach consensus
- **experienced_guidance**: Leader decides policy, members provide advice
- **specialization_based**: Delegate decision-making authority by specialty area
- **adaptive_situational**: Change leadership style according to situation

### Decision-Making Styles
- **cautious_analytical**: Risk assessment focused, long-term planning oriented
- **bold_opportunistic**: Opportunity focused, proactive action
- **balanced_pragmatic**: Realistic, balance-oriented
- **innovative_experimental**: Prefer new approaches

### Communication Styles
- **diplomatic_direct**: Courteous and clear
- **friendly_casual**: Approachable and easygoing
- **professional_formal**: Business-like, efficiency focused
- **warm_empathetic**: Emotionally considerate, relationship focused

## Conversion Processing Algorithm

### Phase 1: Data Preparation
```
for each entry in playlog.entries:
  if focusPartyId in entry.participants:
    extract relevant context from entry.meta.llmDecision
    extract narrative elements from entry.narrative
    identify other parties involved
    calculate resource/relationship changes
```

### Phase 2: Story Construction
```
group entries by narrative arc (5-8 turns per chapter)
for each chapter:
  identify central theme/conflict
  select representative key moments
  develop character arc progression
```

### Phase 3: Text Generation
```
for each turn:
  generate environmental setting
  create internal dialogue based on meta.llmDecision
  develop external interactions based on participants
  describe emotional responses to outcomes
  transition to next turn context
```

## Quality Requirements

### Story Consistency
- Maintain consistency in character personalities
- Logical continuity in chronological order
- Growth depiction through emotional arcs

### Technical Accuracy
- 100% consistency with playlog numerical data
- Accurate reflection of action cause-and-effect relationships
- Objective description of interactions with other parties

### Quality as Readable Content
- Natural narrative description in the target language
- Differentiated dialogue between characters
- Psychological descriptions that encourage reader empathy

## Usage Examples

### Input Playlog Entry
```json
{
  "step": 5,
  "type": "market_trade",
  "participants": ["emerald_hunters", "fire_forge_guild"],
  "narrative": "Emerald Hunters purchased 10 units of wood for 30 currency",
  "meta": {
    "llmDecision": {
      "state_digest": "Wood shortage, construction materials needed, negotiation opportunity with Fire Forge Guild",
      "reasoning": "Securing stable supply sources is important for long-term construction plans",
      "framework_evaluation": {...}
    }
  },
  "deltas": {
    "currency:emerald_hunters": -30,
    "trust:emerald_hunters:fire_forge_guild": +1
  }
}
```

### Output Narrative Example
```markdown
**Turn 5: Wood Procurement Negotiation — First Step Toward Construction Plans**

In the bustle of the marketplace, we stood before the Fire Forge Guild's stall. High-quality wood stacked up caught our eyes, its beautiful grain illuminated by the morning sun.

"To advance our construction plans, we really need a reliable supply source," we discuss in hushed tones. The 30 currency we have on hand is no small amount, but from a long-term perspective, it would be a necessary investment.

A merchant from the Fire Forge Guild notices us and approaches. Their expression is friendly, and we can sense the trust built from past transactions.

"We would like to purchase 10 units of wood," we politely begin.
"Of course. For the Emerald Hunters, how about 30 currency?" Their response is prompt, and the price is reasonable.
"Thank you. We look forward to working with you in the future."

The transaction proceeded smoothly, and we were able to obtain quality wood. The trust built through this negotiation will surely become the foundation for future cooperative relationships. We gaze with satisfaction at our new construction materials.

---
```

## Important Notes

### Creative Scope Limitations
- Numerical data (currency, resource changes) must be strictly observed
- Participants and action types cannot be modified
- Chronological order cannot be changed

### Elements That Can Be Supplemented
- Character emotions and motivations
- Environmental and atmospheric descriptions
- Specific dialogue content (while maintaining logical consistency)
- Psychological processes of decision-making