import { beforeAll, afterAll } from 'vitest';
import * as fs from 'fs/promises';

beforeAll(async () => {
  // Global test setup
  console.log('🧪 Setting up test environment...');

  // Ensure test directories don't interfere with real autonomous_sessions
  process.env.TEST_MODE = 'true';
  process.env.AUTONOMOUS_SESSIONS_DIR = './test_autonomous_sessions';
});

afterAll(async () => {
  // Global test cleanup
  console.log('🧹 Cleaning up test environment...');

  try {
    await fs.rm('./test_autonomous_sessions', { recursive: true, force: true });
  } catch (error) {
    // Directory doesn't exist, which is fine
  }

  delete process.env.TEST_MODE;
  delete process.env.AUTONOMOUS_SESSIONS_DIR;
});