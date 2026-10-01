import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';
import { startSession } from '../src/start_session.js';
import { processAiResponses } from '../src/process_ai_responses.js';
import { appendPlaylog } from '../src/append_playlog.js';
import { generateNextTurn } from '../src/generate_next_turn.js';
import { finalizeSession } from '../src/finalize_session.js';

process.env.AUTONOMOUS_SESSIONS_DIR = './test_autonomous_sessions';

const sessionsDir = './test_autonomous_sessions';
const workspaceDir = path.join(sessionsDir, 'ai_workspace');
const responsesDir = path.join(workspaceDir, 'decision_responses');
const requestsDir = path.join(workspaceDir, 'decision_requests');
const inputsDir = path.join(sessionsDir, 'inputs');

function questWorld(): any {
  return {
    turn: 1,
    worldAge: 1,
    narrativeContext: {},
    relationships: { red_hounds__white_owls: { trust: 3, hostility: 5 } },
    parties: {
      red_hounds: {
        id: 'red_hounds',
        name: 'Red Hounds',
        location: 'guildhall',
        morale: 6,
        resources: { currency: 20 },
        capabilities: { combat: 8, investigation: 4, diplomacy: 3 }
      },
      white_owls: {
        id: 'white_owls',
        name: 'White Owls',
        location: 'guildhall',
        morale: 6,
        resources: { currency: 20 },
        capabilities: { combat: 3, investigation: 8, diplomacy: 7 }
      }
    },
    regions: {
      guildhall: { id: 'guildhall', name: 'Guildhall', neighbors: ['catacombs'], occupantParties: ['red_hounds', 'white_owls'] },
      catacombs: { id: 'catacombs', name: 'Catacombs', neighbors: ['guildhall'], occupantParties: [] }
    },
    npcs: { abbess_mira: { name: 'Abbess Mira', disposition: {}, memory: [] } },
    quests: {
      recover_reliquary: {
        title: 'Recover the Reliquary',
        client: 'abbess_mira',
        description: 'A reliquary was stolen and hidden in the guildhall vaults.',
        location: 'guildhall',
        requiredProgress: 2,
        deadlineTurn: 4,
        reward: { reputation: 3 },
        secret: { truth: 'The abbess staged the theft herself.' },
        conflictsWith: []
      },
      // A private offer the Owls must not see
      bury_the_truth: {
        title: 'Bury the Truth',
        client: 'abbess_mira',
        location: 'guildhall',
        requiredProgress: 2,
        reward: { reputation: 2 },
        offeredTo: ['red_hounds']
      }
    },
    clocks: { plague: { name: 'Plague in the catacombs', segments: 4, filled: 0, tickPerTurn: 1 } },
    guild: { name: 'Guild of the Lamp', season: { endsAtTurn: 3, promotionSlots: 1 } }
  };
}

async function writeResponse(response: any): Promise<void> {
  await fs.writeFile(path.join(responsesDir, `${response.requestId}.json`), JSON.stringify(response));
}

async function requestIdFor(actor: string): Promise<string> {
  const files = await fs.readdir(requestsDir);
  const file = files.find(f => f.startsWith(`request_${actor}_`));
  if (!file) throw new Error(`no request for ${actor}`);
  return file.replace('.json', '');
}

function turnPlaylog(focusRequestId?: string) {
  return {
    ...(focusRequestId ? { focusRequestId } : {}),
    narrative: {
      basicDescription: 'Two rival parties race for the same reliquary in the guildhall vaults.',
      internalPerspective: {
        situationObservation: 'The vault doors stand ajar and the Owls are already inside.',
        internalDeliberation: 'Brask growls 「We go in now, before they find it」 and nobody argues.',
        actionMotivation: 'The Hounds need the reputation to stay in the guild.',
        expectedOutcome: 'Reach the reliquary before the Owls do.'
      },
      externalInteraction: {
        approachStrategy: 'Force the inner door',
        communicationSummary: ['Brask orders the breach'],
        perceivedResponse: 'The Owls notice the noise',
        relationshipAssessment: 'Tension rises'
      },
      outcomeReaction: {
        immediateEmotionalResponse: 'Grim focus',
        strategicImplication: 'The race is on',
        futureDirectionAdjustment: 'Watch the Owls',
        teamMoraleImpact: 'Steady'
      },
      environmentalContext: {
        settingDescription: 'Dusty vaults under the guildhall, lit by guttering lamps.',
        otherPartiesObservation: 'The Owls are reading inscriptions',
        worldStateAwareness: 'Plague rumors spread from the catacombs'
      }
    }
  };
}

describe('quest-driven turn flow (integration)', () => {
  let sessionId: string;

  beforeEach(async () => {
    await fs.rm(sessionsDir, { recursive: true, force: true });
    await fs.mkdir(inputsDir, { recursive: true });
    await fs.writeFile(path.join(inputsDir, 'world.json'), JSON.stringify(questWorld()));
    await fs.writeFile(
      path.join(inputsDir, 'config.json'),
      JSON.stringify({ sessionName: 'Lamp Guild', maxTurns: 10, stopConditions: { seasonEnd: true }, seed: 1234 })
    );
    const result = await startSession(path.join(inputsDir, 'world.json'), path.join(inputsDir, 'config.json'));
    sessionId = result.sessionId;
  });

  afterEach(async () => {
    await fs.rm(sessionsDir, { recursive: true, force: true });
  });

  it('runs a turn with quest acceptance, a check, full logging and hidden information', async () => {
    const sessionDir = path.join(sessionsDir, 'sessions', sessionId);
    const initial = JSON.parse(await fs.readFile(path.join(sessionDir, 'world_current.json'), 'utf-8'));
    expect(initial.rng.seed).toBe(1234);
    expect(initial.market).toBeUndefined();

    // Party request shows the quest board without its secret
    const owlsRequestId = await requestIdFor('white_owls');
    const owlsRequest = JSON.parse(await fs.readFile(path.join(requestsDir, `${owlsRequestId}.json`), 'utf-8'));
    expect(owlsRequest.contextData.guildBoard.map((q: any) => q.id)).toEqual(['recover_reliquary']);
    expect(owlsRequest.contextData.guildBoard[0].secret).toBeUndefined();
    expect(JSON.stringify(owlsRequest.contextData)).not.toContain('staged the theft');
    expect(owlsRequest.contextData.availableActions).toContain('accept_quest');
    expect(owlsRequest.contextData.checkModifiers.investigation).toBe(1);

    // GM sees the secret
    const gmRequestId = await requestIdFor('GM');
    const gmRequest = JSON.parse(await fs.readFile(path.join(requestsDir, `${gmRequestId}.json`), 'utf-8'));
    expect(JSON.stringify(gmRequest.contextData.questBoard)).toContain('staged the theft');
    expect(gmRequest.contextData.questBoard.signals.idleParties).toEqual(['red_hounds', 'white_owls']);

    const houndsRequestId = await requestIdFor('red_hounds');
    const houndsRequest = JSON.parse(await fs.readFile(path.join(requestsDir, `${houndsRequestId}.json`), 'utf-8'));
    expect(houndsRequest.contextData.guildBoard.map((q: any) => q.id)).toContain('bury_the_truth');

    await writeResponse({
      requestId: gmRequestId,
      timestamp: new Date().toISOString(),
      status: 'completed',
      proposal: {
        type: 'npc_action',
        participants: ['GM'],
        effects: [{ target: 'narrativeContext/rumors', operation: 'set', value: ['The abbess was seen near the vaults'] }]
      }
    });
    await writeResponse({
      requestId: houndsRequestId,
      timestamp: new Date().toISOString(),
      status: 'completed',
      proposal: {
        type: 'accept_quest',
        participants: ['red_hounds'],
        effects: [{ target: 'quests/recover_reliquary/acceptedBy', operation: 'add', value: 'red_hounds' }],
        checks: [
          {
            id: 'breach_vault',
            actor: 'red_hounds',
            capability: 'combat',
            outcomes: {
              success: [{ target: 'quests/recover_reliquary/progress/red_hounds', operation: 'add', value: 2 }],
              partial: [
                { target: 'quests/recover_reliquary/progress/red_hounds', operation: 'add', value: 1 },
                { target: 'parties/red_hounds/morale', operation: 'add', value: -1 }
              ],
              failure: [{ target: 'parties/red_hounds/morale', operation: 'add', value: -2 }]
            }
          }
        ]
      },
      meta: { llmDecision: { selectedAction: { type: 'accept_quest', reasoning: 'Brask wants the vault first' }, character_voices: { Brask: 'Now!' } } }
    });
    // The Owls try to write progress directly: rejected
    await writeResponse({
      requestId: owlsRequestId,
      timestamp: new Date().toISOString(),
      status: 'completed',
      proposal: {
        type: 'pursue_quest',
        participants: ['white_owls'],
        effects: [{ target: 'quests/recover_reliquary/progress/white_owls', operation: 'add', value: 2 }]
      }
    });

    const processed = await processAiResponses(sessionId);
    expect(processed.actionsExecuted).toBe(2);
    expect(processed.failedDecisions).toEqual([owlsRequestId]);
    expect(processed.errors[0].error).toContain('only change through a check');
    expect(processed.nextStatus).toBe('partial_success');
    expect(processed.checks).toHaveLength(1);
    const roll = processed.checks[0];

    const afterFirst = JSON.parse(await fs.readFile(path.join(sessionDir, 'world_current.json'), 'utf-8'));
    const expectedProgress = roll.outcome === 'success' ? 2 : roll.outcome === 'partial' ? 1 : 0;
    const quest = afterFirst.quests.recover_reliquary;
    if (expectedProgress >= 2) {
      expect(quest.status).toBe('completed');
      expect(afterFirst.parties.red_hounds.reputation).toBe(3);
    } else {
      expect(quest.status).toBe('accepted');
      expect(quest.progress.red_hounds || 0).toBe(expectedProgress);
    }

    // The engine's ruling is stored with the response
    const savedHounds = JSON.parse(await fs.readFile(path.join(responsesDir, `${houndsRequestId}.json`), 'utf-8'));
    expect(savedHounds.engineResolution.processed).toBe(true);
    expect(savedHounds.engineResolution.checks[0].rolls).toEqual(roll.rolls);

    // The Owls resubmit a valid response; already-applied responses are not applied twice
    await writeResponse({
      requestId: owlsRequestId,
      timestamp: new Date().toISOString(),
      status: 'completed',
      proposal: {
        type: 'investigate',
        participants: ['white_owls'],
        effects: [{ target: 'parties/white_owls/morale', operation: 'add', value: 1 }]
      }
    });
    await fs.rm(path.join(responsesDir, 'failed'), { recursive: true, force: true });
    const retried = await processAiResponses(sessionId);
    expect(retried.actionsExecuted).toBe(1);
    expect(retried.alreadyProcessed.sort()).toEqual([gmRequestId, houndsRequestId].sort());
    const afterRetry = JSON.parse(await fs.readFile(path.join(sessionDir, 'world_current.json'), 'utf-8'));
    expect(afterRetry.quests.recover_reliquary.progress).toEqual(afterFirst.quests.recover_reliquary.progress);
    expect(afterRetry.parties.white_owls.morale).toBe(7);

    // One playlog entry for the turn, carrying every action and the dice
    await fs.writeFile(path.join(workspaceDir, 'turn_playlog.json'), JSON.stringify(turnPlaylog(houndsRequestId)));
    const appended = await appendPlaylog(sessionId, 'turn_playlog.json');
    expect(appended.success).toBe(true);

    const lines = (await fs.readFile(path.join(sessionDir, 'playlog.jsonl'), 'utf-8')).trim().split('\n');
    expect(lines).toHaveLength(1);
    const entry = JSON.parse(lines[0]);
    expect(entry.turn).toBe(1);
    expect(entry.actor).toBe('red_hounds');
    expect(entry.actions.map((a: any) => a.actor).sort()).toEqual(['GM', 'red_hounds', 'white_owls']);
    expect(entry.checks[0].outcome).toBe(roll.outcome);
    expect(entry.actions.find((a: any) => a.actor === 'red_hounds').characterVoices).toEqual({ Brask: 'Now!' });
    if (quest.status === 'completed') {
      expect(entry.engineEvents.some((e: any) => e.kind === 'quest_completed')).toBe(true);
    }

    // Appending again in the same turn does not duplicate logged actions
    await expect(appendPlaylog(sessionId, 'turn_playlog.json')).rejects.toThrow('Decision response file not found');

    // Next turn: upkeep ticks the clock; history exposes every actor
    const next = await generateNextTurn(sessionId);
    expect(next.turnGenerated).toBe(2);
    expect(next.engineEvents!.some(e => e.kind === 'clock_ticked')).toBe(true);
    const owlsNext = JSON.parse(
      await fs.readFile(path.join(requestsDir, `${await requestIdFor('white_owls')}.json`), 'utf-8')
    );
    expect(owlsNext.contextData.recentHistory.some((h: any) => h.actor === 'white_owls')).toBe(true);
    expect(owlsNext.contextData.visibleClocks[0]).toMatchObject({ id: 'plague', filled: 1 });
    if (quest.status !== 'completed' && expectedProgress > 0) {
      const view = owlsNext.contextData.guildBoard.find((q: any) => q.id === 'recover_reliquary');
      expect(view.rivalProgress.red_hounds).toBe('started');
    }
  });

  it('ends at season end and records promotions', async () => {
    const sessionDir = path.join(sessionsDir, 'sessions', sessionId);
    const world = JSON.parse(await fs.readFile(path.join(sessionDir, 'world_current.json'), 'utf-8'));
    world.turn = 3;
    world.parties.white_owls.reputation = 4;
    await fs.writeFile(path.join(sessionDir, 'world_current.json'), JSON.stringify(world));

    const result = await generateNextTurn(sessionId);
    expect(result.status).toBe('session_complete');
    expect(result.completionReason).toBe('seasonEnd');

    const finalWorld = JSON.parse(await fs.readFile(path.join(sessionDir, 'world_current.json'), 'utf-8'));
    expect(finalWorld.guild.promoted).toEqual(['white_owls']);

    await finalizeSession(sessionId);
    const saved = JSON.parse(await fs.readFile(path.join(sessionDir, 'world_final.json'), 'utf-8'));
    expect(saved.guild.promoted).toEqual(['white_owls']);
  });

  it('accepts the bundled example world', async () => {
    const result = await startSession(
      'examples/lantern_guild_season/world_initial.json',
      'examples/lantern_guild_season/session_config.json'
    );
    expect(result.status).toBe('ready');
    expect(result.firstTurnRequests).toHaveLength(4);
  });

  it('rejects worlds whose quests reference unknown regions', async () => {
    const world = questWorld();
    world.quests.recover_reliquary.location = 'nowhere';
    await fs.writeFile(path.join(inputsDir, 'bad.json'), JSON.stringify(world));
    await expect(
      startSession(path.join(inputsDir, 'bad.json'), path.join(inputsDir, 'config.json'))
    ).rejects.toThrow('unknown region');
  });
});
