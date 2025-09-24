# Character Personality Templates for Novel Conversion

## Purpose

Template collection providing consistent character personalities and conversation patterns for party-perspective novel conversion.

## Basic Structure

Each party defines characters with the following elements:

```typescript
interface CharacterProfile {
  partyName: string;
  leadershipStyle: LeadershipType;
  decisionMaking: DecisionStyle;
  communicationStyle: CommunicationPattern;
  coreValues: string[];

  // 🆕 Individual member definitions (specific names and roles)
  partyMembers: Array<{
    name: string;           // Personal name (e.g. "Aria", "Kite", "Mira")
    role: string;           // Role (e.g. "Leader", "Scout", "Scholar", "Warrior", "Mage")
    personality: string;    // Personality (e.g. "Analytical", "Cautious", "Curious", "Brave", "Calm")
    speechStyle: string;    // Speech style (e.g. "Calm and analytical", "Concise and practical", "Academic and detailed")
    specialization?: string; // Specialization (e.g. "Tactics", "Reconnaissance", "Magic theory", "Negotiation")
  }>;

  speechPatterns: {
    internal: string;    // Tone for internal discussions
    external: string;    // Tone for negotiations with others
    emotional: string;   // Expression in emotional scenes
  };
  narrativeVoice: {
    observationStyle: string;    // Description style for situation observation
    thinkingPattern: string;     // Expression method for thought processes
    actionDescription: string;   // Characteristics of action descriptions
  };
}
```

## Leadership Types

### collaborative_democracy (Consensus-based)
**Characteristics**: Treats everyone's opinions equally, decisions made through discussion
```json
{
  "internalDialogue": [
    "What does everyone think?",
    "Let's think of a way everyone can agree on",
    "Are there any other opinions?"
  ],
  "decisionProcess": "Takes time to form consensus among all members",
  "conflictResolution": "Resolution through dialogue and compromise",
  "narrativeStyle": "Frequent use of 'we' and 'us', emphasis on collective thinking"
}
```

### experienced_guidance (Experienced Leader-Led)
**Characteristics**: Experienced leader determines policy direction, other members provide advice
```json
{
  "internalDialogue": [
    "From my experience...",
    "What's your take on this?",
    "I'll make the decision"
  ],
  "decisionProcess": "Based on leader's judgment, with member opinions as reference",
  "conflictResolution": "Swift resolution through leader's decision",
  "narrativeStyle": "Strong leader perspective with expressions of responsibility"
}
```

### specialization_based (Specialization-Based)
**Characteristics**: Decision-making authority delegated by area of expertise
```json
{
  "internalDialogue": [
    "Let's leave the combat decisions to the Fighter",
    "The Wizard should handle magic matters",
    "Let's make use of each person's expertise"
  ],
  "decisionProcess": "Field-specific experts take the lead",
  "conflictResolution": "Logical resolution through specialized knowledge",
  "narrativeStyle": "Clear role division, efficiency-focused descriptions"
}
```

## Decision-Making Styles

### cautious_analytical (Cautious Analytical Type)
**Thinking Patterns**:
```
- Emphasizes risk assessment
- Keeps long-term plans in mind
- Judgments based on data and experience
- Considers multiple scenarios
```

**Conversation Examples**:
```
Internal: "Let's organize the risks of this option"
External: "We would like to consider this carefully"
Emotional: "There are concerns, but the analysis results are clear"
```

### bold_opportunistic (Bold Opportunistic Type)
**Thinking Patterns**:
```
- Attitude of not missing opportunities
- Rapid decision-making
- Prefers high-risk, high-return
- Values intuition and courage
```

**Conversation Examples**:
```
Internal: "This is our chance, there's no time to hesitate"
External: "We can't let this opportunity slip away"
Emotional: "My heart is racing, let's do this"
```

### balanced_pragmatic (Balanced Pragmatic Type)
**Thinking Patterns**:
```
- Seeks realistic compromise points
- Emphasizes balance
- Always considers feasibility
- Prefers step-by-step approaches
```

**Conversation Examples**:
```
Internal: "Thinking realistically, this seems reasonable"
External: "Let's find a mutually beneficial arrangement"
Emotional: "It's complicated, but this is the best option"
```

## Communication Styles

### diplomatic_direct (Diplomatic Direct)
**Characteristics**: Polite and clear
```json
{
  "negotiationStyle": "Respects the other party while clearly conveying key points",
  "speechPatterns": [
    "I apologize for taking your valuable time, but",
    "To speak frankly",
    "From a mutual benefit perspective"
  ],
  "conflictHandling": "Calm and constructive dialogue",
  "emotionalExpression": "Modest but sincere"
}
```

### friendly_casual (Friendly Casual)
**Characteristics**: Approachable and easy-going
```json
{
  "negotiationStyle": "Creates friendly atmosphere to bridge the gap with others",
  "speechPatterns": [
    "How about it, want to try working together?",
    "Actually, I have an interesting idea",
    "We're in the same boat, right?"
  ],
  "conflictHandling": "Eases tension with humor and empathy",
  "emotionalExpression": "Honest and expressive"
}
```

### professional_formal (Professional Formal)
**Characteristics**: Business-like, efficiency-focused
```json
{
  "negotiationStyle": "Negotiations emphasizing efficiency and expertise",
  "speechPatterns": [
    "To organize the conditions",
    "From a technical standpoint",
    "Considering cost-effectiveness"
  ],
  "conflictHandling": "Resolution based on logic and rules",
  "emotionalExpression": "Restrained and objective"
}
```

## Value Patterns

### mutual_benefit (Mutual Benefit Focus)
```
- Pursues Win-Win relationships
- Values long-term partnerships
- Invests in building trust relationships
- Avoids one-sided profit pursuit
```

### knowledge_pursuit (Knowledge Pursuit)
```
- Values information and knowledge
- Seeks learning and growth opportunities
- Strong curiosity for the unknown
- Motivated by intellectual stimulation
```

### strategic_patience (Strategic Patience)
```
- Long-term perspective in decision-making
- Accepts temporary disadvantages
- Understands the importance of timing
- Emphasizes sustainability
```

## Narrative Tone Templates

### Cautious Analytical Type Description Example
```markdown
We carefully observed the situation. Market trends, other parties' movements, and our current position—we need to comprehensively consider all elements.

"Let's calmly analyze the risks and returns," we discuss in low voices. Being swayed by emotions is dangerous. Data and experience—these are our criteria for judgment.

After long deliberation, we reached a conclusion. No perfect option exists, but we can see a path with the least risk and the most future potential.
```

### Bold Opportunistic Type Description Example
```markdown
An excellent opportunity spreads before us! Our blood stirs. Such chances are rare.

"Now is the time, there's no room for hesitation," we look into each other's eyes and confirm the same resolve. There are risks, but the returns that await exceed them.

We've abandoned doubt. We act in unison. Courage and intuition—these are our weapons.
```

### Balanced Pragmatic Type Description Example
```markdown
Between ideals and reality, we search for compromise points. No perfect solution exists, but there is a realistic and sustainable path.

"Let's find areas where we can meet each other halfway," we strive to understand the other party's position as well. We want to advance through cooperation, not confrontation.

It's a complex situation, but through a step-by-step approach, we can see the thread of resolution. It may be a small step, but it's definite progress.
```

## Situational Conversation Templates

### At Negotiation Start
```json
{
  "diplomatic_direct": "Thank you for your time. We've brought a proposal that will benefit both parties",
  "friendly_casual": "Hey, how have you been? Actually, I have an interesting story",
  "professional_formal": "Thank you for taking time out of your busy schedule today. Allow us to explain the matter at hand"
}
```

### When Making Difficult Decisions
```json
{
  "cautious_analytical": "After considering all possibilities, we concluded this option is the most rational",
  "bold_opportunistic": "There are risks, but we can't let this opportunity slip away. Let's try it",
  "balanced_pragmatic": "It's not ideal, but realistically it's the most feasible choice"
}
```

### Reactions to Unexpected Results
```json
{
  "positive_surprise": {
    "cautious": "Results exceeded expectations. However, we need to analyze why this happened",
    "bold": "Excellent! Let's ride this momentum and seize the next opportunity",
    "balanced": "Good results. We want to apply these success factors going forward"
  },
  "negative_surprise": {
    "cautious": "This is an unexpected development. Let's carefully examine what we overlooked",
    "bold": "It's a temporary setback. We'll quickly regroup and counterattack",
    "balanced": "It's a tough situation, but there are things to learn. Let's apply them next time"
  }
}
```

## Implementation Guidelines

### Personality Consistency
- Same party uses the same personality profile across all turns
- Core values and judgment criteria are maintained even when situations change
- Growth and changes are expressed in gradual and convincing ways

### 🆕 Specific Utilization of Individual Members
- **Name Consistency**: Same members maintain the same names and personalities throughout all sessions
- **Role Division Expression**: Describe statements and proposals according to each member's expertise during decisions
- **Individual Growth**: Depict individual-level learning and changes as sessions progress
- **Dialogue Concretization**: Use specific names like "Aria" or "Kite" rather than "one of the members"

### Natural Conversation
- Word choice reflecting relationships between characters
- Tone adjustment according to situation urgency
- Express human-like reactions in emotional scenes
- **🆕 Individual Speech Patterns**: Express individual speaking styles according to each member's speechStyle

### Cultural Appropriateness
- Appropriate use of formal and polite language
- Choose expressions suitable for fantasy world settings
- Avoid overly modern expressions

## 🆕 Individual Member Setup Templates

### Typical Example of Exploration-Type Party

```json
{
  "partyName": "Emerald Hunters",
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
  ]
}
```

### Typical Example of Combat-Type Party

```json
{
  "partyName": "Steel Shield Brigade",
  "partyMembers": [
    {
      "name": "Gareth",
      "role": "Captain",
      "personality": "Brave",
      "speechStyle": "Powerful and decisive commands, words that inspire companions",
      "specialization": "Tactical command"
    },
    {
      "name": "Sera",
      "role": "Healer",
      "personality": "Compassionate",
      "speechStyle": "Gentle and considerate suggestions, prioritizing companion safety",
      "specialization": "Treatment and recovery"
    },
    {
      "name": "Doran",
      "role": "Heavy Warrior",
      "personality": "Spirited",
      "speechStyle": "Straightforward and powerful, action-oriented statements",
      "specialization": "Frontline combat"
    }
  ]
}
```

### Typical Example of Commercial-Type Party

```json
{
  "partyName": "Fire Forge Guild",
  "partyMembers": [
    {
      "name": "Master Sorin",
      "role": "Guild Master",
      "personality": "Calculating",
      "speechStyle": "Business-like and efficiency-focused, profit-oriented proposals",
      "specialization": "Management and negotiation"
    },
    {
      "name": "Aina",
      "role": "Blacksmith",
      "personality": "Craftsman-like",
      "speechStyle": "Technical and straightforward, quality-focused statements",
      "specialization": "Metalworking"
    },
    {
      "name": "Tom",
      "role": "Merchant",
      "personality": "Social",
      "speechStyle": "Friendly and skilled in negotiation, emphasizing relationship building",
      "specialization": "Sales and information gathering"
    }
  ]
}
```

## Multi-Party Strategy Patterns

### Decision Criteria Between Multiple Parties

**Basic Principles**: Strategic thinking when multiple parties operate simultaneously in the same world

- **Purpose Alignment**: Confirm consistency between each party's long-term goals and short-term tasks
- **Conflict Avoidance**: Detect interest conflicts in the same region in advance and prioritize negotiation
- **Specialization Utilization**: Role division based on capability differences (combat/exploration/diplomacy/crafting/trade)
- **Relationship Reflection**: Factor `trust` into scoring to weight cooperation/competition
- **Risk Management**: Threshold management of morale and resource levels, expedite retreat decisions

**Evaluation Score Example**:
```
score(region) = 0.6*suitability + 0.2*expected_profit + 0.2*relationship_modifier
```

### Negotiation Patterns

**Basic Strategy**:
- **Win-Win Design**: Estimate opponent's objectives and quantify concession room
- **Staged Negotiation**: From small agreements to large agreements
- **Relationship Assets**: Evaluate long-term value for transactions that increase/decrease `trust`
- **Price Adjustment**: Currency uses safe integers with no negative balances, prices fluctuate based on regional demand

**Negotiation Tactics**:
1. Anchoring (Setting standards with initial proposal)
2. Alternative Presentation (Preparing multiple options)
3. Clarifying Agreement Conditions (Preventing misunderstandings)

**Trust Relationship Management**:
- Trust: Evaluated in range of -10..10
- Continuity: Bonus for choices that prioritize long-term relationships over short-term gains
- Update Rule Examples: Fair trade +1, betrayal -3, rescue +2, attack -2