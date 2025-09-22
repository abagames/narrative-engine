import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';
import { appendPlaylog } from '../src/append_playlog.js';

describe('append_playlog.ts', () => {
  const testSessionId = 'session_20250917_143022';
  const testSessionsDir = './test_autonomous_sessions';
  const sessionDir = path.join(testSessionsDir, 'sessions', testSessionId);
  const workspaceDir = path.join(testSessionsDir, 'ai_workspace');

  beforeEach(async () => {
    // Setup test environment
    await fs.mkdir(sessionDir, { recursive: true });
    await fs.mkdir(path.join(workspaceDir, 'decision_responses'), { recursive: true });
    await fs.mkdir(path.join(workspaceDir, 'world_snapshots'), { recursive: true });

    // Create test world states
    const previousWorldState = createTestWorldState();
    const currentWorldState = {
      ...previousWorldState,
      parties: {
        ...previousWorldState.parties,
        fire_forge_guild: {
          ...previousWorldState.parties.fire_forge_guild,
          resources: {
            currency: 70, // Changed from 120
            materials: { ore: 20 } // Changed from ore: 5
          }
        }
      },
      turn: 2
    };

    await fs.writeFile(path.join(sessionDir, 'world_current.json'), JSON.stringify(currentWorldState));

    // Create initial playlog with existing entries
    const existingEntry = {
      step: 14,
      type: 'explore',
      participants: ['other_party'],
      actor: 'other_party'
    };
    await fs.writeFile(path.join(sessionDir, 'playlog.jsonl'), JSON.stringify(existingEntry) + '\n');
  });

  afterEach(async () => {
    try {
      await fs.rm(testSessionsDir, { recursive: true, force: true });
    } catch (error) {
      // Directory doesn't exist, which is fine
    }
  });

  describe('AIナラティブ読み込み', () => {
    it('turn_playlog.jsonを正しく読み込む', async () => {
      const turnPlaylog = createTestTurnPlaylog();
      const turnPlaylogPath = path.join(workspaceDir, 'turn_playlog.json');
      await fs.writeFile(turnPlaylogPath, JSON.stringify(turnPlaylog));

      // Create corresponding decision response
      const decisionResponse = createTestDecisionResponse();
      await fs.writeFile(
        path.join(workspaceDir, 'decision_responses', 'request_trade_001.json'),
        JSON.stringify(decisionResponse)
      );

      const result = await appendPlaylog(testSessionId, 'turn_playlog.json');

      expect(result.success).toBe(true);
      expect(result.entriesAdded).toBe(1);
    });

    it('存在しないturn_playlog.jsonの場合はエラー', async () => {
      await expect(
        appendPlaylog(testSessionId, 'nonexistent_playlog.json')
      ).rejects.toThrow('turn_playlog.json not found');
    });

    it('無効なJSON構文の場合はエラー', async () => {
      const invalidPath = path.join(workspaceDir, 'invalid_playlog.json');
      await fs.writeFile(invalidPath, '{ invalid json }');

      await expect(
        appendPlaylog(testSessionId, 'invalid_playlog.json')
      ).rejects.toThrow('Invalid JSON');
    });
  });

  describe('決定応答ファイル復元', () => {
    it('対応する決定応答ファイルからmeta.frameworkEvaluationを復元', async () => {
      const turnPlaylog = createTestTurnPlaylog();
      const decisionResponse = createTestDecisionResponse();

      await fs.writeFile(
        path.join(workspaceDir, 'turn_playlog.json'),
        JSON.stringify(turnPlaylog)
      );
      await fs.writeFile(
        path.join(workspaceDir, 'decision_responses', 'request_trade_001.json'),
        JSON.stringify(decisionResponse)
      );

      await appendPlaylog(testSessionId, 'turn_playlog.json');

      const playlogContent = await fs.readFile(path.join(sessionDir, 'playlog.jsonl'), 'utf-8');
      const entries = playlogContent.trim().split('\n').filter(line => line);
      const newEntry = JSON.parse(entries[entries.length - 1]);

      expect(newEntry.meta.frameworkEvaluation).toMatchObject({
        economic: expect.objectContaining({
          score: expect.any(Number),
          reasoning: expect.any(String)
        }),
        strategic: expect.objectContaining({
          score: expect.any(Number),
          reasoning: expect.any(String)
        }),
        risk: expect.objectContaining({
          score: expect.any(Number),
          reasoning: expect.any(String)
        })
      });
    });

    it('決定応答ファイルが存在しない場合はエラー', async () => {
      const turnPlaylog = createTestTurnPlaylog();
      await fs.writeFile(
        path.join(workspaceDir, 'turn_playlog.json'),
        JSON.stringify(turnPlaylog)
      );

      // No corresponding decision response file

      await expect(
        appendPlaylog(testSessionId, 'turn_playlog.json')
      ).rejects.toThrow('Decision response file not found');
    });
  });

  describe('世界状態差分計算', () => {
    it('世界状態の変更を正しく差分計算', async () => {
      const turnPlaylog = createTestTurnPlaylog();
      const decisionResponse = createTestDecisionResponse();

      await fs.writeFile(
        path.join(workspaceDir, 'turn_playlog.json'),
        JSON.stringify(turnPlaylog)
      );
      await fs.writeFile(
        path.join(workspaceDir, 'decision_responses', 'request_trade_001.json'),
        JSON.stringify(decisionResponse)
      );

      // Create previous world state for comparison
      const previousWorldState = createTestWorldState();
      await fs.writeFile(
        path.join(sessionDir, 'world_prev.json'),
        JSON.stringify(previousWorldState)
      );

      // Create modified current world state
      const currentWorldState = {
        ...previousWorldState,
        parties: {
          ...previousWorldState.parties,
          fire_forge_guild: {
            ...previousWorldState.parties.fire_forge_guild,
            resources: {
              currency: 70, // Changed from 120
              materials: { ore: 20 } // Changed from ore: 5
            }
          }
        },
        turn: 2
      };
      await fs.writeFile(
        path.join(sessionDir, 'world_current.json'),
        JSON.stringify(currentWorldState)
      );

      await appendPlaylog(testSessionId, 'turn_playlog.json');

      const playlogContent = await fs.readFile(path.join(sessionDir, 'playlog.jsonl'), 'utf-8');
      const entries = playlogContent.trim().split('\n').filter(line => line);
      const newEntry = JSON.parse(entries[entries.length - 1]);

      expect(newEntry.worldStateDiff).toMatchObject({
        parties: {
          fire_forge_guild: {
            resources: {
              currency: { from: 120, to: 70 },
              materials: { ore: { from: 5, to: 20 } }
            }
          }
        }
      });
    });

    it('変更がない場合は空の差分を生成', async () => {
      // Create identical previous and current world states
      const worldState = createTestWorldState();
      await fs.writeFile(path.join(sessionDir, 'world_current.json'), JSON.stringify(worldState));
      await fs.writeFile(
        path.join(workspaceDir, 'world_snapshots', 'world_turn_01.json'),
        JSON.stringify(worldState)
      );

      const turnPlaylog = createTestTurnPlaylog();
      const decisionResponse = createTestDecisionResponse();

      await fs.writeFile(
        path.join(workspaceDir, 'turn_playlog.json'),
        JSON.stringify(turnPlaylog)
      );
      await fs.writeFile(
        path.join(workspaceDir, 'decision_responses', 'request_trade_001.json'),
        JSON.stringify(decisionResponse)
      );

      await appendPlaylog(testSessionId, 'turn_playlog.json');

      const playlogContent = await fs.readFile(path.join(sessionDir, 'playlog.jsonl'), 'utf-8');
      const entries = playlogContent.trim().split('\n').filter(line => line);
      const newEntry = JSON.parse(entries[entries.length - 1]);

      expect(newEntry.worldStateDiff).toEqual({});
    });
  });

  describe('プレイログエントリ構築', () => {
    it('完全なプレイログエントリを正しく構築', async () => {
      const turnPlaylog = createTestTurnPlaylog();
      const decisionResponse = createTestDecisionResponse();

      await fs.writeFile(
        path.join(workspaceDir, 'turn_playlog.json'),
        JSON.stringify(turnPlaylog)
      );
      await fs.writeFile(
        path.join(workspaceDir, 'decision_responses', 'request_trade_001.json'),
        JSON.stringify(decisionResponse)
      );

      await appendPlaylog(testSessionId, 'turn_playlog.json');

      const playlogContent = await fs.readFile(path.join(sessionDir, 'playlog.jsonl'), 'utf-8');
      const entries = playlogContent.trim().split('\n').filter(line => line);
      const newEntry = JSON.parse(entries[entries.length - 1]);

      expect(newEntry).toMatchObject({
        step: 15, // Previous step was 14
        type: 'market_trade',
        participants: ['fire_forge_guild'],
        actor: 'fire_forge_guild',
        effects: [
          {
            target: '/parties/fire_forge_guild/resources/currency',
            operation: 'add',
            value: -50
          },
          {
            target: '/parties/fire_forge_guild/resources/materials/ore',
            operation: 'add',
            value: 15
          }
        ],
        meta: {
          frameworkEvaluation: expect.any(Object)
        },
        narrative: expect.objectContaining({
          basicDescription: expect.any(String),
          internalPerspective: expect.any(Object),
          externalInteraction: expect.any(Object),
          outcomeReaction: expect.any(Object),
          environmentalContext: expect.any(Object)
        }),
        worldStateDiff: expect.any(Object),
        worldStateSnapshot: './world_current.json'
      });
    });

    it('step番号を正しく自動計算', async () => {
      // Add multiple existing entries
      const existingEntries = [
        { step: 14, type: 'explore' },
        { step: 15, type: 'trade' },
        { step: 16, type: 'move' }
      ];

      const playlogContent = existingEntries.map(entry => JSON.stringify(entry)).join('\n') + '\n';
      await fs.writeFile(path.join(sessionDir, 'playlog.jsonl'), playlogContent);

      const turnPlaylog = createTestTurnPlaylog();
      const decisionResponse = createTestDecisionResponse();

      await fs.writeFile(
        path.join(workspaceDir, 'turn_playlog.json'),
        JSON.stringify(turnPlaylog)
      );
      await fs.writeFile(
        path.join(workspaceDir, 'decision_responses', 'request_trade_001.json'),
        JSON.stringify(decisionResponse)
      );

      await appendPlaylog(testSessionId, 'turn_playlog.json');

      const updatedContent = await fs.readFile(path.join(sessionDir, 'playlog.jsonl'), 'utf-8');
      const entries = updatedContent.trim().split('\n').filter(line => line);
      const newEntry = JSON.parse(entries[entries.length - 1]);

      expect(newEntry.step).toBe(17); // 16 + 1
    });
  });

  describe('JSONL追記機能', () => {
    it('既存のplaylog.jsonlに正しく追記', async () => {
      const turnPlaylog = createTestTurnPlaylog();
      const decisionResponse = createTestDecisionResponse();

      await fs.writeFile(
        path.join(workspaceDir, 'turn_playlog.json'),
        JSON.stringify(turnPlaylog)
      );
      await fs.writeFile(
        path.join(workspaceDir, 'decision_responses', 'request_trade_001.json'),
        JSON.stringify(decisionResponse)
      );

      const initialContent = await fs.readFile(path.join(sessionDir, 'playlog.jsonl'), 'utf-8');
      const initialLines = initialContent.trim().split('\n').filter(line => line);

      await appendPlaylog(testSessionId, 'turn_playlog.json');

      const finalContent = await fs.readFile(path.join(sessionDir, 'playlog.jsonl'), 'utf-8');
      const finalLines = finalContent.trim().split('\n').filter(line => line);

      expect(finalLines.length).toBe(initialLines.length + 1);

      // Verify original content is preserved
      for (let i = 0; i < initialLines.length; i++) {
        expect(finalLines[i]).toBe(initialLines[i]);
      }
    });

    it('空のplaylog.jsonlに最初のエントリを追記', async () => {
      await fs.writeFile(path.join(sessionDir, 'playlog.jsonl'), '');

      const turnPlaylog = createTestTurnPlaylog();
      const decisionResponse = createTestDecisionResponse();

      await fs.writeFile(
        path.join(workspaceDir, 'turn_playlog.json'),
        JSON.stringify(turnPlaylog)
      );
      await fs.writeFile(
        path.join(workspaceDir, 'decision_responses', 'request_trade_001.json'),
        JSON.stringify(decisionResponse)
      );

      await appendPlaylog(testSessionId, 'turn_playlog.json');

      const content = await fs.readFile(path.join(sessionDir, 'playlog.jsonl'), 'utf-8');
      const lines = content.trim().split('\n').filter(line => line);

      expect(lines.length).toBe(1);

      const entry = JSON.parse(lines[0]);
      expect(entry.step).toBe(1);
    });
  });

  describe('エラーハンドリング', () => {
    it('世界状態ファイルが存在しない場合はエラー', async () => {
      await fs.unlink(path.join(sessionDir, 'world_current.json'));

      const turnPlaylog = createTestTurnPlaylog();
      await fs.writeFile(
        path.join(workspaceDir, 'turn_playlog.json'),
        JSON.stringify(turnPlaylog)
      );

      // Create a decision response file so it gets past that check
      const decisionResponse = createTestDecisionResponse();
      await fs.writeFile(
        path.join(workspaceDir, 'decision_responses', 'request_trade_001.json'),
        JSON.stringify(decisionResponse)
      );

      await expect(
        appendPlaylog(testSessionId, 'turn_playlog.json')
      ).rejects.toThrow('world_current.json not found');
    });

    it('playlog.jsonlが破損している場合の処理', async () => {
      await fs.writeFile(path.join(sessionDir, 'playlog.jsonl'), '{ invalid json }\n');

      const turnPlaylog = createTestTurnPlaylog();
      const decisionResponse = createTestDecisionResponse();

      await fs.writeFile(
        path.join(workspaceDir, 'turn_playlog.json'),
        JSON.stringify(turnPlaylog)
      );
      await fs.writeFile(
        path.join(workspaceDir, 'decision_responses', 'request_trade_001.json'),
        JSON.stringify(decisionResponse)
      );

      await expect(
        appendPlaylog(testSessionId, 'turn_playlog.json')
      ).rejects.toThrow('Corrupted playlog.jsonl');
    });
  });
});

// Helper functions
function createTestWorldState() {
  return {
    parties: {
      fire_forge_guild: {
        id: 'fire_forge_guild',
        name: '火の鍛冶ギルド',
        location: 'region1',
        resources: {
          currency: 120,
          materials: { ore: 5 }
        },
        capabilities: { exploration: 6, trade: 8, combat: 7, diplomacy: 5, crafting: 9 },
        morale: 8
      }
    },
    regions: {
      region1: {
        id: 'region1',
        name: 'Market Square',
        type: 'settlement',
        capacity: 20,
        neighbors: [],
        occupantParties: ['fire_forge_guild'],
        resources: ['ore', 'wood'],
        specialEffects: [],
        influence: {}
      }
    },
    market: {
      currentPrices: { ore: 3.33, wood: 10 },
      priceHistory: [],
      completedTrades: []
    },
    relationships: {},
    turn: 1,
    worldAge: 1,
    narrativeContext: {}
  };
}

function createTestTurnPlaylog() {
  return {
    narrative: {
      basicDescription: "火の鍛冶ギルドが市場で鉱石15単位を通貨50で購入",
      internalPerspective: {
        situationObservation: "市場で鉱石価格が上昇傾向、在庫確保の好機を発見",
        internalDeliberation: "ファイターは即決を提案、ウィザードは価格分析と将来予測を重視して賛成",
        actionMotivation: "鍛冶ギルドの中核能力である金属加工のため高品質鉱石が必要",
        expectedOutcome: "次期鍛冶作業で高品質装備を製作し、競争優位性を確保"
      },
      externalInteraction: {
        approachStrategy: "信頼できる品質重視の鍛冶ギルドとしての評判を活用",
        communicationSummary: [
          "市場価格の動向を確認",
          "品質保証された鉱石を要求",
          "迅速決済で良好な関係維持"
        ],
        perceivedResponse: "市場参加者は鍛冶ギルドの専門性を認識し、品質重視の取引に応じる意向",
        relationshipAssessment: "市場との継続的信頼関係が維持され、今後の優先取引が期待できる状況"
      },
      outcomeReaction: {
        immediateEmotionalResponse: "良質な鉱石確保への満足感と次の作業への期待",
        strategicImplication: "鍛冶能力の活用機会増加、他パーティへの装備供給可能性",
        futureDirectionAdjustment: "鉱石の定期調達と鍛冶製品の販売戦略検討",
        teamMoraleImpact: "専門性を活かした成功により、ギルドメンバーの自信と結束が向上"
      },
      environmentalContext: {
        settingDescription: "活気ある市場広場、各種資源が取引される商業の中心地",
        otherPartiesObservation: "他の探索パーティーも資源調達活動を活発化させている兆候",
        worldStateAwareness: "全体的な探索・開発活動の増加により資源需要が高まっている状況"
      }
    }
  };
}

function createTestDecisionResponse() {
  return {
    requestId: 'request_trade_001',
    timestamp: '2025-09-17T14:30:25Z',
    status: 'completed',
    proposal: {
      type: 'market_trade',
      participants: ['fire_forge_guild'],
      effects: [
        {
          target: '/parties/fire_forge_guild/resources/currency',
          operation: 'add',
          value: -50
        },
        {
          target: '/parties/fire_forge_guild/resources/materials/ore',
          operation: 'add',
          value: 15
        }
      ]
    },
    meta: {
      llmDecision: {
        frameworkEvaluation: {
          economic: { score: 8, reasoning: "Essential for core crafting capability" },
          strategic: { score: 9, reasoning: "Aligned with long-term goals" },
          risk: { score: 6, reasoning: "Manageable risk level" }
        },
        optionsConsidered: [
          {
            action: "market_trade",
            score: 8,
            pros: ["aligned with goals", "feasible execution"],
            cons: ["resource cost", "opportunity cost"]
          }
        ],
        selectedAction: {
          type: "market_trade",
          reasoning: "Best available option based on framework evaluation"
        },
        reasoning: "Essential for core crafting capability with good market price"
      }
    }
  };
}