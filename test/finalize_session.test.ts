import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';
import { finalizeSession } from '../src/finalize_session.js';

describe('finalize_session.ts', () => {
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

    // Create test files
    const worldState = createTestWorldState();
    const metadata = createTestMetadata();

    await fs.writeFile(path.join(sessionDir, 'world_initial.json'), JSON.stringify(createInitialWorldState()));
    await fs.writeFile(path.join(sessionDir, 'world_current.json'), JSON.stringify(worldState));
    await fs.writeFile(path.join(sessionDir, 'metadata.json'), JSON.stringify(metadata));
    await fs.writeFile(path.join(sessionDir, 'playlog.jsonl'), createTestPlaylog());

    // Create work files to be cleaned up
    await createTestWorkFiles();
  });

  afterEach(async () => {
    try {
      await fs.rm(testSessionsDir, { recursive: true, force: true });
    } catch (error) {
      // Directory doesn't exist, which is fine
    }
  });

  async function createTestWorkFiles() {
    // Create decision request files
    const requestFiles = [
      'request_GM_143500.json',
      'request_fire_forge_143501.json',
      'request_emerald_hunters_143502.json'
    ];

    for (const filename of requestFiles) {
      await fs.writeFile(
        path.join(workspaceDir, 'decision_requests', filename),
        JSON.stringify({ requestId: filename.replace('.json', '') })
      );
    }

    // Create decision response files
    const responseFiles = [
      'request_GM_143500.json',
      'request_fire_forge_143501.json',
      'request_emerald_hunters_143502.json'
    ];

    for (const filename of responseFiles) {
      await fs.writeFile(
        path.join(workspaceDir, 'decision_responses', filename),
        JSON.stringify({ requestId: filename.replace('.json', '') })
      );
    }

    // Create world snapshot files
    const snapshotFiles = [
      'world_turn_01.json',
      'world_turn_02.json',
      'world_turn_03.json',
      'world_turn_04.json',
      'world_turn_05.json',
      'world_turn_06.json', // This should be kept (latest 5)
      'world_turn_07.json',
      'world_turn_08.json',
      'world_turn_09.json',
      'world_turn_10.json'
    ];

    for (const filename of snapshotFiles) {
      await fs.writeFile(
        path.join(workspaceDir, 'world_snapshots', filename),
        JSON.stringify({ turn: parseInt(filename.match(/\d+/)![0]) })
      );
    }

    // Create error log file
    await fs.writeFile(
      path.join(sessionDir, 'error_log.json'),
      JSON.stringify([
        { turn: 8, error: 'Minor validation warning', resolved: true }
      ])
    );
  }

  describe('最終世界状態保存', () => {
    it('world_current.jsonをworld_final.jsonとして正しく保存', async () => {
      const result = await finalizeSession(testSessionId);

      expect(result.status).toBe('finalized');

      // Check world_final.json exists and has correct content
      const finalWorldPath = path.join(sessionDir, 'world_final.json');
      await expect(fs.access(finalWorldPath)).resolves.toBeUndefined();

      const finalWorld = JSON.parse(await fs.readFile(finalWorldPath, 'utf-8'));
      const currentWorld = JSON.parse(await fs.readFile(path.join(sessionDir, 'world_current.json'), 'utf-8'));

      expect(finalWorld).toEqual(currentWorld);
    });

    it('world_current.jsonが存在しない場合はエラー', async () => {
      await fs.unlink(path.join(sessionDir, 'world_current.json'));

      await expect(
        finalizeSession(testSessionId)
      ).rejects.toThrow('world_current.json not found');
    });

    it('既存のworld_final.jsonを上書き', async () => {
      // Create existing world_final.json
      const oldFinalWorld = { old: 'data' };
      await fs.writeFile(path.join(sessionDir, 'world_final.json'), JSON.stringify(oldFinalWorld));

      await finalizeSession(testSessionId);

      const finalWorld = JSON.parse(await fs.readFile(path.join(sessionDir, 'world_final.json'), 'utf-8'));
      expect(finalWorld).not.toEqual(oldFinalWorld);
      expect(finalWorld.turn).toBeDefined();
    });
  });

  describe('作業ファイルクリーンアップ', () => {
    it('decision_requests内の全ファイルを削除', async () => {
      const result = await finalizeSession(testSessionId);

      expect(result.status).toBe('finalized');

      // Check decision_requests directory is empty
      const requestFiles = await fs.readdir(path.join(workspaceDir, 'decision_requests'));
      expect(requestFiles).toHaveLength(0);

      expect(result.cleanupSummary.deletedFiles).toBeGreaterThan(0);
    });

    it('decision_responses内の全ファイルを削除', async () => {
      await finalizeSession(testSessionId);

      // Check decision_responses directory is empty
      const responseFiles = await fs.readdir(path.join(workspaceDir, 'decision_responses'));
      expect(responseFiles).toHaveLength(0);
    });

    it('world_snapshots内の古いファイルを削除し最新5ターン分のみ保持', async () => {
      await finalizeSession(testSessionId);

      const snapshotFiles = await fs.readdir(path.join(workspaceDir, 'world_snapshots'));
      expect(snapshotFiles).toHaveLength(5);

      // Check that the latest 5 files are preserved
      const expectedFiles = [
        'world_turn_06.json',
        'world_turn_07.json',
        'world_turn_08.json',
        'world_turn_09.json',
        'world_turn_10.json'
      ];

      for (const filename of expectedFiles) {
        expect(snapshotFiles).toContain(filename);
      }

      // Check that older files are deleted
      const deletedFiles = [
        'world_turn_01.json',
        'world_turn_02.json',
        'world_turn_03.json',
        'world_turn_04.json',
        'world_turn_05.json'
      ];

      for (const filename of deletedFiles) {
        expect(snapshotFiles).not.toContain(filename);
      }
    });

    it('必須ファイルは保持される', async () => {
      await finalizeSession(testSessionId);

      // Check that essential files are preserved
      const preservedFiles = [
        'world_initial.json',
        'world_final.json',
        'playlog.jsonl',
        'metadata.json'
      ];

      for (const filename of preservedFiles) {
        await expect(
          fs.access(path.join(sessionDir, filename))
        ).resolves.toBeUndefined();
      }
    });

    it('error_log.jsonは保持される', async () => {
      await finalizeSession(testSessionId);

      await expect(
        fs.access(path.join(sessionDir, 'error_log.json'))
      ).resolves.toBeUndefined();
    });

    it('ディレクトリが存在しない場合も正常処理', async () => {
      // Remove one of the workspace directories
      await fs.rm(path.join(workspaceDir, 'decision_requests'), { recursive: true });

      const result = await finalizeSession(testSessionId);

      expect(result.status).toBe('finalized');
    });
  });

  describe('セッションメタデータ更新', () => {
    it('終了時刻と最終ターン数を正しく記録', async () => {
      const beforeTime = new Date();
      const result = await finalizeSession(testSessionId);
      const afterTime = new Date();

      expect(result.status).toBe('finalized');

      const updatedMetadata = JSON.parse(
        await fs.readFile(path.join(sessionDir, 'metadata.json'), 'utf-8')
      );

      expect(updatedMetadata).toMatchObject({
        sessionName: 'Test Autonomous Session',
        status: 'completed',
        finalTurn: 25,
        completedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
      });

      // Check completion time is reasonable
      const completedAt = new Date(updatedMetadata.completedAt);
      expect(completedAt.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(completedAt.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });

    it('元のメタデータフィールドを保持', async () => {
      await finalizeSession(testSessionId);

      const updatedMetadata = JSON.parse(
        await fs.readFile(path.join(sessionDir, 'metadata.json'), 'utf-8')
      );

      expect(updatedMetadata).toMatchObject({
        sessionName: 'Test Autonomous Session',
        maxTurns: 20,
        stopConditions: {
          totalPartyWealth: 1000,
          regionDevelopment: 5
        }
      });
    });

    it('メタデータファイルが存在しない場合は新規作成', async () => {
      await fs.unlink(path.join(sessionDir, 'metadata.json'));

      const result = await finalizeSession(testSessionId);

      expect(result.status).toBe('finalized');

      const metadata = JSON.parse(
        await fs.readFile(path.join(sessionDir, 'metadata.json'), 'utf-8')
      );

      expect(metadata).toMatchObject({
        status: 'completed',
        finalTurn: expect.any(Number),
        completedAt: expect.any(String)
      });
    });
  });

  describe('出力形式', () => {
    it('finalize_result.jsonが正しい形式で出力される', async () => {
      const result = await finalizeSession(testSessionId);

      expect(result).toMatchObject({
        sessionId: testSessionId,
        status: 'finalized',
        finalTurn: expect.any(Number),
        completedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
        cleanupSummary: {
          deletedFiles: expect.any(Number),
          preservedFiles: expect.arrayContaining([
            'world_initial.json',
            'world_final.json',
            'playlog.jsonl'
          ]),
          finalSizeKB: expect.any(Number)
        }
      });
    });

    it('クリーンアップサマリーが正確', async () => {
      const result = await finalizeSession(testSessionId);

      // Count expected deletions (3 request + 3 response + 5 old snapshots = 11)
      expect(result.cleanupSummary.deletedFiles).toBe(11);

      // Check preserved files list is accurate
      const preservedFiles = result.cleanupSummary.preservedFiles;
      expect(preservedFiles).toContain('world_initial.json');
      expect(preservedFiles).toContain('world_final.json');
      expect(preservedFiles).toContain('playlog.jsonl');
      expect(preservedFiles).toContain('error_log.json');

      // Final size should be calculated
      expect(result.cleanupSummary.finalSizeKB).toBeGreaterThan(0);
    });

    it('最終ターン数をプレイログから正しく算出', async () => {
      // Create playlog with specific final step
      const playlogEntries = [
        { step: 45, type: 'trade' },
        { step: 46, type: 'explore' },
        { step: 47, type: 'cooperate' }
      ];

      const playlogContent = playlogEntries.map(entry => JSON.stringify(entry)).join('\n') + '\n';
      await fs.writeFile(path.join(sessionDir, 'playlog.jsonl'), playlogContent);

      const result = await finalizeSession(testSessionId);

      expect(result.finalTurn).toBe(47);
    });
  });

  describe('サイズ計算', () => {
    it('最終ディレクトリサイズを正確に計算', async () => {
      const result = await finalizeSession(testSessionId);

      expect(result.cleanupSummary.finalSizeKB).toBeGreaterThan(0);

      // Verify size calculation by checking file sizes manually
      const sessionFiles = await fs.readdir(sessionDir);
      let totalSize = 0;

      for (const filename of sessionFiles) {
        const filePath = path.join(sessionDir, filename);
        const stats = await fs.stat(filePath);
        if (stats.isFile()) {
          totalSize += stats.size;
        }
      }

      const expectedSizeKB = Math.ceil(totalSize / 1024);
      expect(result.cleanupSummary.finalSizeKB).toBe(expectedSizeKB);
    });
  });

  describe('エラーハンドリング', () => {
    it('セッションディレクトリが存在しない場合はエラー', async () => {
      await expect(
        finalizeSession('nonexistent_session')
      ).rejects.toThrow('Session directory not found');
    });

    it('ファイル削除権限がない場合の処理', async () => {
      // This would require mocking filesystem permissions
      // Implementation depends on how permission errors are handled
    });

    it('部分的な削除失敗時も継続処理', async () => {
      // Create a file that can't be deleted (requires platform-specific setup)
      // For now, this is a placeholder test

      const result = await finalizeSession(testSessionId);

      expect(result.status).toBe('finalized');
      // Should continue even if some files can't be deleted
    });

    it('ディスク容量不足時の処理', async () => {
      // This would require mocking filesystem operations
      // Implementation depends on how disk space errors are handled
    });
  });

  describe('競合状態処理', () => {
    it('ファイルロック状態での安全な削除', async () => {
      // This would require simulating file locks
      // Implementation depends on file locking mechanism

      const result = await finalizeSession(testSessionId);

      expect(result.status).toBe('finalized');
    });

    it('並行実行時の安全性確保', async () => {
      // Simulate concurrent finalization attempts
      const promises = [
        finalizeSession(testSessionId),
        finalizeSession(testSessionId)
      ];

      // One should succeed, one should handle gracefully
      const results = await Promise.allSettled(promises);

      const successfulResults = results.filter(r => r.status === 'fulfilled');
      expect(successfulResults.length).toBeGreaterThanOrEqual(1);
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
        location: 'mountain_region',
        resources: { currency: 450, materials: { ore: 35, equipment: 12 } },
        capabilities: { exploration: 6, trade: 8, combat: 7, diplomacy: 5, crafting: 9 },
        morale: 9
      },
      emerald_hunters: {
        id: 'emerald_hunters',
        name: 'エメラルド探索隊',
        location: 'forest_region',
        resources: { currency: 380, materials: { gems: 28, maps: 5 } },
        capabilities: { exploration: 9, trade: 4, combat: 6, diplomacy: 6, crafting: 3 },
        morale: 8
      }
    },
    regions: {
      mountain_region: {
        id: 'mountain_region',
        name: 'Iron Mountains',
        type: 'mountains',
        capacity: 15,
        neighbors: ['forest_region'],
        occupantParties: ['fire_forge_guild'],
        resources: ['ore'],
        specialEffects: ['mining_bonus'],
        influence: { fire_forge_guild: 8 }
      },
      forest_region: {
        id: 'forest_region',
        name: 'Emerald Forest',
        type: 'forest',
        capacity: 12,
        neighbors: ['mountain_region'],
        occupantParties: ['emerald_hunters'],
        resources: ['gems'],
        specialEffects: ['exploration_bonus'],
        influence: { emerald_hunters: 7 }
      }
    },
    market: {
      currentPrices: { ore: 5.8, gems: 22.4 },
      priceHistory: [],
      completedTrades: []
    },
    relationships: {
      'fire_forge_guild-emerald_hunters': {
        trust: 9,
        cooperation: 8,
        tradeHistory: []
      }
    },
    turn: 25,
    worldAge: 25,
    narrativeContext: {
      majorEvents: [
        'Successful long-term partnership established',
        'Both guilds achieved their primary objectives'
      ]
    }
  };
}

function createInitialWorldState() {
  return {
    parties: {
      fire_forge_guild: {
        id: 'fire_forge_guild',
        name: '火の鍛冶ギルド',
        location: 'mountain_region',
        resources: { currency: 120, materials: {} },
        capabilities: { exploration: 6, trade: 8, combat: 7, diplomacy: 5, crafting: 9 },
        morale: 7
      },
      emerald_hunters: {
        id: 'emerald_hunters',
        name: 'エメラルド探索隊',
        location: 'forest_region',
        resources: { currency: 100, materials: {} },
        capabilities: { exploration: 9, trade: 4, combat: 6, diplomacy: 6, crafting: 3 },
        morale: 6
      }
    },
    regions: {
      mountain_region: {
        id: 'mountain_region',
        name: 'Iron Mountains',
        type: 'mountains',
        capacity: 15,
        neighbors: ['forest_region'],
        occupantParties: ['fire_forge_guild'],
        resources: ['ore'],
        specialEffects: ['mining_bonus'],
        influence: {}
      },
      forest_region: {
        id: 'forest_region',
        name: 'Emerald Forest',
        type: 'forest',
        capacity: 12,
        neighbors: ['mountain_region'],
        occupantParties: ['emerald_hunters'],
        resources: ['gems'],
        specialEffects: ['exploration_bonus'],
        influence: {}
      }
    },
    market: { currentPrices: {}, priceHistory: [], completedTrades: [] },
    relationships: {},
    turn: 1,
    worldAge: 1,
    narrativeContext: {}
  };
}

function createTestMetadata() {
  return {
    sessionName: 'Test Autonomous Session',
    maxTurns: 20,
    stopConditions: {
      totalPartyWealth: 1000,
      regionDevelopment: 5
    },
    createdAt: '2025-09-17T14:30:22Z',
    status: 'running'
  };
}

function createTestPlaylog() {
  const entries = [
    { step: 1, type: 'explore', participants: ['fire_forge_guild'] },
    { step: 2, type: 'trade', participants: ['emerald_hunters'] },
    { step: 3, type: 'cooperate', participants: ['fire_forge_guild', 'emerald_hunters'] }
  ];

  return entries.map(entry => JSON.stringify(entry)).join('\n') + '\n';
}