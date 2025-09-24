# DIALOGUE_SYSTEM.md - Character Dialogue System

## 🗣 Character-Specific Speaking Styles and Vocabulary

### Speaking Patterns Based on Basic Personality

#### Fighter-Type Characters
```
Brave Type (courage > 5):
- "Let's go!" "Leave it to me!" "There's nothing to fear"
- Assertive, short sentences, action-oriented
- Sentence endings: da/de aru tone

Cautious Type (wisdom > 5):
- "Let's observe the situation" "Let's proceed carefully" "First, let's check the situation"
- Suggestive, analytical
- Sentence endings: shiyou/darou tone
```

#### Wizard-Type Characters
```
Intellectual Type (wisdom > 5):
- "According to analysis..." "Theoretically speaking..." "According to the data"
- Logical, heavy use of technical terms
- Sentence endings: de aru/da tone (academic)

Empathetic Type (empathy > 5):
- "I'm worried about everyone" "Are you hurt?" "Let's work together"
- Caring, emotionally expressive
- Sentence endings: desu/masu tone (polite)
```

### Speaking Style Changes Based on Relationship Level

```typescript
interface DialogueStyle {
  formality: number;     // 0-10: Level of formality
  warmth: number;        // 0-10: Friendliness
  directness: number;    // 0-10: Directness
  concern: number;       // 0-10: Consideration for others
}

function getDialogueStyle(relationship: Relationship): DialogueStyle {
  const familiarity = relationship.familiarity / 10.0;
  const trust = Math.max(0, relationship.trust) / 10.0;
  const respect = Math.max(0, relationship.respect) / 10.0;

  return {
    formality: Math.max(0, 8 - familiarity * 6),     // More casual as intimacy increases
    warmth: trust * 7 + familiarity * 3,             // Warmth from trust and familiarity
    directness: familiarity * 5 + respect * 3,       // More direct as relationship deepens
    concern: trust * 6 + (relationship.empathy || 0) * 4  // Consideration from trust level and empathy
  };
}
```

## 💬 Contextual Dialogue Selection

### Combat Dialogue Patterns

#### During Attacks
```typescript
function getCombatDialogue(action: string, personality: PersonalityEvolution, target: string): string {
  const courage_level = personality.courage;
  const wisdom_level = personality.wisdom;

  switch (action) {
    case 'attack':
      if (courage_level > 7) {
        return ["Head-on confrontation!", "Going straight at you!", "This is a clash of strength!"][Math.floor(Math.random() * 3)];
      } else if (wisdom_level > 5) {
        return ["Strike at the opening", "Let's go tactically", "Aim calmly"][Math.floor(Math.random() * 3)];
      }
      return "Attack";

    case 'heal':
      if (personality.empathy > 6) {
        return `${target}, are you okay? I'll heal you now!`;
      } else if (personality.leadership > 5) {
        return `${target}, healing for battle line maintenance`;
      }
      return `Heal ${target}`;
  }
}
```

#### During HP Crisis
```typescript
function getEmergencyDialogue(hp_ratio: number, personality: PersonalityEvolution): string {
  if (hp_ratio < 0.3) {
    if (personality.courage > 7) {
      return ["I can still fight!", "I won't lose to this!", "I won't give up!"][Math.floor(Math.random() * 3)];
    } else if (personality.wisdom > 5) {
      return ["We should consider tactical retreat", "The situation is dire", "We need a different approach"][Math.floor(Math.random() * 3)];
    } else {
      return ["This is bad...", "This is dangerous", "Help me!"][Math.floor(Math.random() * 3)];
    }
  }
  return "";
}
```

### Exploration and Movement Dialogue

```typescript
function getExplorationDialogue(environment: EnvironmentState, personality: PersonalityEvolution): string {
  const responses = [];

  // Environmental reactions
  switch (environment.weather) {
    case 'storm':
      if (personality.adaptability > 6) {
        responses.push("A storm... interesting challenge");
      } else {
        responses.push("This storm is troublesome");
      }
      break;
    case 'fog':
      if (personality.wisdom > 6) {
        responses.push("Poor visibility. Let's proceed carefully");
      } else if (personality.courage > 7) {
        responses.push("Fog doesn't matter, let's go");
      }
      break;
  }

  // Lighting reactions
  if (environment.lighting === 'dark' && personality.courage < 4) {
    responses.push("It's dark and unsettling...");
  }

  return responses[Math.floor(Math.random() * responses.length)] || "";
}
```

## 😊 Expression of Emotional States

### Definition of Emotional States
```typescript
interface EmotionalState {
  battle_stress: number;    // 0-10: Battle stress
  confidence: number;       // 0-10: Confidence level
  team_morale: number;      // 0-10: Team morale
  curiosity: number;        // 0-10: Exploration motivation
  fatigue: number;         // 0-10: Fatigue level
}
```

### Dialogue Modulation Based on Emotional State

```typescript
function applyEmotionalTone(base_dialogue: string, emotional_state: EmotionalState): string {
  let modified = base_dialogue;

  // High stress modulation
  if (emotional_state.battle_stress > 7) {
    modified = modified.replace(/。$/, "！");  // Intensify tone
    modified = modified.replace(/だ$/, "だ！");
  }

  // Low confidence modulation
  if (emotional_state.confidence < 3) {
    modified = modified.replace(/！$/, "...");  // Express uncertainty
    modified = "Maybe..." + modified;
  }

  // High fatigue modulation
  if (emotional_state.fatigue > 8) {
    modified = "Sigh..." + modified;  // Express tiredness
    modified = modified.replace(/だ$/, "だけど...");
  }

  return modified;
}
```

### Team Communication

#### During Suggestions and Consultations
```typescript
function getConsultationDialogue(
  suggestion: string,
  target_relationship: Relationship,
  personality: PersonalityEvolution
): string {
  const style = getDialogueStyle(target_relationship);

  if (personality.leadership > 6 && style.directness > 5) {
    return `Let's go with ${suggestion}`;
  } else if (style.formality > 6) {
    return `What do you think about ${suggestion}?`;
  } else if (target_relationship.respect > 7) {
    return `I'd like to hear your opinion, but what about ${suggestion}?`;
  } else {
    return `${suggestion} is also an option`;
  }
}
```

#### During Agreement and Disagreement
```typescript
function getResponseDialogue(
  agreement: boolean,
  target_relationship: Relationship,
  personality: PersonalityEvolution
): string {
  const respect_level = target_relationship.respect;
  const trust_level = target_relationship.trust;

  if (agreement) {
    if (respect_level > 7) {
      return "As expected, you're absolutely right";
    } else if (trust_level > 5) {
      return "I agree, let's try it";
    } else {
      return "I agree";
    }
  } else {
    if (respect_level > 7) {
      return "I'm sorry, but I'd like to consider another plan";
    } else if (personality.wisdom > 6) {
      return "This might need some consideration";
    } else {
      return "Something feels different";
    }
  }
}
```

## 🎭 Dialogue Implementation Flow

### Real-time Dialogue Generation
1. **Situation Analysis**: Understand current combat/exploration situation
2. **Relationship Check**: Confirm relationship level with target character
3. **Personality Trait Application**: Select basic dialogue pattern based on personality
4. **Emotional State Reflection**: Modulate dialogue based on current emotional state
5. **Relationship Adjustment**: Adjust politeness and friendliness according to relationship with the other party
6. **Final Output**: Generate dialogue as natural Japanese

This system enables each character to engage in vivid dialogue appropriate to the situation, relationships, and personality, bringing depth and realism to the story.