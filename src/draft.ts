/**
 * Draft: the sequential preparation phase.
 *
 * Before a stretch of action turns, parties take turns picking from a pool the
 * GM prepared: the quest they will pursue (with an optional invitation to
 * another party when the quest is a joint one), recruits, unique items or
 * intel. Quests are not exclusive: several parties may pick the same quest and
 * race for it. Picks are public, so each pick is a reaction to the ones before it. The engine enforces the order and
 * the rules; the parties decide what to pick.
 */
import {
  computeStandings,
  ensureSeed,
  rollDice,
  normalizeWorld,
  MAX_ACTIVE_QUESTS,
  MAX_RECRUITS,
  EngineEvent,
  RuleError,
  applyEffect,
  Effect
} from './world_rules.js';

export type PickKind = 'quest' | 'recruit' | 'item' | 'intel' | 'pass';
export type DraftMode = 'order' | 'pick' | 'answer';

export interface DraftPickInput {
  kind: PickKind;
  id?: string;
  target?: string;
}

export interface DraftResponseInput {
  pick?: DraftPickInput;
  respond?: Array<{ inviteId: string; accept: boolean }>;
  swap?: { favorId: string };
}

export interface DraftPickRecord {
  index: number;
  party: string;
  kind: PickKind | 'accept_invite';
  id?: string;
  target?: string;
  inviteId?: string;
  reasoning?: string;
  voices?: Record<string, string>;
}

export interface DraftInvite {
  id: string;
  from: string;
  to: string;
  questId: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  pickIndex: number;
}

export const DEFAULT_PICKS_PER_PARTY = 2;
const POOL_KINDS = ['quests', 'recruits', 'items', 'intel'] as const;

function poolKey(kind: PickKind): (typeof POOL_KINDS)[number] | null {
  switch (kind) {
    case 'quest': return 'quests';
    case 'recruit': return 'recruits';
    case 'item': return 'items';
    case 'intel': return 'intel';
    default: return null;
  }
}

export function isDraftActive(world: any): boolean {
  const status = world.draft?.status;
  return status === 'ordering' || status === 'picking' || status === 'answering';
}

/** A snake order over `rounds` rounds: 1-2-3-3-2-1-1-2-3 ... */
export function buildSequence(baseOrder: string[], rounds: number): string[] {
  const sequence: string[] = [];
  for (let r = 0; r < rounds; r++) {
    sequence.push(...(r % 2 === 0 ? baseOrder : [...baseOrder].reverse()));
  }
  return sequence;
}

function event(world: any, kind: EngineEvent['kind'], summary: string, parties: string[] = [], details?: Record<string, any>): EngineEvent {
  return { turn: Number(world.turn) || 0, kind, summary, parties, ...(details ? { details } : {}) };
}

function validatePool(world: any): RuleError | null {
  const pool = world.draft.pool || {};
  for (const id of pool.quests || []) {
    const quest = world.quests?.[id];
    if (!quest) return { error: `Draft pool: unknown quest ${id}` };
    if (quest.status && quest.status !== 'open' && quest.status !== 'accepted') {
      return { error: `Draft pool: quest ${id} is already ${quest.status}` };
    }
  }
  for (const id of pool.recruits || []) {
    if (!world.recruits?.[id]) return { error: `Draft pool: unknown recruit ${id}` };
  }
  for (const id of pool.items || []) {
    if (!world.items?.[id]) return { error: `Draft pool: unknown item ${id}` };
  }
  for (const id of pool.intel || []) {
    if (!world.intel?.[id]) return { error: `Draft pool: unknown intel ${id}` };
  }
  return null;
}

/**
 * Starts a pending draft: fixes the base order (lowest standing first, ties by
 * roll) and opens favor swaps if any party holds a favor it could call in.
 */
export function startDraft(world: any): EngineEvent[] | RuleError {
  normalizeWorld(world);
  const draft = world.draft;
  if (!draft || draft.status !== 'pending') return [];

  const invalid = validatePool(world);
  if (invalid) return invalid;

  draft.id = draft.id || `draft_t${world.turn}`;
  draft.turn = Number(world.turn) || 0;
  draft.picksPerParty = Number(draft.picksPerParty) || DEFAULT_PICKS_PER_PARTY;
  draft.pool = Object.fromEntries(POOL_KINDS.map(k => [k, [...(draft.pool?.[k] || [])]]));
  draft.picks = [];
  draft.invites = [];
  draft.swaps = [];
  draft.swapRequests = [];
  draft.pickIndex = 0;

  const seed = ensureSeed(world);
  const standings = computeStandings(world);
  const tiebreak = (p: string) => rollDice(seed, `${draft.id}:order:${p}`).reduce((a, b) => a + b, 0);
  draft.baseOrder = [...standings]
    .sort((a, b) =>
      a.reputation - b.reputation ||
      a.questsCompleted - b.questsCompleted ||
      tiebreak(b.partyId) - tiebreak(a.partyId) ||
      a.partyId.localeCompare(b.partyId)
    )
    .map(s => s.partyId);

  const events: EngineEvent[] = [
    event(world, 'draft_started', `Draft ${draft.label || draft.id} opens. Order: ${draft.baseOrder.join(' → ')}`, draft.baseOrder)
  ];

  const creditors = draft.baseOrder.filter((p: string) =>
    Object.values<any>(world.favors || {}).some(f => f.owedTo === p && f.status === 'owed' && draft.baseOrder.includes(f.owedBy))
  );

  world.phase = 'draft';
  if (creditors.length > 0) {
    draft.status = 'ordering';
    draft.awaiting = creditors;
  } else {
    beginPicking(world, events);
  }

  world.chronicle.push(...events);
  return events;
}

function beginPicking(world: any, events: EngineEvent[]): void {
  const draft = world.draft;
  draft.sequence = buildSequence(draft.baseOrder, draft.picksPerParty);
  draft.status = 'picking';
  draft.awaiting = [];
  events.push(event(world, 'draft_order', `Pick order: ${draft.sequence.join(', ')}`, draft.baseOrder));
}

/** Who must respond now, and in which mode */
export function currentDraftActors(world: any): Array<{ party: string; mode: DraftMode }> {
  const draft = world.draft;
  if (!draft) return [];
  if (draft.status === 'ordering') return (draft.awaiting || []).map((p: string) => ({ party: p, mode: 'order' as const }));
  if (draft.status === 'answering') return (draft.awaiting || []).map((p: string) => ({ party: p, mode: 'answer' as const }));
  if (draft.status === 'picking' && draft.pickIndex < draft.sequence.length) {
    return [{ party: draft.sequence[draft.pickIndex], mode: 'pick' }];
  }
  return [];
}

function activeQuestCount(world: any, partyId: string): number {
  return Object.values<any>(world.quests || {}).filter(
    q => (q.acceptedBy || []).includes(partyId) && (q.status === 'open' || q.status === 'accepted')
  ).length;
}

function hiredCount(world: any, partyId: string): number {
  return Object.values<any>(world.recruits || {}).filter(r => r.status === 'hired' && r.hiredBy === partyId).length;
}

/**
 * Checks a draft response without changing anything.
 */
export function validateDraftResponse(world: any, partyId: string, input: DraftResponseInput | undefined): RuleError | null {
  const draft = world.draft;
  if (!isDraftActive(world)) return { error: 'No draft is in progress' };
  if (!input || typeof input !== 'object') return { error: 'Draft responses need proposal.draft' };

  const actor = currentDraftActors(world).find(a => a.party === partyId);
  if (!actor) {
    return { error: `Not ${partyId}'s turn in the draft`, details: { expected: currentDraftActors(world) } };
  }

  if (actor.mode === 'order') {
    if (input.pick || input.respond) return { error: 'Only a favor swap (or nothing) may be sent while the order is being set' };
    if (input.swap) {
      const favor = world.favors?.[input.swap.favorId];
      if (!favor || favor.owedTo !== partyId || favor.status !== 'owed') {
        return { error: `Favor ${input.swap?.favorId} is not an open favor owed to ${partyId}` };
      }
      if (!draft.baseOrder.includes(favor.owedBy)) return { error: `${favor.owedBy} is not in this draft` };
    }
    return null;
  }

  if (input.swap) return { error: 'Favor swaps are only possible before picking starts' };

  // Answers to invitations
  let accepted = 0;
  for (const answer of input.respond || []) {
    const invite = (draft.invites || []).find((i: DraftInvite) => i.id === answer.inviteId);
    if (!invite || invite.to !== partyId || invite.status !== 'pending') {
      return { error: `Invitation ${answer.inviteId} is not pending for ${partyId}` };
    }
    if (answer.accept) {
      accepted++;
      if (activeQuestCount(world, partyId) + accepted > MAX_ACTIVE_QUESTS) {
        return { error: `Quest limit exceeded: ${partyId} already pursues a quest and cannot accept` };
      }
    }
  }
  const pendingForMe = (draft.invites || []).filter((i: DraftInvite) => i.to === partyId && i.status === 'pending');
  const answered = new Set((input.respond || []).map(a => a.inviteId));
  const unanswered = pendingForMe.filter((i: DraftInvite) => !answered.has(i.id));
  if (unanswered.length > 0) {
    return { error: `Answer every pending invitation first: ${unanswered.map((i: DraftInvite) => i.id).join(', ')}` };
  }

  if (actor.mode === 'answer') {
    if (input.pick) return { error: 'No picks remain; only answers to invitations are expected' };
    return null;
  }

  // Picking: accepting an invitation uses the pick
  if (accepted > 0) {
    if (input.pick) return { error: 'Accepting an invitation uses this pick; do not send a pick as well' };
    return null;
  }
  if (!input.pick) return { error: 'A pick is required (use kind "pass" to pass)' };

  const { kind, id, target } = input.pick;
  if (kind === 'pass') return null;
  const key = poolKey(kind);
  if (!key) return { error: `Unknown pick kind: ${kind}` };
  if (!id || !(draft.pool[key] || []).includes(id)) {
    return { error: `${kind} ${id} is not available in the draft pool`, details: { available: draft.pool[key] } };
  }

  switch (kind) {
    case 'quest': {
      const quest = world.quests?.[id];
      if (!quest || (quest.status !== 'open' && quest.status !== 'accepted')) {
        return { error: `Quest ${id} is no longer available` };
      }
      if (activeQuestCount(world, partyId) >= MAX_ACTIVE_QUESTS) {
        return { error: `Quest limit exceeded: ${partyId} already pursues a quest` };
      }
      if (target !== undefined) {
        if (quest.type !== 'joint') return { error: 'Only joint quests can come with an invitation' };
        if (target === partyId || !world.parties?.[target]) return { error: 'An invitation needs another party as target' };
        if (activeQuestCount(world, target) >= MAX_ACTIVE_QUESTS) {
          return { error: `${target} already pursues a quest and could not accept` };
        }
      }
      return null;
    }
    case 'recruit':
      if (hiredCount(world, partyId) >= MAX_RECRUITS) {
        return { error: `Recruit limit exceeded: ${partyId} may employ at most ${MAX_RECRUITS} recruits` };
      }
      return null;
    default:
      return null;
  }
}

function removeFromPool(draft: any, key: string, id: string): void {
  draft.pool[key] = (draft.pool[key] || []).filter((x: string) => x !== id);
}

/**
 * Applies a validated draft response and advances the draft.
 */
export function applyDraftResponse(
  world: any,
  partyId: string,
  input: DraftResponseInput,
  meta: { reasoning?: string; voices?: Record<string, string> } = {}
): EngineEvent[] {
  normalizeWorld(world);
  const draft = world.draft;
  const events: EngineEvent[] = [];
  const actor = currentDraftActors(world).find(a => a.party === partyId)!;
  const turn = Number(world.turn) || 0;

  if (actor.mode === 'order') {
    if (input.swap) draft.swapRequests.push({ party: partyId, favorId: input.swap.favorId });
    draft.awaiting = draft.awaiting.filter((p: string) => p !== partyId);
    if (draft.awaiting.length === 0) {
      resolveSwaps(world, events);
      beginPicking(world, events);
    }
    world.chronicle.push(...events);
    return events;
  }

  let usedPick = false;
  for (const answer of input.respond || []) {
    const invite: DraftInvite = draft.invites.find((i: DraftInvite) => i.id === answer.inviteId);
    const quest = world.quests[invite.questId];
    if (answer.accept) {
      invite.status = 'accepted';
      quest.acceptedBy = [...new Set([...(quest.acceptedBy || []), invite.to])];
      quest.status = 'accepted';
      usedPick = actor.mode === 'pick';
      draft.picks.push({ index: draft.pickIndex, party: partyId, kind: 'accept_invite', inviteId: invite.id, id: invite.questId, target: invite.from, ...meta });
      events.push(event(world, 'draft_invite', `${partyId} accepts ${invite.from}'s invitation to "${quest.title || quest.id}"`, [partyId, invite.from]));
    } else {
      invite.status = 'declined';
      events.push(event(world, 'draft_invite', `${partyId} turns down ${invite.from}'s invitation to "${quest.title || quest.id}"`, [partyId, invite.from]));
    }
  }

  if (actor.mode === 'pick' && !usedPick && input.pick) {
    const { kind, id, target } = input.pick;
    const record: DraftPickRecord = { index: draft.pickIndex, party: partyId, kind, ...(id ? { id } : {}), ...(target ? { target } : {}), ...meta };

    switch (kind) {
      case 'quest': {
        // Quests are not exclusive: the quest stays in the pool for others to join
        const quest = world.quests[id!];
        quest.acceptedBy = [...(quest.acceptedBy || []), partyId];
        quest.status = 'accepted';
        const rivals = quest.acceptedBy.filter((p: string) => p !== partyId);
        events.push(event(
          world,
          'draft_pick',
          `${partyId} takes up "${quest.title || id}"${rivals.length ? ` (already pursued by ${rivals.join(', ')})` : ''}`,
          [partyId, ...rivals]
        ));
        if (target) {
          const invite: DraftInvite = {
            id: `inv_${draft.id}_${draft.pickIndex}`,
            from: partyId,
            to: target,
            questId: id!,
            status: 'pending',
            pickIndex: draft.pickIndex
          };
          draft.invites.push(invite);
          events.push(event(world, 'draft_invite', `${partyId} invites ${target} to share "${quest.title || id}"`, [partyId, target]));
        }
        break;
      }
      case 'recruit': {
        const recruit = world.recruits[id!];
        recruit.status = 'hired';
        recruit.hiredBy = partyId;
        recruit.hiredTurn = turn;
        recruit.hiredUntilTurn = turn + (Number(recruit.term) || 4) - 1;
        removeFromPool(draft, 'recruits', id!);
        events.push(event(world, 'draft_pick', `${partyId} hires ${recruit.name || id}`, [partyId]));
        break;
      }
      case 'item': {
        const item = world.items[id!];
        item.status = 'held';
        item.heldBy = partyId;
        removeFromPool(draft, 'items', id!);
        events.push(event(world, 'draft_pick', `${partyId} secures ${item.name || id}`, [partyId]));
        break;
      }
      case 'intel': {
        const intel = world.intel[id!];
        const party = world.parties[partyId];
        party.knowledge = [...(party.knowledge || []), { ...(intel.fact || {}), source: intel.source || 'draft intel', turn }];
        intel.boughtBy = partyId;
        removeFromPool(draft, 'intel', id!);
        // Others learn only that intel changed hands
        events.push(event(world, 'draft_pick', `${partyId} buys a piece of intel`, [partyId]));
        break;
      }
      case 'pass':
        events.push(event(world, 'draft_pick', `${partyId} passes`, [partyId]));
        break;
    }
    draft.picks.push(record);
  }

  if (actor.mode === 'pick') {
    draft.pickIndex++;
    if (draft.pickIndex >= draft.sequence.length) {
      const pendingTargets = [...new Set<string>(draft.invites.filter((i: DraftInvite) => i.status === 'pending').map((i: DraftInvite) => i.to))];
      if (pendingTargets.length > 0) {
        draft.status = 'answering';
        draft.awaiting = pendingTargets;
      } else {
        closeDraft(world, events);
      }
    }
  } else if (actor.mode === 'answer') {
    draft.awaiting = draft.awaiting.filter((p: string) => p !== partyId);
    if (draft.awaiting.length === 0) closeDraft(world, events);
  }

  world.chronicle.push(...events);
  return events;
}

function resolveSwaps(world: any, events: EngineEvent[]): void {
  const draft = world.draft;
  // Earlier positions call in their favors first
  const requests = [...draft.swapRequests].sort(
    (a: any, b: any) => draft.baseOrder.indexOf(a.party) - draft.baseOrder.indexOf(b.party)
  );
  for (const request of requests) {
    const favor = world.favors[request.favorId];
    if (!favor || favor.status !== 'owed') continue;
    const order: string[] = draft.baseOrder;
    const a = order.indexOf(request.party);
    const b = order.indexOf(favor.owedBy);
    if (a < 0 || b < 0) continue;
    if (b < a) {
      [order[a], order[b]] = [order[b], order[a]];
      favor.status = 'repaid';
      favor.repaidTurn = Number(world.turn) || 0;
      draft.swaps.push({ party: request.party, with: favor.owedBy, favorId: request.favorId });
      events.push(event(
        world,
        'draft_order',
        `${request.party} calls in a favor and takes ${favor.owedBy}'s place in the pick order`,
        [request.party, favor.owedBy]
      ));
    } else {
      events.push(event(
        world,
        'draft_order',
        `${request.party} already picks before ${favor.owedBy}; the favor stays owed`,
        [request.party, favor.owedBy]
      ));
    }
  }
}

function closeDraft(world: any, events: EngineEvent[]): void {
  const draft = world.draft;
  for (const invite of draft.invites as DraftInvite[]) {
    if (invite.status === 'pending') invite.status = 'expired';
  }

  const untaken = (draft.pool.quests || []).filter((id: string) => !(world.quests[id]?.acceptedBy || []).length);
  const leftovers = {
    quests: untaken,
    recruits: [...draft.pool.recruits],
    items: [...draft.pool.items],
    intel: [...draft.pool.intel]
  };

  // Unhired recruits sign on with someone else
  for (const id of leftovers.recruits) {
    const recruit = world.recruits[id];
    recruit.status = 'rival';
    events.push(event(world, 'draft_closed', `Nobody hired ${recruit.name || id}; ${recruit.name || id} signs with ${recruit.rivalEmployer || 'a rival outfit'}`));
    applyLeftoverEffects(world, recruit.ifUnhired, events, `recruit ${id}`);
  }
  // Quests nobody took stay on the board; left alone they run into their deadlines
  for (const id of leftovers.quests) {
    const quest = world.quests[id];
    events.push(event(world, 'draft_closed', `No party took up "${quest.title || id}"; it stays on the board until its deadline`));
  }

  draft.leftovers = leftovers;
  draft.status = 'closed';
  draft.awaiting = [];
  events.push(event(world, 'draft_closed', `Draft ${draft.label || draft.id} closes after ${draft.picks.length} picks`));
}

function applyLeftoverEffects(world: any, effects: Effect[] | undefined, events: EngineEvent[], source: string): void {
  for (const effect of effects || []) {
    const err = applyEffect(effect, world);
    if (err) events.push(event(world, 'engine_warning', `Engine could not apply ${source} effect ${effect.target}: ${err.error}`));
  }
}

/** The draft as a party may see it: intel titles only, picks without hidden contents */
export function publicDraftView(world: any, partyId: string): Record<string, any> {
  const draft = world.draft;
  const describeQuest = (id: string) => {
    const q = world.quests?.[id] || {};
    return { id, title: q.title, client: q.client, description: q.description, location: q.location, type: q.type, minParties: q.minParties, requiredProgress: q.requiredProgress, deadlineTurn: q.deadlineTurn, reward: q.reward, pursuedBy: q.acceptedBy || [] };
  };
  const describeRecruit = (id: string) => {
    const r = world.recruits?.[id] || {};
    return { id, name: r.name, role: r.role, personality: r.personality, grants: r.grants, unlocks: r.unlocks, term: r.term, wants: r.wants };
  };
  const describeItem = (id: string) => {
    const i = world.items?.[id] || {};
    return { id, name: i.name, description: i.description, bonus: i.bonus };
  };
  const describeIntel = (id: string) => ({ id, title: world.intel?.[id]?.title });

  const myPicksLeft = (draft.sequence || []).slice(draft.pickIndex || 0).filter((p: string) => p === partyId).length;

  return {
    id: draft.id,
    label: draft.label,
    status: draft.status,
    baseOrder: draft.baseOrder,
    remainingSequence: (draft.sequence || []).slice(draft.pickIndex || 0),
    yourPicksLeft: myPicksLeft,
    picksSoFar: (draft.picks || []).map((p: DraftPickRecord) => ({
      index: p.index,
      party: p.party,
      kind: p.kind,
      ...(p.kind === 'intel' && p.party !== partyId ? {} : { id: p.id }),
      ...(p.target ? { target: p.target } : {})
    })),
    pool: {
      quests: (draft.pool?.quests || []).map(describeQuest),
      recruits: (draft.pool?.recruits || []).map(describeRecruit),
      items: (draft.pool?.items || []).map(describeItem),
      intel: (draft.pool?.intel || []).map(describeIntel)
    },
    invitesForYou: (draft.invites || []).filter((i: DraftInvite) => i.to === partyId && i.status === 'pending'),
    invitesYouSent: (draft.invites || []).filter((i: DraftInvite) => i.from === partyId),
    swaps: draft.swaps || []
  };
}
