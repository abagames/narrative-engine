import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';
import { startSession } from '../src/start_session.js';

describe('start_session.ts', () => {
  const testSessionsDir = './test_autonomous_sessions';
  const sessionsDir = path.join(testSessionsDir, 'sessions');
  const workspaceDir = path.join(testSessionsDir, 'ai_workspace');

  beforeEach(async () => {
    // Clean up any existing test directories
    try {
      await fs.rm(testSessionsDir, { recursive: true, force: true });
    } catch (error) {
      // Directory doesn't exist, which is fine
    }
  });

  afterEach(async () => {
    // Clean up test directories
    try {
      await fs.rm(testSessionsDir, { recursive: true, force: true });
    } catch (error) {
      // Directory doesn't exist, which is fine
    }
  });

  describe('入力検証', () => {
    it('world_initial.json が存在しない場合はエラー', async () => {
      await expect(
        startSession('nonexistent_world.json', 'session_config.json')
      ).rejects.toThrow('world_initial.json not found');
    });

    it('session_config.json が存在しない場合はエラー', async () => {
      // Create minimal world_initial.json
      await fs.writeFile('world_initial.json', JSON.stringify({
        parties: {},
        regions: {},
        market: { currentPrices: {}, priceHistory: [], completedTrades: [] },
        relationships: {},
        turn: 1,
        worldAge: 1,
        narrativeContext: {}
      }));

      await expect(
        startSession('world_initial.json', 'nonexistent_config.json')
      ).rejects.toThrow('session_config.json not found');

      await fs.unlink('world_initial.json');
    });

    it('無効なJSON構文の場合はエラー', async () => {
      await fs.writeFile('invalid_world.json', '{ invalid json }');
      await fs.writeFile('valid_config.json', JSON.stringify({
        sessionName: "Test Session",
        maxTurns: 10,
        stopConditions: {}
      }));

      await expect(
        startSession('invalid_world.json', 'valid_config.json')
      ).rejects.toThrow('Invalid JSON');

      await fs.unlink('invalid_world.json');
      await fs.unlink('valid_config.json');
    });

    it('必須フィールドが不足している場合はエラー', async () => {
      await fs.writeFile('incomplete_world.json', JSON.stringify({
        parties: {},
        // regions missing
        market: {}
      }));
      await fs.writeFile('valid_config.json', JSON.stringify({
        sessionName: "Test Session",
        maxTurns: 10,
        stopConditions: {}
      }));

      await expect(
        startSession('incomplete_world.json', 'valid_config.json')
      ).rejects.toThrow('Missing required field: regions');

      await fs.unlink('incomplete_world.json');
      await fs.unlink('valid_config.json');
    });
  });

  describe('ディレクトリ構造作成', () => {
    it('セッションディレクトリが正しく作成される', async () => {
      const worldData = createValidWorldData();
      const configData = createValidConfigData();

      await fs.writeFile('world_test.json', JSON.stringify(worldData));
      await fs.writeFile('config_test.json', JSON.stringify(configData));

      const result = await startSession('world_test.json', 'config_test.json');

      // Check session directory exists
      const sessionPath = path.join(testSessionsDir, 'sessions', result.sessionId);
      const sessionStats = await fs.stat(sessionPath);
      expect(sessionStats.isDirectory()).toBe(true);

      // Check required files exist
      await expect(fs.access(path.join(sessionPath, 'world_initial.json'))).resolves.toBeUndefined();
      await expect(fs.access(path.join(sessionPath, 'world_current.json'))).resolves.toBeUndefined();
      await expect(fs.access(path.join(sessionPath, 'metadata.json'))).resolves.toBeUndefined();
      await expect(fs.access(path.join(sessionPath, 'playlog.jsonl'))).resolves.toBeUndefined();

      await fs.unlink('world_test.json');
      await fs.unlink('config_test.json');
    });

    it('AI作業領域ディレクトリが正しく作成される', async () => {
      const worldData = createValidWorldData();
      const configData = createValidConfigData();

      await fs.writeFile('world_test.json', JSON.stringify(worldData));
      await fs.writeFile('config_test.json', JSON.stringify(configData));

      await startSession('world_test.json', 'config_test.json');

      // Check workspace directories exist
      const testWorkspaceDir = path.join(testSessionsDir, 'ai_workspace');
      await expect(fs.access(path.join(testWorkspaceDir, 'decision_requests'))).resolves.toBeUndefined();
      await expect(fs.access(path.join(testWorkspaceDir, 'decision_responses'))).resolves.toBeUndefined();
      await expect(fs.access(path.join(testWorkspaceDir, 'world_snapshots'))).resolves.toBeUndefined();

      await fs.unlink('world_test.json');
      await fs.unlink('config_test.json');
    });
  });

  describe('決定要求ファイル生成', () => {
    it('GM用決定要求ファイルが正しく生成される', async () => {
      const worldData = createValidWorldData();
      const configData = createValidConfigData();

      await fs.writeFile('world_test.json', JSON.stringify(worldData));
      await fs.writeFile('config_test.json', JSON.stringify(configData));

      const result = await startSession('world_test.json', 'config_test.json');

      const gmRequestFile = result.firstTurnRequests.find(f => f.includes('GM'));
      expect(gmRequestFile).toBeDefined();

      const testWorkspaceDir = path.join(testSessionsDir, 'ai_workspace');
      const gmRequestPath = path.join(testWorkspaceDir, 'decision_requests', gmRequestFile!);
      const gmRequestData = JSON.parse(await fs.readFile(gmRequestPath, 'utf-8'));

      expect(gmRequestData).toMatchObject({
        requestId: expect.stringMatching(/^request_GM_\d+$/),
        timestamp: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
        sessionId: result.sessionId,
        worldStateFile: expect.stringContaining('world_current.json'),
        framework: {
          role: 'GM'
        },
        contextData: {
          marketData: expect.any(Object),
          worldSummary: expect.any(Object),
          availableActions: expect.any(Array),
          recentHistory: expect.any(Array)
        },
        instructions: expect.stringContaining('適切なフレームワークを適用')
      });

      await fs.unlink('world_test.json');
      await fs.unlink('config_test.json');
    });

    it('各パーティー用決定要求ファイルが正しく生成される', async () => {
      const worldData = createValidWorldDataWithParties();
      const configData = createValidConfigData();

      await fs.writeFile('world_test.json', JSON.stringify(worldData));
      await fs.writeFile('config_test.json', JSON.stringify(configData));

      const result = await startSession('world_test.json', 'config_test.json');

      const partyRequestFiles = result.firstTurnRequests.filter(f => f.includes('party'));
      expect(partyRequestFiles.length).toBe(2); // Assuming 2 parties in test data

      for (const requestFile of partyRequestFiles) {
        const testWorkspaceDir = path.join(testSessionsDir, 'ai_workspace');
        const requestPath = path.join(testWorkspaceDir, 'decision_requests', requestFile);
        const requestData = JSON.parse(await fs.readFile(requestPath, 'utf-8'));

        expect(requestData).toMatchObject({
          requestId: expect.stringMatching(/^request_party\w+_\d+$/),
          timestamp: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
          sessionId: result.sessionId,
          worldStateFile: expect.stringContaining('world_current.json'),
          framework: {
            role: 'Player',
            actorId: expect.any(String)
          },
          contextData: {
            partyState: expect.any(Object),
            visibleRegions: expect.any(Array),
            marketData: expect.any(Object),
            availableActions: expect.any(Array),
            recentHistory: expect.any(Array)
          },
          instructions: expect.stringContaining('適切なフレームワークを適用')
        });
      }

      await fs.unlink('world_test.json');
      await fs.unlink('config_test.json');
    });
  });

  describe('出力形式', () => {
    it('session_result.jsonが正しい形式で出力される', async () => {
      const worldData = createValidWorldDataWithParties();
      const configData = createValidConfigData();

      await fs.writeFile('world_test.json', JSON.stringify(worldData));
      await fs.writeFile('config_test.json', JSON.stringify(configData));

      const result = await startSession('world_test.json', 'config_test.json');

      expect(result).toMatchObject({
        sessionId: expect.stringMatching(/^session_\d{8}_\d{6}$/),
        status: 'ready',
        firstTurnRequests: expect.arrayContaining([
          expect.stringMatching(/^request_GM_\d+\.json$/),
          expect.stringMatching(/^request_party\w+_\d+\.json$/)
        ]),
        workspaceDir: expect.stringContaining('ai_workspace')
      });

      await fs.unlink('world_test.json');
      await fs.unlink('config_test.json');
    });
  });

  describe('エラーハンドリング', () => {
    it('ディスク容量不足エラーを適切に処理', async () => {
      // This would require mocking filesystem operations
      // Implementation depends on how disk space checking is implemented
    });

    it('権限エラーを適切に処理', async () => {
      // This would require mocking filesystem permissions
      // Implementation depends on how permission checking is implemented
    });
  });
});

// Helper functions
function createValidWorldData() {
  return {
    parties: {},
    regions: {
      "region1": {
        id: "region1",
        name: "Test Region",
        type: "forest",
        capacity: 10,
        neighbors: [],
        occupantParties: [],
        resources: [],
        specialEffects: [],
        influence: {}
      }
    },
    market: {
      currentPrices: { wood: 10, stone: 15 },
      priceHistory: [],
      completedTrades: []
    },
    relationships: {},
    turn: 1,
    worldAge: 1,
    narrativeContext: {}
  };
}

function createValidWorldDataWithParties() {
  const data = createValidWorldData();
  data.parties = {
    "party1_explorer": {
      id: "party1_explorer",
      name: "探索者ギルド",
      location: "region1",
      resources: { currency: 100, materials: {} },
      capabilities: { exploration: 8, trade: 4, combat: 6, diplomacy: 5, crafting: 3 },
      morale: 7,
      characterProfile: {
        leadershipStyle: "collaborative_democracy",
        decisionMaking: "cautious_analytical",
        communicationStyle: "diplomatic_direct"
      }
    },
    "party2_trader": {
      id: "party2_trader",
      name: "商人組合",
      location: "region1",
      resources: { currency: 150, materials: {} },
      capabilities: { exploration: 3, trade: 9, combat: 4, diplomacy: 8, crafting: 5 },
      morale: 8,
      characterProfile: {
        leadershipStyle: "pragmatic_leadership",
        decisionMaking: "profit_oriented",
        communicationStyle: "persuasive_assertive"
      }
    }
  };
  return data;
}

function createValidConfigData() {
  return {
    sessionName: "Test Autonomous Session",
    maxTurns: 20,
    stopConditions: {
      "totalPartyWealth": 1000,
      "regionDevelopment": 5
    }
  };
}