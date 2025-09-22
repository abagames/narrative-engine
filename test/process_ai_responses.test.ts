import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';
import { processAiResponses } from '../src/process_ai_responses.js';

// Set environment variable for testing
process.env.AUTONOMOUS_SESSIONS_DIR = './test_autonomous_sessions';

describe('process_ai_responses.ts', () => {
  const testSessionId = 'session_20250917_143022';
  const testSessionsDir = './test_autonomous_sessions';
  const sessionDir = path.join(testSessionsDir, 'sessions', testSessionId);
  const workspaceDir = path.join(testSessionsDir, 'ai_workspace');

  beforeEach(async () => {
    // Setup test environment
    await fs.mkdir(sessionDir, { recursive: true });
    await fs.mkdir(path.join(workspaceDir, 'decision_requests'), { recursive: true });
    await fs.mkdir(path.join(workspaceDir, 'decision_responses'), { recursive: true });
    await fs.mkdir(path.join(workspaceDir, 'world_snapshots'), { recursive: true });

    // Create test world state
    const worldState = createTestWorldState();
    await fs.writeFile(path.join(sessionDir, 'world_current.json'), JSON.stringify(worldState));
    await fs.writeFile(path.join(sessionDir, 'playlog.jsonl'), '');
  });

  afterEach(async () => {
    try {
      await fs.rm(testSessionsDir, { recursive: true, force: true });
    } catch (error) {
      // Directory doesn't exist, which is fine
    }
  });

  describe('決定応答ファイル読み込み', () => {
    it('decision_responses内の全JSONファイルを正しく読み込む', async () => {
      // Create test decision response files
      const response1 = createValidDecisionResponse('request_GM_143023');
      const response2 = createValidDecisionResponse('request_emerald_hunters_143024');

      await fs.writeFile(
        path.join(workspaceDir, 'decision_responses', 'request_GM_143023.json'),
        JSON.stringify(response1)
      );
      await fs.writeFile(
        path.join(workspaceDir, 'decision_responses', 'request_emerald_hunters_143024.json'),
        JSON.stringify(response2)
      );

      const result = await processAiResponses(testSessionId);

      expect(result.processedDecisions).toBe(2);
      expect(result.errors).toHaveLength(0);
    });

    it('JSONファイルが存在しない場合は空結果を返す', async () => {
      const result = await processAiResponses(testSessionId);

      expect(result.processedDecisions).toBe(0);
      expect(result.actionsExecuted).toBe(0);
      expect(result.nextStatus).toBe('turn_completed');
    });

    it('無効なJSON構文の場合はエラーを記録', async () => {
      await fs.writeFile(
        path.join(workspaceDir, 'decision_responses', 'invalid.json'),
        '{ invalid json }'
      );

      const result = await processAiResponses(testSessionId);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].error).toContain('JSON');
      expect(result.nextStatus).toBe('error');
    });
  });

  describe('JSONスキーマ検証', () => {
    it('有効な決定応答スキーマを通す', async () => {
      const response = createValidDecisionResponse('request_test_001');
      await fs.writeFile(
        path.join(workspaceDir, 'decision_responses', 'request_test_001.json'),
        JSON.stringify(response)
      );

      const result = await processAiResponses(testSessionId);

      expect(result.errors).toHaveLength(0);
      expect(result.actionsExecuted).toBe(1);
    });

    it('必須フィールドが不足している場合はエラー', async () => {
      const invalidResponse = {
        requestId: 'request_test_002',
        timestamp: new Date().toISOString(),
        // status missing
        proposal: {
          type: 'market_trade',
          participants: ['emerald_hunters'],
          effects: []
        }
      };

      await fs.writeFile(
        path.join(workspaceDir, 'decision_responses', 'request_test_002.json'),
        JSON.stringify(invalidResponse)
      );

      const result = await processAiResponses(testSessionId);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].error).toContain('Missing required field: status');
    });

    it('無効なeffects構造の場合はエラー', async () => {
      const response = createValidDecisionResponse('request_test_003');
      response.proposal.effects = [
        {
          target: 'parties/emerald_hunters/resources/currency',
          // operation missing - this should cause an error
          value: -50
        } as any
      ];

      await fs.writeFile(
        path.join(workspaceDir, 'decision_responses', 'request_test_003.json'),
        JSON.stringify(response)
      );

      const result = await processAiResponses(testSessionId);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].error).toContain('operation');
    });
  });

  describe('アクション実行', () => {
    it('有効なmarket_tradeアクションを正しく実行', async () => {
      const response = createMarketTradeResponse('request_trade_001', 'emerald_hunters', -50, 15);
      await fs.writeFile(
        path.join(workspaceDir, 'decision_responses', 'request_trade_001.json'),
        JSON.stringify(response)
      );

      const result = await processAiResponses(testSessionId);

      expect(result.actionsExecuted).toBe(1);
      expect(result.errors).toHaveLength(0);

      // Check world state was updated
      const updatedWorld = JSON.parse(
        await fs.readFile(path.join(sessionDir, 'world_current.json'), 'utf-8')
      );
      expect(updatedWorld.parties.emerald_hunters.resources.currency).toBe(50); // 100 - 50
    });

    it('currency不足の場合はエラーを記録', async () => {
      const response = createMarketTradeResponse('request_trade_002', 'emerald_hunters', -150, 15);
      await fs.writeFile(
        path.join(workspaceDir, 'decision_responses', 'request_trade_002.json'),
        JSON.stringify(response)
      );

      const result = await processAiResponses(testSessionId);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].error).toContain('insufficient currency');
      expect(result.errors[0].details).toMatchObject({
        required: 150,
        available: 100
      });
    });

    it('無効なパーティーIDの場合はエラーを記録', async () => {
      const response = createMarketTradeResponse('request_trade_003', 'nonexistent_party', -50, 15);
      await fs.writeFile(
        path.join(workspaceDir, 'decision_responses', 'request_trade_003.json'),
        JSON.stringify(response)
      );

      const result = await processAiResponses(testSessionId);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].error).toContain('Party not found');
    });
  });


  describe('ファイルクリーンアップ', () => {
    // Note: File cleanup is disabled in process_ai_responses.ts to preserve files for append_playlog.ts
    it('成功した決定ファイルは保持される（append_playlog.ts用）', async () => {
      const requestId = 'request_cleanup_001';
      const response = createValidDecisionResponse(requestId);

      // Create both request and response files
      await fs.writeFile(
        path.join(workspaceDir, 'decision_requests', `${requestId}.json`),
        JSON.stringify({ requestId, timestamp: new Date().toISOString() })
      );
      await fs.writeFile(
        path.join(workspaceDir, 'decision_responses', `${requestId}.json`),
        JSON.stringify(response)
      );

      await processAiResponses(testSessionId);

      // Check files were NOT deleted (preserved for append_playlog.ts)
      await expect(
        fs.access(path.join(workspaceDir, 'decision_requests', `${requestId}.json`))
      ).resolves.toBeUndefined();
      await expect(
        fs.access(path.join(workspaceDir, 'decision_responses', `${requestId}.json`))
      ).resolves.toBeUndefined();
    });

    it('失敗した決定ファイルペアは保持', async () => {
      const requestId = 'request_cleanup_002';
      const invalidResponse = createMarketTradeResponse(requestId, 'emerald_hunters', -200, 15); // Invalid: insufficient currency

      await fs.writeFile(
        path.join(workspaceDir, 'decision_requests', `${requestId}.json`),
        JSON.stringify({ requestId, timestamp: new Date().toISOString() })
      );
      await fs.writeFile(
        path.join(workspaceDir, 'decision_responses', `${requestId}.json`),
        JSON.stringify(invalidResponse)
      );

      const result = await processAiResponses(testSessionId);

      expect(result.errors.length).toBeGreaterThan(0);

      // Check request file is preserved
      await expect(
        fs.access(path.join(workspaceDir, 'decision_requests', `${requestId}.json`))
      ).resolves.toBeUndefined();

      // Check response file was moved to failed directory
      await expect(
        fs.access(path.join(workspaceDir, 'decision_responses', 'failed', `${requestId}.json`))
      ).resolves.toBeUndefined();
    });
  });

  describe('nextStatus判定', () => {
    it('全て成功した場合はturn_completed', async () => {
      const response = createValidDecisionResponse('request_success_001');
      await fs.writeFile(
        path.join(workspaceDir, 'decision_responses', 'request_success_001.json'),
        JSON.stringify(response)
      );

      const result = await processAiResponses(testSessionId);

      expect(result.nextStatus).toBe('turn_completed');
      expect(result.errors).toHaveLength(0);
    });

    it('エラーがある場合はerror', async () => {
      const invalidResponse = createMarketTradeResponse('request_error_001', 'emerald_hunters', -200, 15);
      await fs.writeFile(
        path.join(workspaceDir, 'decision_responses', 'request_error_001.json'),
        JSON.stringify(invalidResponse)
      );

      const result = await processAiResponses(testSessionId);

      expect(result.nextStatus).toBe('error');
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('セッション終了条件を満たした場合はcompleted', async () => {
      // This would require implementing session completion logic
      // For now, this is a placeholder test
    });
  });

  describe('エラー処理制限', () => {
    it('リトライ制限を超過した場合の処理', async () => {
      // This would require implementing retry counting logic
      // For now, this is a placeholder test
    });

    it('デッドロック防止機能', async () => {
      // This would require implementing deadlock detection
      // For now, this is a placeholder test
    });
  });
});

// Helper functions
function createTestWorldState() {
  return {
    parties: {
      emerald_hunters: {
        id: 'emerald_hunters',
        name: 'Test Party',
        location: 'crystal_caves',
        resources: { currency: 100, materials: {wood: 5, gems: 3} },
        capabilities: { exploration: 8, trade: 4, combat: 6, diplomacy: 5, crafting: 3 },
        morale: 7
      }
    },
    regions: {
      crystal_caves: {
        id: 'crystal_caves',
        name: 'Test Region',
        type: 'forest',
        capacity: 10,
        neighbors: [],
        occupantParties: ['emerald_hunters'],
        resources: ['wood'],
        specialEffects: [],
        influence: {}
      }
    },
    market: {
      currentPrices: { wood: 10, stone: 15 },
      priceHistory: [],
      completedTrades: {}
    },
    relationships: {},
    turn: 1,
    worldAge: 1,
    narrativeContext: {}
  };
}

function createValidDecisionResponse(requestId: string) {
  return {
    requestId,
    timestamp: new Date().toISOString(),
    status: 'completed',
    proposal: {
      type: 'explore',
      participants: ['emerald_hunters'],
      effects: [
        {
          target: 'parties/emerald_hunters/morale',
          operation: 'add',
          value: 1
        }
      ]
    }
  };
}

function createMarketTradeResponse(requestId: string, partyId: string, currencyChange: number, materialsChange: number) {
  return {
    requestId,
    timestamp: new Date().toISOString(),
    status: 'completed',
    proposal: {
      type: 'market_trade',
      participants: [partyId],
      effects: [
        {
          target: `parties/${partyId}/resources/currency`,
          operation: 'add',
          value: currencyChange
        },
        {
          target: `parties/${partyId}/resources/materials/wood`,
          operation: 'add',
          value: materialsChange
        }
      ]
    }
  };
}