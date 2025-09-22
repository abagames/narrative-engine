import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';
import { generateNextTurn } from '../src/generate_next_turn.js';

// Set environment variable for testing
process.env.AUTONOMOUS_SESSIONS_DIR = './test_autonomous_sessions';

describe('generate_next_turn.ts', () => {
  const testSessionId = 'session_20250917_143022';
  const testSessionsDir = './test_autonomous_sessions';
  const sessionDir = path.join(testSessionsDir, 'sessions', testSessionId);
  const workspaceDir = path.join(testSessionsDir, 'ai_workspace');

  beforeEach(async () => {
    // Setup test environment
    await fs.mkdir(sessionDir, { recursive: true });
    await fs.mkdir(path.join(workspaceDir, 'decision_requests'), { recursive: true });

    // Create test world state
    const worldState = createTestWorldState();
    await fs.writeFile(path.join(sessionDir, 'world_current.json'), JSON.stringify(worldState));

    // Create session metadata
    const metadata = {
      sessionName: "Test Session",
      maxTurns: 20,
      stopConditions: {
        totalPartyWealth: 1000,
        regionDevelopment: 5
      }
    };
    await fs.writeFile(path.join(sessionDir, 'metadata.json'), JSON.stringify(metadata));
  });

  afterEach(async () => {
    try {
      await fs.rm(testSessionsDir, { recursive: true, force: true });
    } catch (error) {
      // Directory doesn't exist, which is fine
    }
  });

  describe('世界状態読み込み', () => {
    it('world_current.jsonを正しく読み込む', async () => {
      const result = await generateNextTurn(testSessionId, 6);

      expect(result.turnGenerated).toBe(6);
      expect(result.status).toBe('ready_for_next_turn');
    });

    it('存在しない世界状態ファイルの場合はエラー', async () => {
      await fs.unlink(path.join(sessionDir, 'world_current.json'));

      await expect(
        generateNextTurn(testSessionId, 6)
      ).rejects.toThrow('world_current.json not found');
    });

    it('無効なJSON構文の場合はエラー', async () => {
      await fs.writeFile(path.join(sessionDir, 'world_current.json'), '{ invalid json }');

      await expect(
        generateNextTurn(testSessionId, 6)
      ).rejects.toThrow('Invalid JSON');
    });
  });

  describe('決定要求ファイル生成', () => {
    it('GM用決定要求ファイルを正しく生成', async () => {
      const result = await generateNextTurn(testSessionId, 6);

      const gmRequestFile = result.requestsCreated.find(f => f.includes('GM'));
      expect(gmRequestFile).toBeDefined();

      const gmRequestPath = path.join(workspaceDir, 'decision_requests', gmRequestFile!);
      const gmRequestData = JSON.parse(await fs.readFile(gmRequestPath, 'utf-8'));

      expect(gmRequestData).toMatchObject({
        requestId: expect.stringMatching(/^request_GM_\d+$/),
        timestamp: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
        sessionId: testSessionId,
        worldStateFile: expect.stringContaining('world_current.json'),
        framework: {
          role: 'GM'
        },
        contextData: {
          marketData: expect.objectContaining({
            currentPrices: expect.any(Object),
            priceHistory: expect.any(Array),
            totalVolume: expect.any(Number)
          }),
          worldSummary: expect.objectContaining({
            turn: 6,
            totalParties: expect.any(Number),
            activeRegions: expect.any(Number)
          }),
          availableActions: expect.arrayContaining([
            expect.stringMatching(/price_update|environmental_change|market_event/)
          ]),
          recentHistory: expect.any(Array)
        },
        instructions: expect.stringContaining('適切なフレームワークを適用')
      });
    });

    it('各パーティー用決定要求ファイルを正しく生成', async () => {
      const result = await generateNextTurn(testSessionId, 6);

      const partyRequestFiles = result.requestsCreated.filter(f => f.includes('party') || f.includes('guild'));
      expect(partyRequestFiles.length).toBeGreaterThan(0);

      for (const requestFile of partyRequestFiles) {
        const requestPath = path.join(workspaceDir, 'decision_requests', requestFile);
        const requestData = JSON.parse(await fs.readFile(requestPath, 'utf-8'));

        expect(requestData).toMatchObject({
          requestId: expect.stringMatching(/^request_\w+_\d+$/),
          timestamp: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
          sessionId: testSessionId,
          worldStateFile: expect.stringContaining('world_current.json'),
          framework: {
            role: 'Player',
            actorId: expect.any(String)
          },
          contextData: {
            partyState: expect.objectContaining({
              id: expect.any(String),
              name: expect.any(String),
              location: expect.any(String),
              resources: expect.any(Object),
              capabilities: expect.any(Object),
              morale: expect.any(Number)
            }),
            visibleRegions: expect.any(Array),
            marketData: expect.objectContaining({
              currentPrices: expect.any(Object),
              recentTrades: expect.any(Array)
            }),
            availableActions: expect.arrayContaining([
              expect.stringMatching(/move|explore|trade|cooperate|market_trade/)
            ]),
            recentHistory: expect.any(Array)
          },
          instructions: expect.stringContaining('適切なフレームワークを適用')
        });
      }
    });

    it('前のターンの決定要求ファイルが残っている場合は削除', async () => {
      // Create old request files
      const oldGmFile = 'request_GM_old123.json';
      const oldPartyFile = 'request_party1_old124.json';

      await fs.writeFile(
        path.join(workspaceDir, 'decision_requests', oldGmFile),
        JSON.stringify({ requestId: 'old_request' })
      );
      await fs.writeFile(
        path.join(workspaceDir, 'decision_requests', oldPartyFile),
        JSON.stringify({ requestId: 'old_request' })
      );

      await generateNextTurn(testSessionId, 6);

      // Check old files were deleted
      await expect(
        fs.access(path.join(workspaceDir, 'decision_requests', oldGmFile))
      ).rejects.toThrow();
      await expect(
        fs.access(path.join(workspaceDir, 'decision_requests', oldPartyFile))
      ).rejects.toThrow();
    });
  });

  describe('contextData動的生成', () => {
    it('GM用contextDataを正しく生成', async () => {
      const result = await generateNextTurn(testSessionId, 11);

      const gmRequestFile = result.requestsCreated.find(f => f.includes('GM'));
      const gmRequestPath = path.join(workspaceDir, 'decision_requests', gmRequestFile!);
      const gmRequestData = JSON.parse(await fs.readFile(gmRequestPath, 'utf-8'));

      const contextData = gmRequestData.contextData;

      // Market data should include comprehensive information
      expect(contextData.marketData).toMatchObject({
        currentPrices: expect.any(Object),
        priceHistory: expect.any(Array),
        totalVolume: expect.any(Number),
        priceVolatility: expect.any(Object)
      });

      // World summary should reflect current state
      expect(contextData.worldSummary).toMatchObject({
        turn: 11, // targetTurn
        totalParties: expect.any(Number),
        activeRegions: expect.any(Number),
        partyDistribution: expect.any(Object)
      });

      // Available actions should be contextual
      expect(contextData.availableActions).toEqual(
        expect.arrayContaining([
          'price_update',
          'environmental_change',
          'market_event'
        ])
      );
    });

    it('パーティー用contextDataを正しく生成', async () => {
      const result = await generateNextTurn(testSessionId, 9);

      const partyRequestFile = result.requestsCreated.find(f => f.includes('emerald_hunters'));
      const requestPath = path.join(workspaceDir, 'decision_requests', partyRequestFile!);
      const requestData = JSON.parse(await fs.readFile(requestPath, 'utf-8'));

      const contextData = requestData.contextData;

      // Party state should be current
      expect(contextData.partyState).toMatchObject({
        id: 'emerald_hunters',
        name: expect.any(String),
        location: expect.any(String),
        resources: expect.any(Object),
        capabilities: expect.any(Object),
        morale: expect.any(Number)
      });

      // Visible regions should include current and adjacent
      expect(contextData.visibleRegions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            isAccessible: expect.any(Boolean)
          })
        ])
      );

      // Market data should be filtered to relevant resources
      expect(contextData.marketData.currentPrices).toEqual(
        expect.objectContaining({
          gems: expect.any(Number)
        })
      );

      // Available actions should be context-dependent
      expect(contextData.availableActions).toContain('explore');
    });

    it('利用可能アクションを状況に応じて動的生成', async () => {
      // Test different scenarios that affect available actions
      const worldState = createTestWorldState();

      // Scenario 1: Party in settlement with market access
      worldState.parties.fire_forge_guild.location = 'market_town';
      worldState.regions.market_town = {
        id: 'market_town',
        name: 'Market Town',
        type: 'settlement',
        capacity: 20,
        neighbors: ['forest_region'],
        occupantParties: ['fire_forge_guild'],
        resources: [],
        specialEffects: ['enhanced_trade'], // Updated to match new effect names
        influence: {}
      };

      await fs.writeFile(path.join(sessionDir, 'world_current.json'), JSON.stringify(worldState));

      const result = await generateNextTurn(testSessionId, 6);

      const forgeGuildFile = result.requestsCreated.find(f => f.includes('fire_forge_guild'));
      const requestPath = path.join(workspaceDir, 'decision_requests', forgeGuildFile!);
      const requestData = JSON.parse(await fs.readFile(requestPath, 'utf-8'));

      expect(requestData.contextData.availableActions).toContain('market_trade');
    });

    it('最近の履歴を適切に含める', async () => {
      // Create playlog with recent events
      const recentEvents = [
        { step: 45, type: 'market_trade', participants: ['fire_forge_guild'], actor: 'fire_forge_guild' },
        { step: 46, type: 'explore', participants: ['emerald_hunters'], actor: 'emerald_hunters' }
      ];

      const playlogContent = recentEvents.map(event => JSON.stringify(event)).join('\n') + '\n';
      await fs.writeFile(path.join(sessionDir, 'playlog.jsonl'), playlogContent);

      const result = await generateNextTurn(testSessionId, 6);

      const partyRequestFile = result.requestsCreated.find(f => f.includes('fire_forge_guild'));
      const requestPath = path.join(workspaceDir, 'decision_requests', partyRequestFile!);
      const requestData = JSON.parse(await fs.readFile(requestPath, 'utf-8'));

      expect(requestData.contextData.recentHistory).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            step: 45,
            type: 'market_trade',
            participants: ['fire_forge_guild']
          })
        ])
      );
    });
  });

  describe('ターン番号管理', () => {
    it('次ターン番号を正しく計算', async () => {
      const result = await generateNextTurn(testSessionId, 16);

      expect(result.turnGenerated).toBe(16);
    });

    it('世界状態のターン番号を更新', async () => {
      await generateNextTurn(testSessionId, 8);

      const updatedWorld = JSON.parse(
        await fs.readFile(path.join(sessionDir, 'world_current.json'), 'utf-8')
      );

      expect(updatedWorld.turn).toBe(8); // targetTurn
    });
  });

  describe('終了条件チェック', () => {
    it('最大ターン数に達した場合はsession_completeステータス', async () => {
      const result = await generateNextTurn(testSessionId, 21); // targetTurn > maxTurns (20)

      expect(result.status).toBe('session_complete');
      expect(result.requestsCreated).toHaveLength(0);
    });

    it('停止条件を満たした場合はsession_completeステータス', async () => {
      // Modify world state to meet stop conditions
      const worldState = createTestWorldState();
      worldState.parties.fire_forge_guild.resources.currency = 600;
      worldState.parties.emerald_hunters.resources.currency = 500;

      await fs.writeFile(path.join(sessionDir, 'world_current.json'), JSON.stringify(worldState));

      const result = await generateNextTurn(testSessionId, 11);

      expect(result.status).toBe('session_complete');
      expect(result.completionReason).toBe('totalPartyWealth');
    });

    it('停止条件を満たしていない場合は通常処理', async () => {
      const result = await generateNextTurn(testSessionId, 11);

      expect(result.status).toBe('ready_for_next_turn');
      expect(result.requestsCreated.length).toBeGreaterThan(0);
    });
  });

  describe('出力形式', () => {
    it('next_turn_result.jsonが正しい形式で出力される', async () => {
      const result = await generateNextTurn(testSessionId, 16);

      expect(result).toMatchObject({
        turnGenerated: 16,
        requestsCreated: expect.arrayContaining([
          expect.stringMatching(/^request_GM_\d+\.json$/),
          expect.stringMatching(/^request_\w+_\d+\.json$/)
        ]),
        status: 'ready_for_next_turn'
      });

      // Check that all mentioned files actually exist
      for (const filename of result.requestsCreated) {
        await expect(
          fs.access(path.join(workspaceDir, 'decision_requests', filename))
        ).resolves.toBeUndefined();
      }
    });

    it('セッション完了時の出力形式', async () => {
      const result = await generateNextTurn(testSessionId, 21);

      expect(result).toMatchObject({
        turnGenerated: 20, // currentTurn when session completes
        requestsCreated: [],
        status: 'session_complete',
        completionReason: 'maxTurns'
      });
    });
  });

  describe('エラーハンドリング', () => {
    it('セッションディレクトリが存在しない場合はエラー', async () => {
      await expect(
        generateNextTurn('nonexistent_session', 6)
      ).rejects.toThrow('Session directory not found');
    });

    it('メタデータファイルが存在しない場合はエラー', async () => {
      await fs.unlink(path.join(sessionDir, 'metadata.json'));

      await expect(
        generateNextTurn(testSessionId, 6)
      ).rejects.toThrow('metadata.json not found');
    });

    it('世界状態が破損している場合の処理', async () => {
      const corruptedWorld = { incomplete: 'data' };
      await fs.writeFile(path.join(sessionDir, 'world_current.json'), JSON.stringify(corruptedWorld));

      await expect(
        generateNextTurn(testSessionId, 6)
      ).rejects.toThrow('Invalid world state');
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
        resources: {
          currency: 150,
          materials: { ore: 25, coal: 10 }
        },
        capabilities: { exploration: 6, trade: 8, combat: 7, diplomacy: 5, crafting: 9 },
        morale: 8,
        characterProfile: {
          leadershipStyle: 'meritocracy',
          decisionMaking: 'quality_focused',
          communicationStyle: 'direct_professional'
        }
      },
      emerald_hunters: {
        id: 'emerald_hunters',
        name: 'エメラルド探索隊',
        location: 'forest_region',
        resources: {
          currency: 80,
          materials: { gems: 5, wood: 15 }
        },
        capabilities: { exploration: 9, trade: 4, combat: 6, diplomacy: 6, crafting: 3 },
        morale: 7,
        characterProfile: {
          leadershipStyle: 'adventure_focused',
          decisionMaking: 'risk_taking',
          communicationStyle: 'enthusiastic_optimistic'
        }
      }
    },
    regions: {
      mountain_region: {
        id: 'mountain_region',
        name: 'Iron Mountains',
        type: 'mountains',
        capacity: 15,
        neighbors: ['forest_region', 'market_town'],
        occupantParties: ['fire_forge_guild'],
        resources: ['ore', 'coal'],
        specialEffects: ['mining_bonus'],
        influence: { fire_forge_guild: 3 }
      },
      forest_region: {
        id: 'forest_region',
        name: 'Emerald Forest',
        type: 'forest',
        capacity: 12,
        neighbors: ['mountain_region', 'market_town'],
        occupantParties: ['emerald_hunters'],
        resources: ['gems', 'wood'],
        specialEffects: ['exploration_bonus'],
        influence: { emerald_hunters: 2 }
      },
      market_town: {
        id: 'market_town',
        name: 'Central Market',
        type: 'settlement',
        capacity: 25,
        neighbors: ['mountain_region', 'forest_region'],
        occupantParties: [],
        resources: [],
        specialEffects: ['market_access', 'trade_hub'],
        influence: {}
      }
    },
    market: {
      currentPrices: {
        ore: 4.2,
        coal: 2.8,
        gems: 15.6,
        wood: 1.5
      },
      priceHistory: [
        { turn: 4, ore: 4.0, coal: 3.0, gems: 14.8, wood: 1.4 },
        { turn: 5, ore: 4.1, coal: 2.9, gems: 15.2, wood: 1.5 }
      ],
      completedTrades: [
        { turn: 5, buyer: 'fire_forge_guild', seller: 'market', resource: 'ore', quantity: 10, price: 4.1 }
      ]
    },
    relationships: {
      'fire_forge_guild-emerald_hunters': {
        trust: 6,
        cooperation: 4,
        tradeHistory: []
      }
    },
    turn: 5,
    worldAge: 5,
    narrativeContext: {
      currentEvents: [
        'Increased mining activity in the mountains',
        'New gem deposits discovered in the forest'
      ]
    }
  };
}