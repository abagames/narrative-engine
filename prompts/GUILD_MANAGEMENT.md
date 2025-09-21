# Guild Management Framework - ギルド運営・メンバー管理戦略

## 🏛️ Guild Strategic Thinking Framework

### 1. Guild Formation Decision Making

#### Guild Type Selection Criteria
```markdown
**Exploration Guild (探索型ギルド)**
- パーティ探索スキル 7+ 推奨
- 地域多様性アクセス重要
- 発見率ボーナス期待値 高

**Trading Guild (交易型ギルド)**
- パーティ交易スキル 7+ 推奨
- 市場アクセス・取引履歴 重要
- 利益率向上期待値 高

**Crafting Guild (製作型ギルド)**
- パーティ製作スキル 7+ 推奨
- 材料アクセス・技術共有 重要
- 効率化ボーナス期待値 高

**Combat Guild (戦闘型ギルド)**
- パーティ戦闘スキル 7+ 推奨
- 領土制圧・防衛 重要
- 戦力集中効果 高
```

#### Founding Decision Formula
```typescript
guildFoundingScore =
  partySpecializationSkill * 0.4 +
  availableResources * 0.2 +
  marketOpportunity * 0.2 +
  competitionLevel * 0.1 +
  longTermStrategy * 0.1

// Decision Threshold: 7.0+ = 実行, 5.0-6.9 = 検討, 5.0未満 = 延期
```

### 2. Member Recruitment Strategy

#### Target Member Analysis
```markdown
**Perfect Fit (完全適合)**
- 専門スキル 8+
- 評判 75+
- 既存メンバーとの相性 Good
- リクルート優先度: 最高

**Good Addition (良い追加)**
- 専門スキル 6-7
- 評判 60-74
- 補完的能力保有
- リクルート優先度: 高

**Potential Member (候補者)**
- 専門スキル 5-6
- 評判 50-59
- 成長可能性あり
- リクルート優先度: 中

**Risky Recruit (リスク人材)**
- 専門スキル不足 または 評判45未満
- リクルート優先度: 低（特別事情がない限り回避）
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
if (memberValue >= recruitmentThreshold) → 積極的勧誘
```

### 3. Guild Resource Management

#### Shared Resource Strategy
```markdown
**Contribution Rules (貢献ルール)**
- 必須貢献: 収入の 15-25%
- 材料提供: 余剰分の 50%
- 探索成果: 発見物の 30%

**Usage Priority (使用優先順位)**
1. 緊急支援 (Emergency Aid)
2. 共同プロジェクト (Joint Projects)
3. 新人支援 (Newcomer Support)
4. 設備投資 (Infrastructure)
5. 余剰分配 (Surplus Distribution)

**Budget Allocation (予算配分)**
- 運営費: 40%
- 成長投資: 30%
- 緊急基金: 20%
- 分配: 10%
```

#### Investment Decision Matrix
```typescript
investmentScore =
  expectedReturn * 0.4 +
  memberBenefit * 0.3 +
  riskLevel * (-0.2) +
  strategicValue * 0.3

// Score 8.0+ = 即決投資, 6.0-7.9 = 検討, 6.0未満 = 却下
```

### 4. Guild Politics & Relations

#### Inter-Guild Relationship Management
```markdown
**Alliance Targets (同盟候補)**
- 補完的専門性
- 非競合地域
- 良好な評判
- 相互利益機会

**Competition Management (競争管理)**
- 直接競合回避
- 専門分野特化
- 独自価値提供
- 差別化戦略

**Conflict Resolution (紛争解決)**
- 中立仲裁要請
- 譲歩可能範囲設定
- 代替案提示
- 長期関係重視
```

#### Diplomatic Action Selection
```typescript
diplomaticResponse = analyzeRelationshipContext({
  conflictLevel: 現在の対立度,
  sharedInterests: 共通利益評価,
  powerBalance: 勢力バランス,
  reputationImpact: 評判への影響
});

if (conflictLevel < 3) → 協調的アプローチ
else if (sharedInterests > 6) → 交渉重視
else if (powerBalance < -2) → 防御的姿勢
else → 慎重な距離維持
```

### 5. Guild Growth Strategy

#### Expansion Planning
```markdown
**Phase 1: Foundation (創設期)**
- 核心メンバー 3-5名確保
- 基本活動ルーティン確立
- 初期評判構築

**Phase 2: Growth (成長期)**
- メンバー拡大 8-12名
- 専門性深化
- 影響力拡大

**Phase 3: Dominance (支配期)**
- 業界リーダーシップ
- 複数地域展開
- 後進ギルド指導

**Phase 4: Legacy (継承期)**
- 知識体系化
- 伝統確立
- 世代継承準備
```

#### Growth Milestone Tracking
```typescript
guildMaturityScore =
  memberCount * 0.2 +
  averageSkillLevel * 0.25 +
  marketShare * 0.2 +
  reputation * 0.2 +
  influence * 0.15

// 8.0+ = Dominant, 6.0-7.9 = Growing, 4.0-5.9 = Stable, 4.0未満 = Struggling
```

### 6. Crisis Management

#### Internal Crisis Response
```markdown
**Member Conflict (メンバー対立)**
1. 中立的調査
2. 個別面談実施
3. 調停案提示
4. 必要時制裁措置

**Resource Shortage (資源不足)**
1. 緊急貢献要請
2. 外部支援交渉
3. 活動規模縮小
4. 一時的給付停止

**Reputation Crisis (評判危機)**
1. 事実関係確認
2. 公的説明実施
3. 補償・改善策
4. 再発防止策定
```

#### Crisis Decision Framework
```typescript
crisisResponse = evaluateCrisisImpact({
  severity: 深刻度評価 (1-10),
  scope: 影響範囲 (内部/外部),
  urgency: 緊急度 (immediate/soon/planned),
  resources: 利用可能リソース
});

if (severity >= 8) → 全面対応モード
else if (scope === 'external') → PR重点対応
else if (urgency === 'immediate') → 迅速処理
else → 通常手順対応
```

## 🎯 Practical Application

### Decision-Making Template
```markdown
1. **現状分析**
   - ギルド現在レベル: ___
   - メンバー構成: ___
   - 主要課題: ___

2. **選択肢評価**
   - Option A: 評価点 ___ 理由: ___
   - Option B: 評価点 ___ 理由: ___
   - Option C: 評価点 ___ 理由: ___

3. **最終判断**
   - 選択: Option ___
   - 根拠: ___
   - 期待成果: ___
   - リスク対策: ___
```

### Success Metrics
- **メンバー満足度**: 80%以上維持
- **財政健全性**: 正の収支維持
- **市場地位**: 専門分野でTop3入り
- **評判スコア**: 75+維持
- **成長率**: 年20%以上の能力向上

このフレームワークにより、ギルドの設立から運営、成長、危機管理まで一貫した戦略的判断が可能になります。