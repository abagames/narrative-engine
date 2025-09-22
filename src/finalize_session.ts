import * as fs from 'fs/promises';
import * as path from 'path';

interface FinalizeResult {
  sessionId: string;
  status: 'finalized';
  finalTurn: number;
  completedAt: string;
  cleanupSummary: {
    deletedFiles: number;
    preservedFiles: string[];
    finalSizeKB: number;
  };
}

export async function finalizeSession(sessionId: string): Promise<FinalizeResult> {
  const AUTONOMOUS_SESSIONS_DIR = process.env.AUTONOMOUS_SESSIONS_DIR || './autonomous_sessions';
  const sessionDir = path.join(AUTONOMOUS_SESSIONS_DIR, 'sessions', sessionId);
  const workspaceDir = path.join(AUTONOMOUS_SESSIONS_DIR, 'ai_workspace');

  // Verify session directory exists
  try {
    await fs.access(sessionDir);
  } catch {
    throw new Error('Session directory not found');
  }

  const completedAt = new Date().toISOString();

  try {
    // 1. Save final world state
    await saveFinalWorldState(sessionDir);

    // 2. Cleanup work files
    const cleanupSummary = await cleanupWorkFiles(workspaceDir);

    // 3. Update session metadata
    const finalTurn = await updateSessionMetadata(sessionDir, completedAt);

    // 4. Calculate final directory size
    const finalSizeKB = await calculateDirectorySize(sessionDir);

    // Add preserved files list
    const preservedFiles = await getPreservedFiles(sessionDir);

    const finalCleanupSummary = {
      ...cleanupSummary,
      preservedFiles,
      finalSizeKB
    };

    return {
      sessionId,
      status: 'finalized',
      finalTurn,
      completedAt,
      cleanupSummary: finalCleanupSummary
    };

  } catch (error) {
    throw new Error(`Failed to finalize session: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function saveFinalWorldState(sessionDir: string): Promise<void> {
  const currentWorldPath = path.join(sessionDir, 'world_current.json');
  const finalWorldPath = path.join(sessionDir, 'world_final.json');

  try {
    await fs.access(currentWorldPath);
  } catch {
    throw new Error('world_current.json not found');
  }

  // Copy current world state to final world state
  const worldContent = await fs.readFile(currentWorldPath, 'utf-8');
  await fs.writeFile(finalWorldPath, worldContent);
}

async function cleanupWorkFiles(workspaceDir: string): Promise<{
  deletedFiles: number;
  preservedFiles: string[];
}> {
  let deletedFiles = 0;
  const preservedFiles: string[] = [];

  // 1. Clean up decision_requests directory
  const requestsDir = path.join(workspaceDir, 'decision_requests');
  try {
    const requestFiles = await fs.readdir(requestsDir);
    for (const file of requestFiles) {
      if (file.endsWith('.json')) {
        await fs.unlink(path.join(requestsDir, file));
        deletedFiles++;
      }
    }
  } catch {
    // Directory doesn't exist, which is fine
  }

  // 2. Clean up decision_responses directory
  const responsesDir = path.join(workspaceDir, 'decision_responses');
  try {
    const responseFiles = await fs.readdir(responsesDir);
    for (const file of responseFiles) {
      if (file.endsWith('.json')) {
        await fs.unlink(path.join(responsesDir, file));
        deletedFiles++;
      }
    }
  } catch {
    // Directory doesn't exist, which is fine
  }

  // 3. Clean up old world snapshots (keep latest 5)
  const snapshotsDir = path.join(workspaceDir, 'world_snapshots');
  try {
    const snapshotFiles = await fs.readdir(snapshotsDir);
    const worldSnapshots = snapshotFiles
      .filter(f => f.startsWith('world_turn_') && f.endsWith('.json'))
      .sort((a, b) => {
        const turnA = parseInt(a.match(/world_turn_(\d+)\.json/)?.[1] || '0');
        const turnB = parseInt(b.match(/world_turn_(\d+)\.json/)?.[1] || '0');
        return turnB - turnA; // Sort descending (latest first)
      });

    // Keep latest 5, delete the rest
    for (let i = 5; i < worldSnapshots.length; i++) {
      await fs.unlink(path.join(snapshotsDir, worldSnapshots[i]));
      deletedFiles++;
    }

    // Add preserved snapshots to list
    for (let i = 0; i < Math.min(5, worldSnapshots.length); i++) {
      preservedFiles.push(worldSnapshots[i]);
    }
  } catch {
    // Directory doesn't exist, which is fine
  }

  return { deletedFiles, preservedFiles };
}

async function updateSessionMetadata(sessionDir: string, completedAt: string): Promise<number> {
  const metadataPath = path.join(sessionDir, 'metadata.json');
  const playlogPath = path.join(sessionDir, 'playlog.jsonl');

  // Get final turn number from playlog first (if available), then world state
  let finalTurn = 1;
  let playlogHasSteps = false;

  try {
    const playlogContent = await fs.readFile(playlogPath, 'utf-8');
    const lines = playlogContent.trim().split('\n').filter(line => line);

    if (lines.length > 0) {
      // Find the highest step number in the playlog
      for (const line of lines) {
        try {
          const entry = JSON.parse(line);
          if (entry.step && typeof entry.step === 'number') {
            finalTurn = Math.max(finalTurn, entry.step);
            playlogHasSteps = true;
          }
        } catch {
          // Skip invalid lines
        }
      }
    }
  } catch {
    // Playlog doesn't exist or is empty
  }

  // Get world state turn for comparison
  let worldStateTurn = 1;
  try {
    const worldStatePath = path.join(sessionDir, 'world_current.json');
    const worldState = JSON.parse(await fs.readFile(worldStatePath, 'utf-8'));
    worldStateTurn = worldState.turn || 1;
  } catch {
    // World state doesn't exist, use default
  }

  // Use world state turn if it's higher or if playlog doesn't have meaningful steps
  if (!playlogHasSteps || worldStateTurn > finalTurn) {
    finalTurn = worldStateTurn;
  }

  // Update or create metadata
  let metadata: any = {};
  try {
    const metadataContent = await fs.readFile(metadataPath, 'utf-8');
    metadata = JSON.parse(metadataContent);
  } catch {
    // Metadata doesn't exist, create new one
  }

  metadata.status = 'completed';
  metadata.finalTurn = finalTurn;
  metadata.completedAt = completedAt;

  await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

  return finalTurn;
}

async function calculateDirectorySize(dirPath: string): Promise<number> {
  let totalSize = 0;

  async function calculateSize(currentPath: string): Promise<void> {
    try {
      const stats = await fs.stat(currentPath);

      if (stats.isDirectory()) {
        const items = await fs.readdir(currentPath);
        for (const item of items) {
          await calculateSize(path.join(currentPath, item));
        }
      } else if (stats.isFile()) {
        totalSize += stats.size;
      }
    } catch {
      // Skip files that can't be accessed
    }
  }

  await calculateSize(dirPath);
  return Math.ceil(totalSize / 1024); // Convert to KB
}

// Helper function to get list of preserved files
async function getPreservedFiles(sessionDir: string): Promise<string[]> {
  const preservedFiles: string[] = [];

  const essentialFiles = [
    'world_initial.json',
    'world_final.json',
    'playlog.jsonl',
    'metadata.json',
    'error_log.json'
  ];

  for (const filename of essentialFiles) {
    try {
      await fs.access(path.join(sessionDir, filename));
      preservedFiles.push(filename);
    } catch {
      // File doesn't exist, don't add to preserved list
    }
  }

  return preservedFiles;
}