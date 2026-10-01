import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';
import {
  startDraft,
  buildSequence,
  currentDraftActors,
  validateDraftResponse,
  applyDraftResponse,
  publicDraftView,
  isDraftActive
} from '../src/draft.js';
import { checkModifier, executeResponse, runUpkeep } from '../src/world_rules.js';
import { startSession } from '../src/start_session.js';
import { processAiResponses } from '../src/process_ai_responses.js';
import { appendPlaylog } from '../src/append_playlog.js';
import { generateNextTurn } from '../src/generate_next_turn.js';

function draftWorld(): any {
  return {
    turn: 1,
    worldAge: 1,
    narrativeContext: {},
    relationships: {},
    rng: { seed: 99 },
    parties: {
      wolves: { id: 'wolves', name: 'Wolves', location: 'hall', reputation: 3, morale: 6, resources: { currency: 10 }, capabilities: { combat: 8, healing: 2 } },
      quill: { id: 'quill', name: 'Quill', location: 'hall', reputation: 0, morale: 6, resources: { currency: 10 }, capabilities: { combat: 3, investigation: 8 } },
      lanterns: { id: 'lanterns', name: 'Lanterns', location: 'hall', reputation: 1, morale: 6, resources: { currency: 10 }, capabilities: { combat: 5, exploration: 7 } }
    },
    regions: {
      hall: { id: 'hall', neighbors: ['crypt'], occupantParties: ['wolves', 'quill', 'lanterns'] },
      crypt: { id: 'crypt', neighbors: ['hall'], occupantParties: [] }
    },
    quests: {
      guard_caravan: { title: 'Guard the Caravan', contract: true, location: 'hall', requiredProgress: 2, reward: { reputation: 2 } },
      rob_caravan: { title: 'Rob the Caravan', contract: true, location: 'hall', requiredProgress: 2, reward: { reputation: 2 }, conflictsWith: ['guard_caravan'] },
      seal_crypt: { title: 'Seal the Crypt', type: 'joint', minParties: 2, location: 'crypt', requiredProgress: 4, reward: { reputation: 4 } },
      public_bounty: { title: 'Rat Bounty', location: 'hall', requiredProgress: 2, reward: { reputation: 1 } }
    },
    recruits: {
      sister_ilse: { name: 'Sister Ilse', role: 'Healer', grants: { capabilities: { healing: 9 } }, term: 3, leavesIf: 'asked to harm the innocent' },
      grim: { name: 'Grim', role: 'Tracker', grants: { capabilities: { exploration: 8 } }, ifUnhired: [
        { target: 'narrativeContext/grimSignedWith', operation: 'set', value: 'smugglers' }
      ] }
    },
    items: {
      warded_lantern: { name: 'Warded Lantern', bonus: { capability: 'investigation', amount: 1 } }
    },
    intel: {
      caravan_route: { title: 'The caravan\'s true route', fact: { text: 'The caravan leaves by the north gate', truth: true } }
    },
    favors: {},
    draft: {
      status: 'pending',
      label: 'Season opening',
      picksPerParty: 2,
      pool: {
        contracts: ['guard_caravan', 'rob_caravan'],
        recruits: ['sister_ilse', 'grim'],
        items: ['warded_lantern'],
        intel: ['caravan_route'],
        invites: ['seal_crypt']
      }
    }
  };
}

function pick(world: any, party: string, input: any) {
  const err = validateDraftResponse(world, party, input);
  if (err) throw new Error(err.error);
  return applyDraftResponse(world, party, input);
}

describe('draft rules', () => {
  it('orders picks lowest standing first, as a snake', () => {
    const world = draftWorld();
    startDraft(world);
    expect(world.draft.baseOrder).toEqual(['quill', 'lanterns', 'wolves']);
    expect(world.draft.sequence).toEqual(['quill', 'lanterns', 'wolves', 'wolves', 'lanterns', 'quill']);
    expect(buildSequence(['a', 'b'], 3)).toEqual(['a', 'b', 'b', 'a', 'a', 'b']);
    expect(world.phase).toBe('draft');
    expect(currentDraftActors(world)).toEqual([{ party: 'quill', mode: 'pick' }]);
  });

  it('rejects a pool that refers to non-contract quests', () => {
    const world = draftWorld();
    world.draft.pool.contracts.push('public_bounty');
    const result = startDraft(world) as any;
    expect(result.error).toContain('must have "contract": true');
  });

  it('only the current picker may pick, and only what is in the pool', () => {
    const world = draftWorld();
    startDraft(world);
    expect(validateDraftResponse(world, 'wolves', { pick: { kind: 'item', id: 'warded_lantern' } })?.error).toContain("Not wolves's turn");
    expect(validateDraftResponse(world, 'quill', { pick: { kind: 'item', id: 'no_such_item' } })?.error).toContain('not available');
    expect(validateDraftResponse(world, 'quill', {})?.error).toContain('A pick is required');
  });

  it('applies each kind of pick', () => {
    const world = draftWorld();
    startDraft(world);
    pick(world, 'quill', { pick: { kind: 'item', id: 'warded_lantern' } });
    pick(world, 'lanterns', { pick: { kind: 'contract', id: 'rob_caravan' } });
    pick(world, 'wolves', { pick: { kind: 'recruit', id: 'sister_ilse' } });
    pick(world, 'wolves', { pick: { kind: 'intel', id: 'caravan_route' } });

    expect(world.items.warded_lantern.heldBy).toBe('quill');
    expect(checkModifier(world, 'quill', 'investigation').modifier).toBe(2); // +1 capability, +1 lantern

    expect(world.quests.rob_caravan.acceptedBy).toEqual(['lanterns']);
    expect(world.quests.rob_caravan.offeredTo).toEqual(['lanterns']);
    expect(world.draft.pool.contracts).toEqual(['guard_caravan']);

    expect(world.recruits.sister_ilse).toMatchObject({ status: 'hired', hiredBy: 'wolves', hiredUntilTurn: 3 });
    expect(checkModifier(world, 'wolves', 'healing')).toMatchObject({ modifier: 2, recruit: 'sister_ilse' });

    expect(world.parties.wolves.knowledge[0].text).toContain('north gate');
    // Others see that intel was bought, not which
    const view = publicDraftView(world, 'quill');
    expect(view.picksSoFar.find((p: any) => p.kind === 'intel').id).toBeUndefined();
    expect(publicDraftView(world, 'wolves').picksSoFar.find((p: any) => p.kind === 'intel').id).toBe('caravan_route');
    expect(JSON.stringify(view)).not.toContain('north gate');
  });

  it('an invitation must be answered first, and accepting uses the pick', () => {
    const world = draftWorld();
    startDraft(world);
    pick(world, 'quill', { pick: { kind: 'invite', id: 'seal_crypt', target: 'wolves' } });
    pick(world, 'lanterns', { pick: { kind: 'pass' } });

    const invite = world.draft.invites[0];
    expect(validateDraftResponse(world, 'wolves', { pick: { kind: 'pass' } })?.error).toContain('Answer every pending invitation');
    expect(
      validateDraftResponse(world, 'wolves', { respond: [{ inviteId: invite.id, accept: true }], pick: { kind: 'pass' } })?.error
    ).toContain('uses this pick');

    pick(world, 'wolves', { respond: [{ inviteId: invite.id, accept: true }] });
    expect(world.quests.seal_crypt.acceptedBy).toEqual(['quill', 'wolves']);
    expect(world.quests.seal_crypt.status).toBe('accepted');
    expect(world.draft.pickIndex).toBe(3);
  });

  it('a declined invitation returns the quest to the pool', () => {
    const world = draftWorld();
    startDraft(world);
    pick(world, 'quill', { pick: { kind: 'invite', id: 'seal_crypt', target: 'lanterns' } });
    pick(world, 'lanterns', { respond: [{ inviteId: world.draft.invites[0].id, accept: false }], pick: { kind: 'recruit', id: 'grim' } });
    expect(world.draft.invites[0].status).toBe('declined');
    expect(world.draft.pool.invites).toEqual(['seal_crypt']);
    expect(world.recruits.grim.hiredBy).toBe('lanterns');
  });

  it('collects late answers after the last pick, then closes with leftovers', () => {
    const world = draftWorld();
    world.draft.picksPerParty = 1;
    startDraft(world);
    pick(world, 'quill', { pick: { kind: 'pass' } });
    pick(world, 'lanterns', { pick: { kind: 'pass' } });
    pick(world, 'wolves', { pick: { kind: 'invite', id: 'seal_crypt', target: 'quill' } });

    expect(world.draft.status).toBe('answering');
    expect(currentDraftActors(world)).toEqual([{ party: 'quill', mode: 'answer' }]);
    expect(validateDraftResponse(world, 'quill', { respond: [{ inviteId: world.draft.invites[0].id, accept: false }], pick: { kind: 'pass' } })?.error).toContain('No picks remain');

    pick(world, 'quill', { respond: [{ inviteId: world.draft.invites[0].id, accept: false }] });
    expect(world.draft.status).toBe('closed');
    expect(isDraftActive(world)).toBe(false);
    expect(world.recruits.grim.status).toBe('rival');
    expect(world.narrativeContext.grimSignedWith).toBe('smugglers');
    expect(world.draft.leftovers.contracts).toEqual(['guard_caravan', 'rob_caravan']);
  });

  it('a creditor can call in a favor to take the debtor\'s place', () => {
    const world = draftWorld();
    world.favors = { f1: { owedBy: 'quill', owedTo: 'wolves', status: 'owed' } };
    startDraft(world);
    expect(world.draft.status).toBe('ordering');
    expect(currentDraftActors(world)).toEqual([{ party: 'wolves', mode: 'order' }]);

    pick(world, 'wolves', { swap: { favorId: 'f1' } });
    expect(world.draft.baseOrder).toEqual(['wolves', 'lanterns', 'quill']);
    expect(world.favors.f1.status).toBe('repaid');
    expect(world.draft.status).toBe('picking');
    expect(currentDraftActors(world)[0].party).toBe('wolves');
  });

  it('contracts cannot be accepted outside the draft', () => {
    const world = draftWorld();
    const result = executeResponse(
      {
        requestId: 'request_quill_1',
        proposal: { type: 'accept_quest', participants: ['quill'], effects: [{ target: 'quests/guard_caravan/acceptedBy', operation: 'add', value: 'quill' }] }
      },
      world
    );
    expect(result.success).toBe(false);
    expect(result.error).toContain('contracts are taken in the draft');
  });

  it('recruits leave when their term ends, and can be lured by an opposed check', () => {
    const world = draftWorld();
    startDraft(world);
    pick(world, 'quill', { pick: { kind: 'recruit', id: 'sister_ilse' } });

    const lure = {
      requestId: 'request_wolves_1',
      proposal: {
        type: 'negotiate',
        participants: ['wolves'],
        effects: [],
        checks: [{
          id: 'lure', actor: 'wolves', capability: 'combat',
          opposedBy: { party: 'quill', capability: 'investigation' },
          outcomes: {
            success: [{ target: 'recruits/sister_ilse/hiredBy', operation: 'set', value: 'wolves' }],
            partial: [],
            failure: []
          }
        }]
      }
    };
    const unopposed = structuredClone(lure);
    delete (unopposed.proposal.checks[0] as any).opposedBy;
    expect(executeResponse(unopposed, structuredClone(world)).success).toBe(false);
    expect(executeResponse(lure, structuredClone(world)).success).toBe(true);

    const events = runUpkeep(world, 4);
    expect(world.recruits.sister_ilse.status).toBe('departed');
    expect(events.some(e => e.kind === 'recruit_departed')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Through the tools
// ---------------------------------------------------------------------------

process.env.AUTONOMOUS_SESSIONS_DIR = './test_autonomous_sessions';
const sessionsDir = './test_autonomous_sessions';
const workspaceDir = path.join(sessionsDir, 'ai_workspace');
const requestsDir = path.join(workspaceDir, 'decision_requests');
const responsesDir = path.join(workspaceDir, 'decision_responses');

async function onlyRequest(): Promise<any> {
  const files = (await fs.readdir(requestsDir)).filter(f => f.endsWith('.json'));
  expect(files).toHaveLength(1);
  return JSON.parse(await fs.readFile(path.join(requestsDir, files[0]), 'utf-8'));
}

async function answer(request: any, draft: any): Promise<void> {
  const response = {
    requestId: request.requestId,
    timestamp: new Date().toISOString(),
    status: 'completed',
    proposal: { type: 'draft', participants: [request.framework.actorId], effects: [], draft },
    meta: { llmDecision: { selectedAction: { type: 'draft', reasoning: `${request.framework.actorId} picks` } } }
  };
  await fs.writeFile(path.join(responsesDir, `${request.requestId}.json`), JSON.stringify(response));
}

describe('draft through the tools (integration)', () => {
  beforeEach(async () => {
    await fs.rm(sessionsDir, { recursive: true, force: true });
    await fs.mkdir(path.join(sessionsDir, 'inputs'), { recursive: true });
  });
  afterEach(async () => {
    await fs.rm(sessionsDir, { recursive: true, force: true });
  });

  it('runs a season-start draft, logs it once, then opens turn 1', async () => {
    const world = draftWorld();
    world.draft.picksPerParty = 1;
    const worldPath = path.join(sessionsDir, 'inputs', 'world.json');
    const configPath = path.join(sessionsDir, 'inputs', 'config.json');
    await fs.writeFile(worldPath, JSON.stringify(world));
    await fs.writeFile(configPath, JSON.stringify({ sessionName: 'Draft', maxTurns: 5, stopConditions: {} }));

    const { sessionId } = await startSession(worldPath, configPath);
    const sessionDir = path.join(sessionsDir, 'sessions', sessionId);

    // Pick 1: quill (only one request exists, for the current picker)
    let request = await onlyRequest();
    expect(request.framework.actorId).toBe('quill');
    expect(request.contextData.phase).toBe('draft');
    expect(request.contextData.draft.pool.recruits.map((r: any) => r.id)).toEqual(['sister_ilse', 'grim']);
    expect(JSON.stringify(request.contextData)).not.toContain('asked to harm the innocent');
    await answer(request, { pick: { kind: 'contract', id: 'guard_caravan' } });
    let processed = await processAiResponses(sessionId);
    expect(processed.nextStatus).toBe('draft_in_progress');

    // A response out of turn is rejected
    let next = await generateNextTurn(sessionId);
    expect(next.status).toBe('draft_in_progress');
    expect(next.turnGenerated).toBe(1);
    request = await onlyRequest();
    expect(request.framework.actorId).toBe('lanterns');
    expect(request.contextData.draft.picksSoFar).toEqual([{ index: 0, party: 'quill', kind: 'contract', id: 'guard_caravan' }]);
    await answer({ ...request, framework: { actorId: 'wolves' }, requestId: 'request_wolves_999' }, { pick: { kind: 'pass' } });
    processed = await processAiResponses(sessionId);
    expect(processed.errors[0].error).toContain("Not wolves's turn");
    await fs.rm(path.join(responsesDir, 'failed'), { recursive: true, force: true });

    await answer(request, { pick: { kind: 'contract', id: 'rob_caravan' } });
    expect((await processAiResponses(sessionId)).nextStatus).toBe('draft_in_progress');

    await generateNextTurn(sessionId);
    request = await onlyRequest();
    expect(request.framework.actorId).toBe('wolves');
    await answer(request, { pick: { kind: 'recruit', id: 'sister_ilse' } });
    expect((await processAiResponses(sessionId)).nextStatus).toBe('draft_completed');

    // One playlog entry carries the whole draft
    await fs.writeFile(path.join(workspaceDir, 'turn_playlog.json'), JSON.stringify({
      narrative: {
        basicDescription: 'The guild hall falls silent as the contracts are claimed one by one.',
        internalPerspective: {
          situationObservation: 'Both caravan contracts are on the table.',
          internalDeliberation: 'Aria whispers 「If we guard it, the Lanterns will rob it」 and nods.',
          actionMotivation: 'Deny the Lanterns an easy prize.',
          expectedOutcome: 'A confrontation on the north road.'
        },
        externalInteraction: { approachStrategy: 'Pick first', communicationSummary: ['Aria claims the guard contract'], perceivedResponse: 'The Lanterns grin', relationshipAssessment: 'Rivalry' },
        outcomeReaction: { immediateEmotionalResponse: 'Tense', strategicImplication: 'Collision ahead', futureDirectionAdjustment: 'Prepare', teamMoraleImpact: 'Steady' },
        environmentalContext: { settingDescription: 'Lantern-lit guild hall at dawn, crowded with sellswords.', otherPartiesObservation: 'Wolves hire a healer', worldStateAwareness: 'Caravan leaves soon' }
      }
    }));
    expect((await appendPlaylog(sessionId, 'turn_playlog.json')).success).toBe(true);
    const entry = JSON.parse((await fs.readFile(path.join(sessionDir, 'playlog.jsonl'), 'utf-8')).trim());
    expect(entry.draft.picks.map((p: any) => [p.party, p.kind, p.id])).toEqual([
      ['quill', 'contract', 'guard_caravan'],
      ['lanterns', 'contract', 'rob_caravan'],
      ['wolves', 'recruit', 'sister_ilse']
    ]);
    expect(entry.draft.picks[0].reasoning).toBe('quill picks');
    expect(entry.engineEvents.some((e: any) => e.kind === 'draft_closed')).toBe(true);

    // The action phase of turn 1 opens for everyone
    next = await generateNextTurn(sessionId);
    expect(next.status).toBe('ready_for_next_turn');
    expect(next.turnGenerated).toBe(1);
    const files = await fs.readdir(requestsDir);
    expect(files.filter(f => f.endsWith('.json'))).toHaveLength(4);
    const quillFile = files.find(f => f.startsWith('request_quill_'))!;
    const quillRequest = JSON.parse(await fs.readFile(path.join(requestsDir, quillFile), 'utf-8'));
    const board = quillRequest.contextData.guildBoard.map((q: any) => q.id);
    expect(board).toContain('guard_caravan');
    expect(board).not.toContain('rob_caravan'); // the Lanterns' contract is private

    // And the following call moves on to turn 2
    const world1 = JSON.parse(await fs.readFile(path.join(sessionDir, 'world_current.json'), 'utf-8'));
    expect(world1.phase).toBe('action');
    next = await generateNextTurn(sessionId);
    expect(next.turnGenerated).toBe(2);
  });
});
