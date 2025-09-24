# Guild Management Framework - Guild Operations & Member Management Strategy

## 🏛️ Guild Strategic Thinking Framework

### 1. Guild Formation Decision Making

#### Guild Type Selection Criteria
```markdown
**Exploration Guild**
- Party exploration skill 7+ recommended
- Regional diversity access important
- High expected discovery rate bonus

**Trading Guild**
- Party trading skill 7+ recommended
- Market access and transaction history important
- High expected profit rate improvement

**Crafting Guild**
- Party crafting skill 7+ recommended
- Material access and technology sharing important
- High expected efficiency bonus

**Combat Guild**
- Party combat skill 7+ recommended
- Territory conquest and defense important
- High combat power concentration effect
```

#### Founding Decision Formula
```typescript
guildFoundingScore =
  partySpecializationSkill * 0.4 +
  availableResources * 0.2 +
  marketOpportunity * 0.2 +
  competitionLevel * 0.1 +
  longTermStrategy * 0.1

// Decision Threshold: 7.0+ = Execute, 5.0-6.9 = Consider, <5.0 = Postpone
```

### 2. Member Recruitment Strategy

#### Target Member Analysis
```markdown
**Perfect Fit**
- Specialized skill 8+
- Reputation 75+
- Good compatibility with existing members
- Recruitment priority: Highest

**Good Addition**
- Specialized skill 6-7
- Reputation 60-74
- Possesses complementary abilities
- Recruitment priority: High

**Potential Member**
- Specialized skill 5-6
- Reputation 50-59
- Growth potential present
- Recruitment priority: Medium

**Risky Recruit**
- Insufficient specialized skill OR reputation <45
- Recruitment priority: Low (avoid unless special circumstances)
```

#### Recruitment Decision Process
```typescript
memberValue =
  targetSkill * 0.35 +
  reputation * 0.25 +
  teamFit * 0.20 +
  growthPotential * 0.15 +
  resourceContribution * 0.05

recruitmentThreshold = currentGuildRank * 1.2;
if (memberValue >= recruitmentThreshold) → Active recruitment
```

### 3. Guild Resource Management

#### Shared Resource Strategy
```markdown
**Contribution Rules**
- Required contribution: 15-25% of income
- Material provision: 50% of surplus
- Exploration results: 30% of discoveries

**Usage Priority**
1. Emergency Aid
2. Joint Projects
3. Newcomer Support
4. Infrastructure
5. Surplus Distribution

**Budget Allocation**
- Operating expenses: 40%
- Growth investment: 30%
- Emergency fund: 20%
- Distribution: 10%
```

#### Investment Decision Matrix
```typescript
investmentScore =
  expectedReturn * 0.4 +
  memberBenefit * 0.3 +
  riskLevel * (-0.2) +
  strategicValue * 0.3

// Score 8.0+ = Immediate investment, 6.0-7.9 = Consider, <6.0 = Reject
```

### 4. Guild Politics & Relations

#### Inter-Guild Relationship Management
```markdown
**Alliance Targets**
- Complementary specialization
- Non-competing regions
- Good reputation
- Mutual benefit opportunities

**Competition Management**
- Avoid direct competition
- Specialize in expertise areas
- Provide unique value
- Differentiation strategy

**Conflict Resolution**
- Request neutral arbitration
- Set acceptable compromise range
- Present alternative solutions
- Prioritize long-term relationships
```

#### Diplomatic Action Selection
```typescript
diplomaticResponse = analyzeRelationshipContext({
  conflictLevel: current conflict level,
  sharedInterests: shared interest assessment,
  powerBalance: power balance,
  reputationImpact: impact on reputation
});

if (conflictLevel < 3) → Cooperative approach
else if (sharedInterests > 6) → Negotiation focus
else if (powerBalance < -2) → Defensive stance
else → Cautious distance maintenance
```

### 5. Guild Growth Strategy

#### Expansion Planning
```markdown
**Phase 1: Foundation**
- Secure 3-5 core members
- Establish basic activity routines
- Build initial reputation

**Phase 2: Growth**
- Expand membership to 8-12
- Deepen specialization
- Expand influence

**Phase 3: Dominance**
- Industry leadership
- Multi-region expansion
- Mentor junior guilds

**Phase 4: Legacy**
- Systematize knowledge
- Establish traditions
- Prepare generational succession
```

#### Growth Milestone Tracking
```typescript
guildMaturityScore =
  memberCount * 0.2 +
  averageSkillLevel * 0.25 +
  marketShare * 0.2 +
  reputation * 0.2 +
  influence * 0.15

// 8.0+ = Dominant, 6.0-7.9 = Growing, 4.0-5.9 = Stable, <4.0 = Struggling
```

### 6. Crisis Management

#### Internal Crisis Response
```markdown
**Member Conflict**
1. Neutral investigation
2. Conduct individual interviews
3. Present mediation proposal
4. Implement sanctions if necessary

**Resource Shortage**
1. Request emergency contributions
2. Negotiate external support
3. Reduce activity scale
4. Temporarily suspend disbursements

**Reputation Crisis**
1. Verify facts
2. Provide public explanation
3. Compensation and improvement measures
4. Establish recurrence prevention
```

#### Crisis Decision Framework
```typescript
crisisResponse = evaluateCrisisImpact({
  severity: severity assessment (1-10),
  scope: impact range (internal/external),
  urgency: urgency level (immediate/soon/planned),
  resources: available resources
});

if (severity >= 8) → Full response mode
else if (scope === 'external') → PR-focused response
else if (urgency === 'immediate') → Rapid processing
else → Standard procedure response
```

## 🎯 Practical Application

### Decision-Making Template
```markdown
1. **Current Situation Analysis**
   - Guild current level: ___
   - Member composition: ___
   - Major challenges: ___

2. **Option Evaluation**
   - Option A: Score ___ Reason: ___
   - Option B: Score ___ Reason: ___
   - Option C: Score ___ Reason: ___

3. **Final Decision**
   - Choice: Option ___
   - Rationale: ___
   - Expected results: ___
   - Risk countermeasures: ___
```

### Success Metrics
- **Member Satisfaction**: Maintain 80%+
- **Financial Health**: Maintain positive cash flow
- **Market Position**: Top 3 in specialized field
- **Reputation Score**: Maintain 75+
- **Growth Rate**: 20%+ annual capability improvement

This framework enables consistent strategic judgment from guild establishment through operations, growth, and crisis management.