import { describe, it, expect } from 'vitest';
import { startSession } from '../src/start_session.js';
import * as fs from 'fs/promises';

describe('Debug test', () => {
  it('should check where files are created', async () => {
    console.log('ENV VAR:', process.env.AUTONOMOUS_SESSIONS_DIR);

    // Create test files
    const worldData = {
      parties: {},
      regions: {},
      market: { currentPrices: {}, priceHistory: [], completedTrades: [] },
      relationships: {},
      turn: 1,
      worldAge: 1,
      narrativeContext: {}
    };

    const configData = {
      sessionName: "Debug Test",
      maxTurns: 5,
      stopConditions: {}
    };

    await fs.writeFile('debug_world.json', JSON.stringify(worldData));
    await fs.writeFile('debug_config.json', JSON.stringify(configData));

    try {
      const result = await startSession('debug_world.json', 'debug_config.json');
      console.log('Session result:', result);

      // Check if files exist in expected location
      try {
        await fs.access('./test_autonomous_sessions/sessions/' + result.sessionId);
        console.log('✅ Session dir exists in test location');
      } catch {
        console.log('❌ Session dir NOT in test location');

        try {
          await fs.access('./autonomous_sessions/sessions/' + result.sessionId);
          console.log('😱 Session dir exists in REAL location - this is wrong!');
        } catch {
          console.log('🤔 Session dir not found anywhere');
        }
      }

    } finally {
      await fs.unlink('debug_world.json').catch(() => {});
      await fs.unlink('debug_config.json').catch(() => {});
    }
  });
});