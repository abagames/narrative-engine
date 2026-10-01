import { describe, it, expect } from 'vitest';
import {
  rollDice,
  rollCheck,
  capabilityModifier,
  executeResponse,
  resolveQuests,
  runUpkeep,
  closeSeason,
  checkStopConditions,
  CheckDeclaration,
  CheckOutcome
} from '../src/world_rules.js';
import { validateDecisionResponse } from '../src/json_schemas.js';

function createWorld(seed = 42): any {
  return {
    rng: { seed },
    turn: 3,
    worldAge: 3,
    narrativeContext: {},
    relationships: { iron_wolves__silver_quill: { trust: 4 } },
    parties: {
      iron_wolves: {
        id: 'iron_wolves',
        name: 'Iron Wolves',
        location: 'harbor',
        morale: 6,
        reputation: 0,
        resources: { currency: 50 },
        capabilities: { combat: 9, exploration: 5, diplomacy: 2 }
      },
      silver_quill: {
        id: 'silver_quill',
        name: 'Silver Quill',
        location: 'harbor',
        morale: 6,
        reputation: 0,
        resources: { currency: 30 },
        capabilities: { combat: 3, exploration: 7, diplomacy: 8 }
      },
      ash_lanterns: {
        id: 'ash_lanterns',
        name: 'Ash Lanterns',
        location: 'old_road',
        morale: 5,
        reputation: 0,
        resources: { currency: 20 },
        capabilities: { combat: 5, exploration: 5, diplomacy: 5 }
      }
    },
    regions: {
      harbor: { id: 'harbor', name: 'Harbor', neighbors: ['old_road'], occupantParties: ['iron_wolves', 'silver_quill'] },
      old_road: { id: 'old_road', name: 'Old Road', neighbors: ['harbor', 'ruins'], occupantParties: ['ash_lanterns'] },
      ruins: { id: 'ruins', name: 'Ruins', neighbors: ['old_road'], occupantParties: [] }
    },
    npcs: {
      merchant_vell: { name: 'Vell', disposition: {}, memory: [] },
      captain_ora: { name: 'Ora', disposition: {}, memory: [] }
    },
    clocks: {
      smugglers_rise: { name: 'Smugglers seize the harbor', segments: 3, filled: 1, onComplete: [
        { target: 'regions/harbor/specialEffects', operation: 'set', value: ['smuggler_controlled'] }
      ] }
    },
    quests: {
      escort_vell: {
        title: 'Escort Vell',
        client: 'merchant_vell',
        location: 'harbor',
        requiredProgress: 3,
        deadlineTurn: 5,
        reward: { reputation: 3, currency: 40, items: ['vell_seal'] },
        conflictsWith: ['silence_vell'],
        acceptedBy: ['iron_wolves'],
        progress: {}
      },
      silence_vell: {
        title: 'Silence Vell',
        client: 'captain_ora',
        location: 'harbor',
        requiredProgress: 3,
        reward: { reputation: 2 },
        conflictsWith: ['escort_vell'],
        secret: { truth: 'Ora is the smugglers\' patron' },
        advancesClock: { clockId: 'smugglers_rise', amount: 1 },
        acceptedBy: [],
        progress: {}
      },
      seal_the_breach: {
        title: 'Seal the Breach',
        type: 'joint',
        minParties: 2,
        location: 'harbor',
        requiredProgress: 4,
        reward: { reputation: 4 },
        acceptedBy: ['iron_wolves', 'silver_quill'],
        progress: {}
      }
    },
    guild: { name: 'Lantern Guild', season: { endsAtTurn: 10, promotionSlots: 1 } }
  };
}

function playerResponse(partyId: string, effects: any[], checks?: any[]) {
  return {
    requestId: `request_${partyId}_1`,
    timestamp: new Date().toISOString(),
    status: 'completed',
    proposal: { type: 'pursue_quest', participants: [partyId], effects, ...(checks ? { checks } : {}) }
  };
}

function gmResponse(effects: any[], checks?: any[]) {
  return {
    requestId: 'request_GM_1',
    timestamp: new Date().toISOString(),
    status: 'completed',
    proposal: { type: 'issue_quest', participants: ['GM'], effects, ...(checks ? { checks } : {}) }
  };
}

function progressCheck(partyId: string, questId: string, overrides: Partial<CheckDeclaration> = {}): CheckDeclaration {
  return {
    id: 'push_forward',
    actor: partyId,
    capability: 'combat',
    outcomes: {
      success: [{ target: `quests/${questId}/progress/${partyId}`, operation: 'add', value: 2 }],
      partial: [
        { target: `quests/${questId}/progress/${partyId}`, operation: 'add', value: 1 },
        { target: `parties/${partyId}/morale`, operation: 'add', value: -1 }
      ],
      failure: [{ target: `parties/${partyId}/morale`, operation: 'add', value: -2 }]
    },
    ...overrides
  };
}

function seedFor(outcome: CheckOutcome, check: CheckDeclaration, requestId: string): number {
  for (let seed = 1; seed < 5000; seed++) {
    const world = createWorld(seed);
    if (rollCheck(world, check, requestId, 0).outcome === outcome) return seed;
  }
  throw new Error(`no seed for ${outcome}`);
}

describe('world_rules: dice', () => {
  it('rolls are deterministic for the same seed and key', () => {
    expect(rollDice(7, 'a')).toEqual(rollDice(7, 'a'));
    const rolls = rollDice(7, 'a');
    expect(rolls).toHaveLength(2);
    rolls.forEach(r => expect(r).toBeGreaterThanOrEqual(1));
    rolls.forEach(r => expect(r).toBeLessThanOrEqual(6));
  });

  it('dice are roughly uniform', () => {
    const counts = [0, 0, 0, 0, 0, 0];
    for (let i = 0; i < 6000; i++) counts[rollDice(1, `k${i}`, 1)[0] - 1]++;
    counts.forEach(c => expect(c).toBeGreaterThan(800));
  });

  it('maps capabilities 0-10 to modifiers -2..+2', () => {
    expect(capabilityModifier({ capabilities: { combat: 0 } }, 'combat')).toBe(-2);
    expect(capabilityModifier({ capabilities: { combat: 5 } }, 'combat')).toBe(0);
    expect(capabilityModifier({ capabilities: { combat: 10 } }, 'combat')).toBe(2);
    expect(capabilityModifier({ capabilities: {} }, 'stealth')).toBe(-1);
  });

  it('classifies 2d6 + modifier into success / partial / failure', () => {
    const world = createWorld(5);
    const check = progressCheck('iron_wolves', 'escort_vell');
    const result = rollCheck(world, check, 'request_iron_wolves_1', 0);
    expect(result.total).toBe(result.rolls[0] + result.rolls[1] + result.modifier);
    const expected = result.total >= 10 ? 'success' : result.total >= 7 ? 'partial' : 'failure';
    expect(result.outcome).toBe(expected);
  });

  it('clamps the situational bonus to ±1', () => {
    const world = createWorld(5);
    const base = rollCheck(world, progressCheck('iron_wolves', 'escort_vell'), 'r', 0);
    const boosted = rollCheck(world, progressCheck('iron_wolves', 'escort_vell', { situational: 5 }), 'r', 0);
    expect(boosted.modifier - base.modifier).toBe(1);
  });

  it('opposed checks compare both sides', () => {
    const world = createWorld(9);
    const result = rollCheck(world, { ...progressCheck('iron_wolves', 'escort_vell'), opposedBy: { party: 'silver_quill', capability: 'exploration' } }, 'r', 0);
    expect(result.opposed).toBeDefined();
    const margin = result.total - result.opposed!.total;
    expect(result.outcome).toBe(margin >= 3 ? 'success' : margin >= 0 ? 'partial' : 'failure');
  });
});

describe('world_rules: executeResponse', () => {
  it('applies exactly the outcome branch the dice select', () => {
    const check = progressCheck('iron_wolves', 'escort_vell');
    for (const outcome of ['success', 'partial', 'failure'] as const) {
      const world = createWorld(seedFor(outcome, check, 'request_iron_wolves_1'));
      const result = executeResponse(playerResponse('iron_wolves', [], [check]), world);
      expect(result.success).toBe(true);
      expect(result.checks![0].outcome).toBe(outcome);
      const progress = world.quests.escort_vell.progress.iron_wolves || 0;
      expect(progress).toBe(outcome === 'success' ? 2 : outcome === 'partial' ? 1 : 0);
      expect(world.checkLog).toHaveLength(1);
    }
  });

  it('resubmitting the same check gets the same dice', () => {
    const check = progressCheck('iron_wolves', 'escort_vell');
    const a = executeResponse(playerResponse('iron_wolves', [], [check]), createWorld(77));
    const b = executeResponse(playerResponse('iron_wolves', [], [{ ...check, id: 'renamed' }]), createWorld(77));
    expect(a.checks![0].rolls).toEqual(b.checks![0].rolls);
  });

  it('a GM-imposed check does not reuse the party\'s own dice', () => {
    const differs = [1, 2, 3, 4, 5, 6, 7, 8].some(seed => {
      const world = createWorld(seed);
      const own = rollCheck(world, progressCheck('iron_wolves', 'escort_vell'), 'r', 0, 'Player');
      const imposed = rollCheck(world, progressCheck('iron_wolves', 'escort_vell'), 'r', 0, 'GM');
      return own.rolls.join() !== imposed.rolls.join();
    });
    expect(differs).toBe(true);
  });

  it('rejects quest progress written outside a check', () => {
    const world = createWorld();
    const result = executeResponse(
      playerResponse('iron_wolves', [{ target: 'quests/escort_vell/progress/iron_wolves', operation: 'add', value: 3 }]),
      world
    );
    expect(result.success).toBe(false);
    expect(result.error).toContain('only change through a check');
  });

  it('rejects raising own capabilities or reputation', () => {
    for (const target of ['parties/iron_wolves/capabilities/combat', 'parties/iron_wolves/reputation']) {
      const result = executeResponse(playerResponse('iron_wolves', [{ target, operation: 'add', value: 5 }]), createWorld());
      expect(result.success).toBe(false);
      expect(result.error).toContain('Permission denied');
    }
  });

  it('rejects changing another party outside an opposed check', () => {
    const result = executeResponse(
      playerResponse('iron_wolves', [{ target: 'parties/silver_quill/morale', operation: 'add', value: -3 }]),
      createWorld()
    );
    expect(result.success).toBe(false);
  });

  it('allows sabotage only through a check opposed by the target', () => {
    const sabotage: CheckDeclaration = {
      id: 'sabotage',
      actor: 'iron_wolves',
      capability: 'combat',
      opposedBy: { party: 'silver_quill', capability: 'exploration' },
      outcomes: {
        success: [{ target: 'parties/silver_quill/morale', operation: 'add', value: -2 }],
        partial: [{ target: 'parties/silver_quill/morale', operation: 'add', value: -1 }],
        failure: [{ target: 'parties/iron_wolves/morale', operation: 'add', value: -1 }]
      }
    };
    const ok = executeResponse(playerResponse('iron_wolves', [], [sabotage]), createWorld());
    expect(ok.success).toBe(true);

    const unopposed = { ...sabotage, opposedBy: undefined };
    const denied = executeResponse(playerResponse('iron_wolves', [], [unopposed]), createWorld());
    expect(denied.success).toBe(false);
  });

  it('a party may only roll for itself', () => {
    const result = executeResponse(
      playerResponse('iron_wolves', [], [progressCheck('silver_quill', 'seal_the_breach')]),
      createWorld()
    );
    expect(result.success).toBe(false);
    expect(result.error).toContain('only roll for itself');
  });

  it('a request for one party cannot act as another', () => {
    const response = playerResponse('silver_quill', [{ target: 'parties/silver_quill/morale', operation: 'add', value: 1 }]);
    response.requestId = 'request_iron_wolves_9';
    const result = executeResponse(response, createWorld());
    expect(result.success).toBe(false);
  });

  it('a party response cannot pose as the GM', () => {
    const response = playerResponse('iron_wolves', [{ target: 'quests/escort_vell/status', operation: 'set', value: 'completed' }]);
    response.proposal.participants = ['GM'];
    const result = executeResponse(response, createWorld());
    expect(result.success).toBe(false);
    expect(result.error).toContain('cannot act as GM');
  });

  it('matches the longest party id in the request id', () => {
    const world = createWorld();
    world.parties.iron = { ...world.parties.ash_lanterns, id: 'iron' };
    const result = executeResponse(
      playerResponse('iron_wolves', [{ target: 'parties/iron_wolves/morale', operation: 'add', value: 1 }]),
      world
    );
    expect(result.success).toBe(true);
  });

  it('rejects whole-party writes and overwriting favors', () => {
    const whole = executeResponse(
      playerResponse('iron_wolves', [{ target: 'parties/iron_wolves', operation: 'add', value: { reputation: 99 } }]),
      createWorld()
    );
    expect(whole.success).toBe(false);

    const world = createWorld();
    world.favors = { f1: { owedBy: 'iron_wolves', owedTo: 'silver_quill', status: 'owed' } };
    const overwrite = executeResponse(
      playerResponse('iron_wolves', [{ target: 'favors/f1', operation: 'set', value: { owedBy: 'iron_wolves', owedTo: 'ash_lanterns' } }]),
      world
    );
    expect(overwrite.success).toBe(false);
    expect(overwrite.error).toContain('already exists');
  });

  it('progress requires presence at the quest site', () => {
    const world = createWorld(seedFor('success', progressCheck('iron_wolves', 'escort_vell'), 'request_iron_wolves_1'));
    world.parties.iron_wolves.location = 'old_road';
    const result = executeResponse(playerResponse('iron_wolves', [], [progressCheck('iron_wolves', 'escort_vell')]), world);
    expect(result.success).toBe(false);
    expect(result.error).toContain('must be pursued at harbor');
  });

  it('sabotage removes at most 1 progress per check', () => {
    const world = createWorld();
    world.quests.escort_vell.progress = { iron_wolves: 2 };
    const heavy: CheckDeclaration = {
      id: 'heavy', actor: 'ash_lanterns', capability: 'combat',
      opposedBy: { party: 'iron_wolves', capability: 'combat' },
      outcomes: {
        success: [{ target: 'quests/escort_vell/progress/iron_wolves', operation: 'add', value: -2 }],
        partial: [],
        failure: []
      }
    };
    world.parties.ash_lanterns.location = 'harbor';
    expect(executeResponse(playerResponse('ash_lanterns', [], [heavy]), structuredClone(world)).error).toContain('at most 1 progress');
    const stacked = structuredClone(heavy);
    stacked.outcomes.success = [
      { target: 'quests/escort_vell/progress/iron_wolves', operation: 'add', value: -1 },
      { target: 'quests/escort_vell/progress/iron_wolves', operation: 'add', value: -1 }
    ];
    expect(executeResponse(playerResponse('ash_lanterns', [], [stacked]), structuredClone(world)).error).toContain('at most 1 progress');
  });

  it('the third opposed clash between the same pair is a showdown', () => {
    const world = createWorld(11);
    world.parties.ash_lanterns.location = 'harbor';
    world.quests.escort_vell.acceptedBy = ['iron_wolves'];
    world.quests.escort_vell.progress = { iron_wolves: 1 };
    world.quests.silence_vell.acceptedBy = ['ash_lanterns'];
    world.quests.silence_vell.progress = { ash_lanterns: 2 };
    world.quests.seal_the_breach.acceptedBy = ['silver_quill'];
    const clash: CheckDeclaration = {
      id: 'clash', actor: 'ash_lanterns', capability: 'combat',
      opposedBy: { party: 'iron_wolves', capability: 'combat' },
      outcomes: {
        success: [{ target: 'quests/escort_vell/progress/iron_wolves', operation: 'add', value: -1 }],
        partial: [{ target: 'quests/silence_vell/progress/ash_lanterns', operation: 'add', value: 1 }],
        failure: [{ target: 'parties/ash_lanterns/morale', operation: 'add', value: -1 }]
      }
    };
    for (let t = 1; t <= 2; t++) {
      world.turn = t;
      const r = executeResponse(playerResponse('ash_lanterns', [], [clash]), world);
      expect(r.success).toBe(true);
      expect(r.checks![0].showdown).toBeUndefined();
    }
    expect(world.rivalries['ash_lanterns__iron_wolves'].clashes).toBe(2);

    world.turn = 3;
    const before = structuredClone(world);
    const r = executeResponse(playerResponse('ash_lanterns', [], [clash]), world);
    const result = r.checks![0];
    expect(result.showdown).toBeDefined();
    expect(result.outcome).not.toBe('partial');
    const { winner, loser } = result.showdown!;
    const questOf = (p: string) => (p === 'iron_wolves' ? 'escort_vell' : 'silence_vell');
    resolveQuests(world);
    expect(world.quests[questOf(loser)].progress[loser]).toBe(0);
    expect(world.quests[questOf(winner)].progress[winner]).toBeGreaterThanOrEqual(
      Math.min((before.quests[questOf(winner)].progress[winner] || 0) + 2, 3)
    );
    expect(world.rivalries['ash_lanterns__iron_wolves']).toMatchObject({ clashes: 0, showdowns: 1 });
    expect(world.chronicle.some((e: any) => e.kind === 'showdown')).toBe(true);
  });

  it('parties cannot write rivalries', () => {
    const result = executeResponse(
      playerResponse('ash_lanterns', [{ target: 'rivalries/ash_lanterns__iron_wolves/clashes', operation: 'set', value: 2 }]),
      createWorld()
    );
    expect(result.success).toBe(false);
  });

  it('sabotage also requires being at the quest site', () => {
    const world = createWorld();
    world.quests.escort_vell.progress = { iron_wolves: 2 };
    world.parties.ash_lanterns.location = 'old_road';
    const sabotage: CheckDeclaration = {
      id: 'remote', actor: 'ash_lanterns', capability: 'exploration',
      opposedBy: { party: 'iron_wolves', capability: 'exploration' },
      outcomes: {
        success: [{ target: 'quests/escort_vell/progress/iron_wolves', operation: 'add', value: -1 }],
        partial: [{ target: 'quests/escort_vell/progress/iron_wolves', operation: 'add', value: -1 }],
        failure: [{ target: 'quests/escort_vell/progress/iron_wolves', operation: 'add', value: -1 }]
      }
    };
    const result = executeResponse(playerResponse('ash_lanterns', [], [sabotage]), world);
    expect(result.success).toBe(false);
    expect(result.error).toContain('must be pursued at harbor');
  });

  it('is all-or-nothing', () => {
    const world = createWorld();
    const before = JSON.stringify(world);
    const result = executeResponse(
      playerResponse('silver_quill', [
        { target: 'parties/silver_quill/morale', operation: 'add', value: 1 },
        { target: 'parties/silver_quill/resources/currency', operation: 'add', value: -999 }
      ]),
      world
    );
    expect(result.success).toBe(false);
    expect(result.error).toContain('insufficient currency');
    expect(JSON.stringify(world)).toBe(before);
  });

  it('moves only along the region graph and keeps occupancy in sync', () => {
    const world = createWorld();
    const far = executeResponse(playerResponse('iron_wolves', [{ target: 'parties/iron_wolves/location', operation: 'set', value: 'ruins' }]), world);
    expect(far.success).toBe(false);
    expect(far.error).toContain('not adjacent');

    const near = executeResponse(playerResponse('iron_wolves', [{ target: 'parties/iron_wolves/location', operation: 'set', value: 'old_road' }]), world);
    expect(near.success).toBe(true);
    expect(world.regions.harbor.occupantParties).not.toContain('iron_wolves');
    expect(world.regions.old_road.occupantParties).toContain('iron_wolves');
  });

  it('accepting quests respects the active quest limit', () => {
    const world = createWorld();
    // iron_wolves already holds escort_vell and seal_the_breach
    const result = executeResponse(
      playerResponse('iron_wolves', [{ target: 'quests/silence_vell/acceptedBy', operation: 'add', value: 'iron_wolves' }]),
      world
    );
    expect(result.success).toBe(false);
    expect(result.error).toContain('Quest limit exceeded');

    const ok = executeResponse(
      playerResponse('ash_lanterns', [{ target: 'quests/silence_vell/acceptedBy', operation: 'add', value: 'ash_lanterns' }]),
      world
    );
    expect(ok.success).toBe(true);
    expect(world.quests.silence_vell.acceptedBy).toEqual(['ash_lanterns']);
    expect(world.quests.silence_vell.status).toBe('accepted');
  });

  it('a party may only enlist itself', () => {
    const result = executeResponse(
      playerResponse('ash_lanterns', [{ target: 'quests/silence_vell/acceptedBy', operation: 'add', value: 'silver_quill' }]),
      createWorld()
    );
    expect(result.success).toBe(false);
  });

  it('abandoning a quest forfeits progress and sours the client', () => {
    const world = createWorld();
    world.quests.escort_vell.progress = { iron_wolves: 2 };
    const result = executeResponse(
      playerResponse('iron_wolves', [{ target: 'quests/escort_vell/abandonedBy', operation: 'add', value: 'iron_wolves' }]),
      world
    );
    expect(result.success).toBe(true);
    expect(world.quests.escort_vell.acceptedBy).toEqual([]);
    expect(world.quests.escort_vell.progress.iron_wolves).toBeUndefined();
    expect(world.quests.escort_vell.status).toBe('open');
    expect(world.npcs.merchant_vell.disposition.iron_wolves).toBe(-1);
  });

  it('GM cannot set quest status; new quests always start open', () => {
    const world = createWorld();
    const denied = executeResponse(gmResponse([{ target: 'quests/escort_vell/status', operation: 'set', value: 'completed' }]), world);
    expect(denied.success).toBe(false);

    const issued = executeResponse(
      gmResponse([{ target: 'quests/find_relic', operation: 'set', value: { title: 'Find the relic', location: 'ruins', status: 'completed', progress: { iron_wolves: 9 } } }]),
      world
    );
    expect(issued.success).toBe(true);
    expect(world.quests.find_relic.status).toBe('open');
    expect(world.quests.find_relic.progress).toEqual({});
    expect(world.quests.find_relic.issuedTurn).toBe(3);
  });

  it('add on an array appends instead of corrupting it', () => {
    const world = createWorld();
    world.narrativeContext.rumors = ['a'];
    const result = executeResponse(gmResponse([{ target: 'narrativeContext/rumors', operation: 'add', value: 'b' }]), world);
    expect(result.success).toBe(true);
    expect(world.narrativeContext.rumors).toEqual(['a', 'b']);
  });

  it('limits checks per response', () => {
    const check = progressCheck('iron_wolves', 'escort_vell');
    const result = executeResponse(playerResponse('iron_wolves', [], [check, check, check]), createWorld());
    expect(result.success).toBe(false);
    expect(result.error).toContain('Too many checks');
  });
});

describe('world_rules: quests, clocks and seasons', () => {
  it('completes an exclusive quest, pays the winner and fails the conflicting quest', () => {
    const world = createWorld();
    world.quests.silence_vell.acceptedBy = ['ash_lanterns'];
    world.quests.silence_vell.status = 'accepted';
    world.quests.escort_vell.progress = { iron_wolves: 3 };

    const events = resolveQuests(world);

    expect(world.quests.escort_vell.status).toBe('completed');
    expect(world.quests.escort_vell.completedBy).toEqual(['iron_wolves']);
    expect(world.parties.iron_wolves.reputation).toBe(3);
    expect(world.parties.iron_wolves.resources.currency).toBe(90);
    expect(world.parties.iron_wolves.inventory).toEqual(['vell_seal']);
    expect(world.npcs.merchant_vell.disposition.iron_wolves).toBe(2);

    expect(world.quests.silence_vell.status).toBe('failed');
    expect(world.npcs.captain_ora.disposition.ash_lanterns).toBe(-1);
    // the failed quest advances its clock, which then triggers
    expect(world.clocks.smugglers_rise.filled).toBe(2);
    expect(events.map(e => e.kind)).toEqual(expect.arrayContaining(['quest_completed', 'quest_failed', 'clock_ticked']));
    expect(world.chronicle.length).toBe(events.length);
  });

  it('sabotage and progress in the same turn give the same result in any order', () => {
    const sabotage: CheckDeclaration = {
      id: 'sabotage', actor: 'silver_quill', capability: 'exploration',
      opposedBy: { party: 'iron_wolves', capability: 'exploration' },
      outcomes: {
        success: [{ target: 'quests/seal_the_breach/progress/iron_wolves', operation: 'add', value: -1 }],
        partial: [{ target: 'quests/seal_the_breach/progress/iron_wolves', operation: 'add', value: -1 }],
        failure: [{ target: 'quests/seal_the_breach/progress/iron_wolves', operation: 'add', value: -1 }]
      }
    };
    const push: CheckDeclaration = {
      id: 'push', actor: 'iron_wolves', capability: 'combat',
      outcomes: {
        success: [{ target: 'quests/seal_the_breach/progress/iron_wolves', operation: 'add', value: 1 }],
        partial: [{ target: 'quests/seal_the_breach/progress/iron_wolves', operation: 'add', value: 1 }],
        failure: [{ target: 'quests/seal_the_breach/progress/iron_wolves', operation: 'add', value: 1 }]
      }
    };
    const run = (order: string[]) => {
      const world = createWorld(5);
      for (const who of order) {
        const result = who === 'quill'
          ? executeResponse(playerResponse('silver_quill', [], [sabotage]), world)
          : executeResponse(playerResponse('iron_wolves', [], [push]), world);
        expect(result.success).toBe(true);
      }
      resolveQuests(world);
      return world.quests.seal_the_breach.progress.iron_wolves;
    };
    expect(run(['quill', 'wolves'])).toBe(0);
    expect(run(['wolves', 'quill'])).toBe(0);
  });

  it('settles a simultaneous finish by roll', () => {
    const world = createWorld();
    world.quests.escort_vell.acceptedBy = ['iron_wolves', 'silver_quill'];
    world.quests.escort_vell.progress = { iron_wolves: 3, silver_quill: 3 };
    const events = resolveQuests(world);
    expect(events.some(e => e.kind === 'tie_break')).toBe(true);
    expect(world.quests.escort_vell.completedBy).toHaveLength(1);
  });

  it('a joint quest needs several contributors and splits the reward by effort', () => {
    const world = createWorld();
    world.quests.seal_the_breach.progress = { iron_wolves: 4 };
    resolveQuests(world);
    expect(world.quests.seal_the_breach.status).toBe('accepted');

    world.quests.seal_the_breach.progress = { iron_wolves: 3, silver_quill: 1 };
    resolveQuests(world);
    expect(world.quests.seal_the_breach.status).toBe('completed');
    expect(world.parties.iron_wolves.reputation).toBe(3);
    expect(world.parties.silver_quill.reputation).toBe(1);
  });

  it('upkeep expires quests past their deadline and ticks clocks once per turn', () => {
    const world = createWorld();
    world.clocks.smugglers_rise.tickPerTurn = 1;
    world.quests.escort_vell.onFail = [{ target: 'narrativeContext/vellFate', operation: 'set', value: 'lost at sea' }];

    const events = runUpkeep(world, 6);
    expect(world.quests.escort_vell.status).toBe('expired');
    expect(world.narrativeContext.vellFate).toBe('lost at sea');
    expect(world.clocks.smugglers_rise.filled).toBe(2);

    const again = runUpkeep(world, 6);
    expect(again).toHaveLength(0);
    expect(world.clocks.smugglers_rise.filled).toBe(2);

    runUpkeep(world, 7);
    expect(world.clocks.smugglers_rise.triggered).toBe(true);
    expect(world.regions.harbor.specialEffects).toEqual(['smuggler_controlled']);
    expect(events.some(e => e.kind === 'quest_expired')).toBe(true);
  });

  it('closes the season with standings and a promotion', () => {
    const world = createWorld();
    world.parties.silver_quill.reputation = 5;
    world.parties.iron_wolves.reputation = 2;
    const events = closeSeason(world);
    expect(world.guild.promoted).toEqual(['silver_quill']);
    expect(world.guild.standings[0].partyId).toBe('silver_quill');
    expect(events.some(e => e.kind === 'season_end')).toBe(true);
    expect(closeSeason(world)).toHaveLength(0);
  });

  it('breaks a tie at the promotion line by roll', () => {
    const world = createWorld();
    world.parties.silver_quill.reputation = 4;
    world.parties.iron_wolves.reputation = 4;
    const events = closeSeason(world);
    expect(world.guild.promoted).toHaveLength(1);
    expect(['silver_quill', 'iron_wolves']).toContain(world.guild.promoted[0]);
    expect(events.some(e => e.kind === 'tie_break')).toBe(true);
  });

  it('supports quest-driven stop conditions', () => {
    const world = createWorld();
    expect(checkStopConditions(world, { seasonEnd: true }).completed).toBe(false);
    expect(checkStopConditions({ ...world, turn: 11 }, { seasonEnd: true })).toEqual({ completed: true, reason: 'seasonEnd' });

    world.quests.escort_vell.status = 'completed';
    expect(checkStopConditions(world, { questCompleted: 'escort_vell' }).reason).toBe('questCompleted');
    expect(checkStopConditions(world, { questsResolved: 2 }).completed).toBe(false);

    world.clocks.smugglers_rise.triggered = true;
    expect(checkStopConditions(world, { clockTriggered: ['smugglers_rise'] }).reason).toBe('clockTriggered');
  });
});

describe('json_schemas: checks', () => {
  it('requires every outcome to be declared before the roll', () => {
    const response = playerResponse('iron_wolves', [], [
      { id: 'c', actor: 'iron_wolves', capability: 'combat', outcomes: { success: [], partial: [] } }
    ]);
    const { valid, errors } = validateDecisionResponse(response);
    expect(valid).toBe(false);
    expect(errors.join('\n')).toContain('outcomes.failure');
  });

  it('rejects out-of-range situational modifiers and malformed branch effects', () => {
    const response = playerResponse('iron_wolves', [], [
      {
        id: 'c',
        actor: 'iron_wolves',
        capability: 'combat',
        situational: 3,
        outcomes: { success: [{ target: '/bad', operation: 'add', value: 1 }], partial: [], failure: [] }
      }
    ]);
    const { valid, errors } = validateDecisionResponse(response);
    expect(valid).toBe(false);
    expect(errors.join('\n')).toContain('situational');
    expect(errors.join('\n')).toContain('success effect 0');
  });
});
