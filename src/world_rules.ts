/**
 * World rules: deterministic engine-side adjudication.
 *
 * AI agents decide *what* their characters attempt and declare the stakes in
 * advance. This module decides *what happens*: it rolls dice, enforces who may
 * change which part of the world, keeps the world consistent, and resolves
 * quests, deadlines and progress clocks. It contains no decision-making logic
 * for GM or parties.
 */

export interface Effect {
  target: string;
  operation: 'set' | 'add';
  value: any;
}

export interface CheckDeclaration {
  id: string;
  description?: string;
  actor: string;
  capability: string;
  situational?: number;
  opposedBy?: { party: string; capability: string };
  outcomes: {
    success: Effect[];
    partial: Effect[];
    failure: Effect[];
  };
}

export type CheckOutcome = 'success' | 'partial' | 'failure';

export interface CheckResult {
  id: string;
  turn: number;
  requestId: string;
  actor: string;
  description?: string;
  capability: string;
  rolls: number[];
  modifier: number;
  total: number;
  bonuses?: { recruit?: string; item?: string };
  showdown?: { winner: string; loser: string; winnerQuest?: string; loserQuest?: string };
  opposed?: {
    party: string;
    capability: string;
    rolls: number[];
    modifier: number;
    total: number;
  };
  outcome: CheckOutcome;
}

export interface EngineEvent {
  turn: number;
  kind:
    | 'quest_completed'
    | 'quest_failed'
    | 'quest_expired'
    | 'clock_triggered'
    | 'clock_ticked'
    | 'tie_break'
    | 'season_end'
    | 'quest_abandoned'
    | 'recruit_departed'
    | 'showdown'
    | 'recruit_lured'
    | 'draft_started'
    | 'draft_order'
    | 'draft_pick'
    | 'draft_invite'
    | 'draft_closed'
    | 'engine_warning';
  summary: string;
  questId?: string;
  clockId?: string;
  parties?: string[];
  details?: Record<string, any>;
}

export interface Actor {
  role: 'GM' | 'Player';
  partyId?: string;
}

export interface RuleError {
  error: string;
  details?: any;
}

export const MAX_ACTIVE_QUESTS = 1;
export const MAX_CHECKS_PER_RESPONSE = 2;
export const MAX_RECRUITS = 2;
/** Sabotage removes at most this much of a rival's progress per check */
export const MAX_SABOTAGE = 1;
/** After this many opposed clashes over quests, the next one between the same pair is a showdown */
export const SHOWDOWN_AFTER = 2;
export const SHOWDOWN_GAIN = 2;
export const SITUATIONAL_LIMIT = 1;
export const MISSING_CAPABILITY_MODIFIER = -1;

// Paths only the engine may write. `*` matches exactly one path segment.
const ENGINE_ONLY_PATHS = [
  'rng',
  'rng/*',
  'checkLog',
  'chronicle',
  'upkeepTurn',
  'quests/*/status',
  'quests/*/completedBy',
  'quests/*/resolvedTurn',
  'quests/*/progress',
  'quests/*/progress/*',
  'clocks/*/triggered',
  'guild/standings',
  'guild/promoted',
  'rivalries',
  'rivalries/*',
  'rivalries/*/*',
  'phase',
  'draft/*',
  'draft/*/*',
  'recruits/*/hiredUntilTurn'
];

// ---------------------------------------------------------------------------
// Deterministic dice
// ---------------------------------------------------------------------------

function hashString(input: string): number {
  // FNV-1a 32-bit
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Rolls 2d6 from a key. The same world seed and key always give the same dice,
 * so resubmitting a response cannot be used to reroll a bad result.
 */
export function rollDice(seed: number, key: string, count = 2): number[] {
  const next = mulberry32(hashString(`${seed}:${key}`));
  const rolls: number[] = [];
  for (let i = 0; i < count; i++) {
    rolls.push(1 + Math.floor(next() * 6));
  }
  return rolls;
}

export function ensureSeed(world: any): number {
  if (!world.rng || typeof world.rng.seed !== 'number') {
    world.rng = { seed: hashString(`${Date.now()}:${Math.random()}`) };
  }
  return world.rng.seed;
}

export function capabilityModifier(party: any, capability: string): number {
  const value = party?.capabilities?.[capability];
  if (typeof value !== 'number') {
    return MISSING_CAPABILITY_MODIFIER;
  }
  return Math.max(-2, Math.min(2, Math.round((value - 5) / 2.5)));
}

/**
 * A party's capability for a check: its own value, raised by a hired recruit
 * who has that capability.
 */
export function effectiveCapability(world: any, partyId: string, capability: string): { value: number | undefined; recruit?: string } {
  const own = world.parties?.[partyId]?.capabilities?.[capability];
  let best: { value: number | undefined; recruit?: string } = { value: typeof own === 'number' ? own : undefined };
  for (const [id, recruit] of Object.entries<any>(world.recruits || {})) {
    if (recruit.status !== 'hired' || recruit.hiredBy !== partyId) continue;
    const granted = recruit.grants?.capabilities?.[capability];
    if (typeof granted === 'number' && (best.value === undefined || granted > best.value)) {
      best = { value: granted, recruit: id };
    }
  }
  return best;
}

/** +1 when the party holds an item that aids this capability */
export function itemBonus(world: any, partyId: string, capability: string): { bonus: number; item?: string } {
  for (const [id, item] of Object.entries<any>(world.items || {})) {
    if (item.heldBy === partyId && item.bonus?.capability === capability) {
      return { bonus: Math.max(0, Math.min(1, Number(item.bonus.amount ?? 1))), item: id };
    }
  }
  return { bonus: 0 };
}

export function checkModifier(world: any, partyId: string, capability: string): { modifier: number; recruit?: string; item?: string } {
  const cap = effectiveCapability(world, partyId, capability);
  const base = capabilityModifier({ capabilities: { [capability]: cap.value } }, capability);
  const item = itemBonus(world, partyId, capability);
  return { modifier: base + item.bonus, recruit: cap.recruit, item: item.item };
}

function sum(values: number[]): number {
  return values.reduce((a, b) => a + b, 0);
}

export function rollCheck(
  world: any,
  check: CheckDeclaration,
  requestId: string,
  index: number,
  role: 'GM' | 'Player' = 'Player'
): CheckResult {
  const seed = ensureSeed(world);
  const turn = Number(world.turn) || 0;
  const situational = Math.max(-SITUATIONAL_LIMIT, Math.min(SITUATIONAL_LIMIT, check.situational ?? 0));

  // GM-imposed checks use their own stream so they never mirror the party's own check
  const stream = role === 'GM' ? 'gm:' : '';
  const rolls = rollDice(seed, `t${turn}:${stream}${check.actor}:c${index}`);
  const actorMod = checkModifier(world, check.actor, check.capability);
  const modifier = actorMod.modifier + situational;
  const total = sum(rolls) + modifier;

  const result: CheckResult = {
    id: check.id,
    turn,
    requestId,
    actor: check.actor,
    description: check.description,
    capability: check.capability,
    rolls,
    modifier,
    total,
    outcome: 'failure'
  };
  if (actorMod.recruit || actorMod.item) {
    result.bonuses = { recruit: actorMod.recruit, item: actorMod.item };
  }

  if (check.opposedBy) {
    const oppRolls = rollDice(seed, `t${turn}:${stream}${check.opposedBy.party}:vs:${check.actor}:c${index}`);
    const oppModifier = checkModifier(world, check.opposedBy.party, check.opposedBy.capability).modifier;
    const oppTotal = sum(oppRolls) + oppModifier;
    result.opposed = {
      party: check.opposedBy.party,
      capability: check.opposedBy.capability,
      rolls: oppRolls,
      modifier: oppModifier,
      total: oppTotal
    };
    const margin = total - oppTotal;
    result.outcome = margin >= 3 ? 'success' : margin >= 0 ? 'partial' : 'failure';
  } else {
    result.outcome = total >= 10 ? 'success' : total >= 7 ? 'partial' : 'failure';
  }

  return result;
}

// ---------------------------------------------------------------------------
// Actor identification and permissions
// ---------------------------------------------------------------------------

export function identifyActor(response: any, world: any): Actor | RuleError {
  const requestId: string = response.requestId || '';
  const participant: string = response.proposal?.participants?.[0];

  // The request a response answers decides who is acting (longest id wins: `iron` vs `iron_wolves`)
  const requestOwner = Object.keys(world.parties || {})
    .filter(partyId => requestId.startsWith(`request_${partyId}_`))
    .sort((a, b) => b.length - a.length)[0];

  if (requestOwner && requestOwner !== participant) {
    return {
      error: `Permission denied: request for ${requestOwner} cannot act as ${participant}`,
      details: { requestId, participant }
    };
  }

  if (!requestOwner && (requestId.startsWith('request_GM_') || participant === 'GM')) {
    return { role: 'GM' };
  }

  if (!world.parties || !(participant in world.parties)) {
    return {
      error: `Party not found: ${participant}`,
      details: {
        missingParty: participant,
        availableParties: Object.keys(world.parties || {})
      }
    };
  }

  return { role: 'Player', partyId: participant };
}

function splitPath(target: string): string[] {
  return target.split('/').filter(p => p);
}

function matchesPattern(parts: string[], pattern: string): boolean {
  const patternParts = pattern.split('/');
  if (patternParts.length !== parts.length) return false;
  return patternParts.every((p, i) => p === '*' || p === parts[i]);
}

function isEngineOnly(parts: string[]): boolean {
  // Writing a parent of an engine-only path is also forbidden (e.g. `quests/q1/status` via `quests/q1`
  // is allowed only for GM when creating a new quest, handled in checkGmPermission)
  return ENGINE_ONLY_PATHS.some(pattern => matchesPattern(parts, pattern));
}

interface PermissionContext {
  viaCheck?: CheckDeclaration;
}

function relationshipIncludes(key: string, partyId: string): boolean {
  return key.split('__').includes(partyId);
}

/**
 * Returns null when the effect is allowed, otherwise an error.
 */
export function checkPermission(
  actor: Actor,
  effect: Effect,
  world: any,
  ctx: PermissionContext = {}
): RuleError | null {
  const parts = splitPath(effect.target);

  if (actor.role === 'GM') {
    return checkGmPermission(parts, effect, world, ctx);
  }

  return checkPlayerPermission(actor.partyId!, parts, effect, world, ctx);
}

function denied(effect: Effect, reason: string): RuleError {
  return {
    error: `Permission denied: ${effect.target} (${reason})`,
    details: { target: effect.target, operation: effect.operation, reason }
  };
}

function checkGmPermission(parts: string[], effect: Effect, world: any, ctx: PermissionContext): RuleError | null {
  if (parts[0] === 'draft') {
    const status = world.draft?.status;
    if (status && status !== 'pending' && status !== 'closed') {
      return denied(effect, 'the draft is in progress');
    }
    if (parts.length === 1 || (parts.length === 2 && effect.operation === 'set')) {
      return null;
    }
    if (parts[1] === 'pool' || ['picksPerParty', 'id', 'status', 'label'].includes(parts[1])) {
      return null;
    }
    return denied(effect, 'only the draft setup (id, label, picksPerParty, pool, status) can be written');
  }
  if (isEngineOnly(parts)) {
    // Quest progress is earned through checks only, even for checks the GM imposes on a party
    if (ctx.viaCheck && parts[0] === 'quests' && parts[2] === 'progress' && parts.length === 4) {
      return null;
    }
    return denied(effect, 'engine-managed value');
  }

  // Creating a new quest: the engine fills in status, progress and acceptance
  if (parts[0] === 'quests' && parts.length === 2) {
    const existing = world.quests?.[parts[1]];
    if (existing && effect.operation === 'set') {
      return denied(effect, 'existing quests cannot be replaced; change individual fields instead');
    }
  }

  return null;
}

function checkPlayerPermission(
  partyId: string,
  parts: string[],
  effect: Effect,
  world: any,
  ctx: PermissionContext
): RuleError | null {
  const [root, id, field, sub] = parts;
  const opposed = ctx.viaCheck?.opposedBy?.party;

  if (root === 'quests' && field === 'progress' && parts.length === 4) {
    if (!ctx.viaCheck) {
      return denied(effect, 'quest progress can only change through a check outcome');
    }
    const quest = world.quests?.[id];
    if (!quest) return denied(effect, `quest ${id} does not exist`);
    if (effect.operation !== 'add' || typeof effect.value !== 'number') {
      return denied(effect, 'quest progress only accepts numeric add');
    }
    if (sub === partyId) return null;
    if (!(quest.acceptedBy || []).includes(sub)) {
      return denied(effect, `${sub} has not accepted quest ${id}`);
    }
    if (effect.value > 0) return null; // assisting another party
    if (sub === opposed) {
      // sabotage requires an opposed check, and only chips away
      if (effect.value < -MAX_SABOTAGE) {
        return denied(effect, `sabotage removes at most ${MAX_SABOTAGE} progress per check`);
      }
      return null;
    }
    return denied(effect, 'reducing another party\'s progress requires a check opposed by that party');
  }

  if (isEngineOnly(parts)) {
    return denied(effect, 'engine-managed value');
  }

  if (root === 'parties') {
    if (id === partyId) {
      if (parts.length < 3) {
        return denied(effect, 'write individual fields of the party, not the whole party');
      }
      if (field === 'reputation') {
        return denied(effect, 'reputation is granted by quests and the GM');
      }
      if (field === 'capabilities') {
        return denied(effect, 'capabilities are set by the GM');
      }
      if (field === 'inventory' && !ctx.viaCheck) {
        return denied(effect, 'items are gained through a check outcome or from the GM');
      }
      return null;
    }
    if (opposed && id === opposed && ['morale', 'resources', 'inventory'].includes(field)) return null;
    return denied(effect, 'parties may only change their own state (or an opponent\'s morale, resources or inventory through an opposed check)');
  }

  if (root === 'quests') {
    const quest = world.quests?.[id];
    if (!quest) return denied(effect, `quest ${id} does not exist`);

    if (field === 'acceptedBy' && parts.length === 3) {
      const value = Array.isArray(effect.value) ? effect.value : [effect.value];
      if (effect.operation !== 'add' || value.length !== 1 || value[0] !== partyId) {
        return denied(effect, 'a party may only add itself to acceptedBy');
      }
      return null;
    }

    if (field === 'abandonedBy' && parts.length === 3) {
      const status = quest.status ?? 'open';
      if (status !== 'open' && status !== 'accepted') {
        return denied(effect, `quest ${id} is already ${status}`);
      }
      const value = Array.isArray(effect.value) ? effect.value : [effect.value];
      if (effect.operation !== 'add' || value.length !== 1 || value[0] !== partyId) {
        return denied(effect, 'a party may only abandon a quest for itself');
      }
      if (!(quest.acceptedBy || []).includes(partyId)) {
        return denied(effect, `${partyId} has not accepted quest ${id}`);
      }
      return null;
    }

    if (field === 'secret' && sub === 'revealedTo' && parts.length === 4) {
      if (!ctx.viaCheck) return denied(effect, 'secrets are uncovered through a check outcome');
      const value = Array.isArray(effect.value) ? effect.value : [effect.value];
      if (effect.operation !== 'add' || value.length !== 1 || value[0] !== partyId) {
        return denied(effect, 'a party may only reveal a secret to itself');
      }
      return null;
    }

    return denied(effect, 'quest definitions are controlled by the GM');
  }

  if (root === 'relationships') {
    if (id && relationshipIncludes(id, partyId)) return null;
    return denied(effect, 'parties may only change relationships they are part of');
  }

  if (root === 'favors') {
    // A party may acknowledge a debt it owes, or mark its own debt as repaid
    if (parts.length === 2 && effect.operation === 'set') {
      if (world.favors?.[id]) {
        return denied(effect, `favor ${id} already exists`);
      }
      if (effect.value?.owedBy === partyId && effect.value?.owedTo && effect.value.owedTo !== partyId) {
        return null;
      }
      return denied(effect, 'a party may only record favors it owes (owedBy must be itself)');
    }
    if (parts.length === 3 && field === 'status') {
      const favor = world.favors?.[id];
      if (favor && favor.owedBy === partyId) return null;
      return denied(effect, 'only the debtor may update a favor\'s status');
    }
    return denied(effect, 'unsupported favor operation');
  }

  if (root === 'recruits' && field === 'hiredBy' && parts.length === 3) {
    const recruit = world.recruits?.[id];
    if (!recruit || recruit.status !== 'hired') return denied(effect, `recruit ${id} is not employed`);
    if (effect.operation !== 'set' || effect.value !== partyId) {
      return denied(effect, 'a party may only lure a recruit to itself');
    }
    if (!ctx.viaCheck || opposed !== recruit.hiredBy) {
      return denied(effect, 'luring a recruit away requires a check opposed by the current employer');
    }
    return null;
  }

  if (root === 'items' && field === 'heldBy' && parts.length === 3) {
    const item = world.items?.[id];
    if (!item) return denied(effect, `item ${id} does not exist`);
    if (effect.operation !== 'set' || typeof effect.value !== 'string' || !world.parties?.[effect.value]) {
      return denied(effect, 'heldBy must be set to a party id');
    }
    if (item.heldBy === partyId) return null; // giving away one's own item
    if (effect.value === partyId && ctx.viaCheck && opposed === item.heldBy) return null; // taking it
    return denied(effect, 'an item changes hands only when its holder gives it, or through a check opposed by the holder');
  }

  if (root === 'regions' && field === 'influence' && sub === partyId && parts.length === 4) {
    if (!ctx.viaCheck) return denied(effect, 'influence is earned through a check outcome');
    if (world.parties?.[partyId]?.location !== id) {
      return denied(effect, 'influence can only be earned in the party\'s current region');
    }
    return null;
  }

  return denied(effect, 'outside the party\'s sphere of action');
}

// ---------------------------------------------------------------------------
// Effect application
// ---------------------------------------------------------------------------

export function applyEffect(effect: Effect, world: any): RuleError | null {
  const parts = splitPath(effect.target);
  if (parts.length === 1 && parts[0] === 'draft') {
    // The draft setup is written whole: { status: "pending", picksPerParty, pool }
    if (effect.operation !== 'set') return { error: 'The draft setup can only be set as a whole' };
    world.draft = effect.value;
    return null;
  }
  if (parts.length < 2) {
    return {
      error: 'Invalid target path',
      details: {
        providedPath: effect.target,
        parsedParts: parts,
        expectedFormat: 'path/to/property (minimum 2 levels)',
        examples: ['parties/party_id/morale', 'quests/quest_id/acceptedBy', 'clocks/clock_id/filled']
      }
    };
  }

  let current = world;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    if (current[key] === undefined || current[key] === null) {
      if (i === 1 && parts[0] === 'parties') {
        return {
          error: `Party not found: ${parts[1]}`,
          details: {
            missingParty: parts[1],
            availableParties: Object.keys(world.parties || {}),
            suggestedFix: 'Check party ID spelling or ensure party exists in world state'
          }
        };
      }
      // Top-level collections introduced by the quest system are created on demand
      if (i === 0 && ['quests', 'clocks', 'favors', 'npcs', 'threads', 'guild', 'recruits', 'items', 'intel', 'draft'].includes(key)) {
        current[key] = {};
      } else {
        return {
          error: `Path not found: ${parts.slice(0, i + 1).join('/')}`,
          details: {
            targetPath: effect.target,
            failedAt: parts.slice(0, i + 1).join('/'),
            availableKeys: current && typeof current === 'object' ? Object.keys(current) : 'Not an object'
          }
        };
      }
    }
    current = current[key];
    if (typeof current !== 'object') {
      return {
        error: `Path not found: ${parts.slice(0, i + 1).join('/')} is not an object`,
        details: { targetPath: effect.target }
      };
    }
  }

  const finalKey = parts[parts.length - 1];

  if (finalKey === 'currency' && effect.operation === 'add' && typeof effect.value === 'number' && effect.value < 0) {
    const currentValue = current[finalKey] || 0;
    if (currentValue + effect.value < 0) {
      return {
        error: 'Invalid action: insufficient currency',
        details: {
          operation: 'currency_payment',
          required: Math.abs(effect.value),
          available: currentValue,
          shortfall: Math.abs(effect.value) - currentValue,
          suggestedFix: 'Reduce payment amount or ensure sufficient currency before transaction'
        }
      };
    }
  }

  if (effect.operation === 'set') {
    current[finalKey] = effect.value;
    return null;
  }

  const existing = current[finalKey];
  if (existing === undefined || existing === null) {
    current[finalKey] = effect.value;
  } else if (typeof existing === 'number') {
    if (typeof effect.value !== 'number') {
      return { error: `Type mismatch: cannot add non-number to ${effect.target}`, details: { value: effect.value } };
    }
    current[finalKey] = existing + effect.value;
  } else if (Array.isArray(existing)) {
    const items = Array.isArray(effect.value) ? effect.value : [effect.value];
    current[finalKey] = [...existing, ...items];
  } else if (typeof existing === 'object') {
    if (typeof effect.value !== 'object' || Array.isArray(effect.value)) {
      return { error: `Type mismatch: cannot add non-object to ${effect.target}`, details: { value: effect.value } };
    }
    current[finalKey] = { ...existing, ...effect.value };
  } else {
    current[finalKey] = effect.value;
  }
  return null;
}

// ---------------------------------------------------------------------------
// World normalization and invariants
// ---------------------------------------------------------------------------

export function normalizeQuest(id: string, quest: any, turn: number): any {
  const normalized = {
    id,
    type: 'exclusive',
    requiredProgress: 3,
    status: 'open',
    issuedTurn: turn,
    ...quest
  };
  if (!Array.isArray(normalized.acceptedBy)) normalized.acceptedBy = [];
  if (!Array.isArray(normalized.abandonedBy)) normalized.abandonedBy = [];
  if (!normalized.progress || typeof normalized.progress !== 'object') normalized.progress = {};
  if (normalized.status === 'open' && normalized.acceptedBy.length > 0) normalized.status = 'accepted';
  return normalized;
}

// Fields a newly issued quest always starts with, whatever the issuer wrote
function resetNewQuest(quest: any, turn: number): void {
  quest.status = 'open';
  quest.progress = {};
  quest.completedBy = undefined;
  quest.resolvedTurn = undefined;
  quest.issuedTurn = turn;
  quest.abandonedBy = [];
  if ((quest.acceptedBy || []).length > 0) quest.status = 'accepted';
}

export function normalizeWorld(world: any): void {
  const turn = Number(world.turn) || 0;
  world.quests = world.quests || {};
  for (const [id, quest] of Object.entries<any>(world.quests)) {
    world.quests[id] = normalizeQuest(id, quest, turn);
  }
  world.clocks = world.clocks || {};
  for (const [id, clock] of Object.entries<any>(world.clocks)) {
    world.clocks[id] = { id, segments: 4, filled: 0, triggered: false, ...clock };
  }
  world.favors = world.favors || {};
  world.npcs = world.npcs || {};
  world.recruits = world.recruits || {};
  for (const [id, recruit] of Object.entries<any>(world.recruits)) {
    world.recruits[id] = { id, status: 'available', term: 4, ...recruit };
  }
  world.items = world.items || {};
  for (const [id, item] of Object.entries<any>(world.items)) {
    world.items[id] = { id, status: item.heldBy ? 'held' : 'available', ...item };
  }
  world.intel = world.intel || {};
  world.threads = world.threads || {};
  world.checkLog = Array.isArray(world.checkLog) ? world.checkLog : [];
  world.rivalries = world.rivalries && typeof world.rivalries === 'object' ? world.rivalries : {};
  world.chronicle = Array.isArray(world.chronicle) ? world.chronicle : [];
}

function activeQuestCount(world: any, partyId: string): number {
  return Object.values<any>(world.quests || {}).filter(
    q => (q.acceptedBy || []).includes(partyId) && (q.status === 'open' || q.status === 'accepted')
  ).length;
}

/**
 * Validates and repairs the world after a response's effects were applied to a draft.
 * `before` is the state prior to this response.
 */
export function enforceInvariants(before: any, draft: any, actor: Actor): RuleError | null {
  normalizeWorld(draft);
  const turn = Number(draft.turn) || 0;

  for (const [questId, quest] of Object.entries<any>(draft.quests)) {
    if (!before.quests?.[questId]) resetNewQuest(quest, turn);
  }

  // Abandoning a quest withdraws the party and forfeits its progress
  for (const [questId, quest] of Object.entries<any>(draft.quests)) {
    const prevAbandoned: string[] = before.quests?.[questId]?.abandonedBy || [];
    for (const partyId of quest.abandonedBy as string[]) {
      if (prevAbandoned.includes(partyId)) continue;
      quest.acceptedBy = (quest.acceptedBy as string[]).filter(p => p !== partyId);
      delete quest.progress[partyId];
      adjustDisposition(draft, quest.client, partyId, -1, `turn ${turn}: ${partyId} abandoned "${quest.title || questId}"`);
      draft.chronicle.push({
        turn,
        kind: 'quest_abandoned',
        questId,
        parties: [partyId],
        summary: `${partyId} abandons ${quest.title || questId}`
      });
    }
    if (quest.status === 'accepted' && quest.acceptedBy.length === 0) quest.status = 'open';
  }

  // Resources may never go negative
  for (const [partyId, party] of Object.entries<any>(draft.parties || {})) {
    const negative = findNegative(party.resources, `parties/${partyId}/resources`);
    if (negative) {
      return {
        error: `Invalid action: insufficient ${negative.key}`,
        details: { path: negative.path, value: negative.value }
      };
    }
    if (typeof party.morale === 'number') {
      party.morale = Math.max(0, Math.min(10, party.morale));
    }
  }

  // Movement must follow the region graph (parties walk; the GM may relocate anyone)
  for (const [partyId, party] of Object.entries<any>(draft.parties || {})) {
    const prev = before.parties?.[partyId];
    if (!prev || prev.location === party.location) continue;
    if (!draft.regions?.[party.location]) {
      return { error: `Region not found: ${party.location}`, details: { partyId } };
    }
    if (actor.role === 'Player') {
      const neighbors: string[] = before.regions?.[prev.location]?.neighbors || [];
      if (!neighbors.includes(party.location)) {
        return {
          error: `Invalid move: ${party.location} is not adjacent to ${prev.location}`,
          details: { partyId, from: prev.location, to: party.location, neighbors }
        };
      }
    }
    syncOccupancy(draft, partyId, prev.location, party.location);
  }

  // Recruits: track who lured whom, and cap how many a party can employ
  for (const [recruitId, recruit] of Object.entries<any>(draft.recruits)) {
    const prevEmployer = before.recruits?.[recruitId]?.hiredBy;
    if (recruit.status === 'hired' && prevEmployer && recruit.hiredBy !== prevEmployer) {
      draft.chronicle.push({
        turn,
        kind: 'recruit_lured',
        parties: [recruit.hiredBy, prevEmployer],
        summary: `${recruit.name || recruitId} leaves ${prevEmployer} for ${recruit.hiredBy}`
      });
    }
  }
  for (const partyId of Object.keys(draft.parties || {})) {
    const employed = Object.values<any>(draft.recruits).filter(r => r.status === 'hired' && r.hiredBy === partyId).length;
    const before_ = Object.values<any>(before.recruits || {}).filter(r => r.status === 'hired' && r.hiredBy === partyId).length;
    if (employed > MAX_RECRUITS && employed > before_) {
      return { error: `Recruit limit exceeded: ${partyId} may employ at most ${MAX_RECRUITS} recruits`, details: { partyId } };
    }
  }

  // Quest acceptance rules
  for (const [questId, quest] of Object.entries<any>(draft.quests)) {
    const prevAccepted: string[] = before.quests?.[questId]?.acceptedBy || [];
    const added = (quest.acceptedBy as string[]).filter(p => !prevAccepted.includes(p));
    if (added.length === 0) continue;
    const abandoned = (quest.abandonedBy as string[]).filter(p => added.includes(p));
    if (abandoned.length > 0) {
      return { error: `Quest ${questId} was abandoned by ${abandoned.join(', ')} and cannot be taken up again`, details: { questId } };
    }
    if (quest.status !== 'open' && quest.status !== 'accepted') {
      return { error: `Quest ${questId} is no longer available (status: ${quest.status})`, details: { questId } };
    }
    if (new Set(quest.acceptedBy).size !== quest.acceptedBy.length) {
      return { error: `Quest ${questId} already accepted by this party`, details: { questId } };
    }
    for (const partyId of added) {
      if (!draft.parties?.[partyId]) {
        return { error: `Party not found: ${partyId}`, details: { questId } };
      }
      if (activeQuestCount(draft, partyId) > MAX_ACTIVE_QUESTS) {
        return {
          error: `Quest limit exceeded: ${partyId} may hold at most ${MAX_ACTIVE_QUESTS} active quests`,
          details: { questId, partyId }
        };
      }
    }
    quest.status = 'accepted';
  }

  // Progress requires presence at the quest site. It may dip below zero while a
  // turn's responses are applied, and is clamped once at the end of the turn so
  // that the order in which responses are processed does not matter
  for (const [questId, quest] of Object.entries<any>(draft.quests)) {
    const prevProgress = before.quests?.[questId]?.progress || {};
    for (const [partyId, value] of Object.entries<any>(quest.progress)) {
      if (typeof value !== 'number') {
        return { error: `Invalid progress value for ${partyId} on ${questId}`, details: { value } };
      }
      const delta = value - (prevProgress[partyId] || 0);
      // Advancing, assisting and sabotaging all happen at the quest site
      if (delta !== 0 && quest.location && actor.role === 'Player') {
        const loc = draft.parties?.[actor.partyId!]?.location;
        if (loc !== quest.location) {
          return {
            error: `Invalid action: quest ${questId} must be pursued at ${quest.location} (party is at ${loc})`,
            details: { questId, required: quest.location, current: loc }
          };
        }
      }
      if (delta !== 0 && !(quest.acceptedBy || []).includes(partyId)) {
        return { error: `${partyId} has not accepted quest ${questId}`, details: { questId } };
      }
    }
  }

  return null;
}

function findNegative(obj: any, basePath: string): { key: string; path: string; value: number } | null {
  if (!obj || typeof obj !== 'object') return null;
  for (const [key, value] of Object.entries<any>(obj)) {
    const p = `${basePath}/${key}`;
    if (typeof value === 'number' && value < 0) return { key, path: p, value };
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const nested = findNegative(value, p);
      if (nested) return nested;
    }
  }
  return null;
}

function syncOccupancy(world: any, partyId: string, from: string, to: string): void {
  const fromRegion = world.regions?.[from];
  if (fromRegion && Array.isArray(fromRegion.occupantParties)) {
    fromRegion.occupantParties = fromRegion.occupantParties.filter((p: string) => p !== partyId);
  }
  const toRegion = world.regions?.[to];
  if (toRegion) {
    const list: string[] = Array.isArray(toRegion.occupantParties) ? toRegion.occupantParties : [];
    if (!list.includes(partyId)) list.push(partyId);
    toRegion.occupantParties = list;
  }
}

// ---------------------------------------------------------------------------
// Response execution
// ---------------------------------------------------------------------------

export interface ExecutionResult {
  success: boolean;
  error?: string;
  details?: any;
  actor?: Actor;
  checks?: CheckResult[];
  appliedEffects?: Effect[];
}

function validateCheckDeclaration(check: any, actor: Actor, world: any, index: number): RuleError | null {
  const where = `checks[${index}]`;
  if (!check || typeof check !== 'object') return { error: `${where} must be an object` };
  if (!world.parties?.[check.actor]) {
    return { error: `${where}: Party not found: ${check.actor}` };
  }
  if (actor.role === 'Player' && check.actor !== actor.partyId) {
    return { error: `${where}: a party may only roll for itself (actor must be ${actor.partyId})` };
  }
  if (check.opposedBy) {
    if (!world.parties?.[check.opposedBy.party]) {
      return { error: `${where}: Party not found: ${check.opposedBy.party}` };
    }
    if (check.opposedBy.party === check.actor) {
      return { error: `${where}: a party cannot oppose itself` };
    }
  }
  return null;
}

/**
 * Applies one decision response to the world. All-or-nothing: on error the
 * world is left untouched.
 */
export function executeResponse(response: any, world: any): ExecutionResult {
  const identified = identifyActor(response, world);
  if ('error' in identified) {
    return { success: false, error: identified.error, details: identified.details };
  }
  const actor = identified;

  const effects: Effect[] = response.proposal.effects || [];
  const checks: CheckDeclaration[] = response.proposal.checks || [];

  if (checks.length > MAX_CHECKS_PER_RESPONSE) {
    return { success: false, error: `Too many checks: at most ${MAX_CHECKS_PER_RESPONSE} per response` };
  }

  // Validate every effect in every branch before any dice are rolled
  for (const effect of effects) {
    const denial = checkPermission(actor, effect, world);
    if (denial) return { success: false, ...denial };
  }
  for (let i = 0; i < checks.length; i++) {
    const check = checks[i];
    const invalid = validateCheckDeclaration(check, actor, world, i);
    if (invalid) return { success: false, ...invalid };
    for (const outcome of ['success', 'partial', 'failure'] as const) {
      let sabotage = 0;
      for (const effect of check.outcomes[outcome]) {
        const denial = checkPermission(actor, effect, world, { viaCheck: check });
        if (denial) {
          return { success: false, error: `checks[${i}].outcomes.${outcome}: ${denial.error}`, details: denial.details };
        }
        if (actor.role === 'Player' && isRivalProgressLoss(effect, check.actor)) sabotage += effect.value;
      }
      if (sabotage < -MAX_SABOTAGE) {
        return { success: false, error: `checks[${i}].outcomes.${outcome}: sabotage removes at most ${MAX_SABOTAGE} progress per check` };
      }
    }
  }

  const draft = structuredClone(world);
  normalizeWorld(draft);
  const applied: Effect[] = [];

  for (const effect of effects) {
    const err = applyEffect(effect, draft);
    if (err) return { success: false, ...err };
    applied.push(effect);
  }

  const results: CheckResult[] = [];
  const showdowns: CheckResult[] = [];
  for (let i = 0; i < checks.length; i++) {
    const result = rollCheck(draft, checks[i], response.requestId, i, actor.role);
    if (trackRivalry(draft, checks[i], result)) showdowns.push(result);
    results.push(result);
    for (const effect of checks[i].outcomes[result.outcome]) {
      const err = applyEffect(effect, draft);
      if (err) {
        return { success: false, error: `checks[${i}] ${result.outcome}: ${err.error}`, details: err.details };
      }
      applied.push(effect);
    }
  }

  const violation = enforceInvariants(world, draft, actor);
  if (violation) return { success: false, ...violation };

  // Showdown consequences are the engine's, so they bypass the actor's location rules
  for (const result of showdowns) applyShowdown(draft, result);

  draft.checkLog.push(...results);

  // Commit the draft
  for (const key of Object.keys(world)) delete world[key];
  Object.assign(world, draft);

  return { success: true, actor, checks: results, appliedEffects: applied };
}

// ---------------------------------------------------------------------------
// Rivalries and showdowns
// ---------------------------------------------------------------------------

function isRivalProgressLoss(effect: Effect, actorParty: string): boolean {
  const parts = splitPath(effect.target);
  return parts[0] === 'quests' && parts[2] === 'progress' && parts.length === 4 &&
    parts[3] !== actorParty && typeof effect.value === 'number' && effect.value < 0;
}

export function rivalryKey(a: string, b: string): string {
  return [a, b].sort().join('__');
}

function touchesQuestProgress(check: CheckDeclaration): boolean {
  const parties = [check.actor, check.opposedBy?.party];
  return (['success', 'partial', 'failure'] as const).some(outcome =>
    (check.outcomes[outcome] || []).some(effect => {
      const parts = splitPath(effect.target);
      return parts[0] === 'quests' && parts[2] === 'progress' && parties.includes(parts[3]);
    })
  );
}

/** The quest a party is pursuing (parties hold one quest at a time) */
export function activeQuestOf(world: any, partyId: string): string | undefined {
  return Object.values<any>(world.quests || {}).find(
    q => (q.acceptedBy || []).includes(partyId) && (q.status === 'open' || q.status === 'accepted')
  )?.id;
}

/**
 * Counts opposed clashes over quests between two parties. Once they have
 * clashed SHOWDOWN_AFTER times, the next clash is a showdown: no partial
 * result, the winner surges ahead and the loser's progress is wiped.
 * Returns true when this check is a showdown.
 */
function trackRivalry(world: any, check: CheckDeclaration, result: CheckResult): boolean {
  if (!check.opposedBy || !result.opposed || !touchesQuestProgress(check)) return false;
  const key = rivalryKey(check.actor, check.opposedBy.party);
  const rivalry = world.rivalries[key] || { clashes: 0, showdowns: 0 };
  world.rivalries[key] = rivalry;
  rivalry.lastTurn = Number(world.turn) || 0;

  if (rivalry.clashes < SHOWDOWN_AFTER) {
    rivalry.clashes++;
    return false;
  }

  const margin = result.total - result.opposed.total;
  result.outcome = margin >= 0 ? 'success' : 'failure';
  const winner = margin >= 0 ? check.actor : check.opposedBy.party;
  const loser = winner === check.actor ? check.opposedBy.party : check.actor;
  result.showdown = { winner, loser, winnerQuest: activeQuestOf(world, winner), loserQuest: activeQuestOf(world, loser) };
  rivalry.clashes = 0;
  rivalry.showdowns++;
  return true;
}

function applyShowdown(world: any, result: CheckResult): void {
  const showdown = result.showdown!;
  const turn = Number(world.turn) || 0;
  if (showdown.winnerQuest) {
    const quest = world.quests[showdown.winnerQuest];
    quest.progress[showdown.winner] = Math.max(0, quest.progress[showdown.winner] || 0) + SHOWDOWN_GAIN;
  }
  if (showdown.loserQuest) {
    const quest = world.quests[showdown.loserQuest];
    quest.progress[showdown.loser] = 0;
  }
  world.chronicle.push({
    turn,
    kind: 'showdown',
    parties: [showdown.winner, showdown.loser],
    summary: `Showdown: ${showdown.winner} defeats ${showdown.loser}` +
      (showdown.winnerQuest ? `, surging ahead on ${world.quests[showdown.winnerQuest].title || showdown.winnerQuest}` : '') +
      (showdown.loserQuest ? `; ${showdown.loser} loses all progress on ${world.quests[showdown.loserQuest].title || showdown.loserQuest}` : ''),
    details: { check: result.id, rolls: result.rolls, opposed: result.opposed }
  });
}

// ---------------------------------------------------------------------------
// Quest resolution, deadlines and clocks
// ---------------------------------------------------------------------------

function applyEngineEffects(world: any, effects: Effect[] | undefined, events: EngineEvent[], source: string): void {
  for (const effect of effects || []) {
    const err = applyEffect(effect, world);
    if (err) {
      events.push({
        turn: Number(world.turn) || 0,
        kind: 'engine_warning',
        summary: `Engine could not apply ${source} effect ${effect.target}: ${err.error}`,
        details: { effect, error: err.error }
      });
    }
  }
}

function grantReward(world: any, partyId: string, reward: any, share: number, receivesItems: boolean): void {
  const party = world.parties?.[partyId];
  if (!party || !reward) return;
  if (typeof reward.reputation === 'number') {
    party.reputation = (party.reputation || 0) + Math.round(reward.reputation * share);
  }
  if (typeof reward.currency === 'number') {
    party.resources = party.resources || {};
    party.resources.currency = (party.resources.currency || 0) + Math.round(reward.currency * share);
  }
  if (Array.isArray(reward.items) && receivesItems) {
    party.inventory = [...(party.inventory || []), ...reward.items];
  }
}

function adjustDisposition(world: any, npcId: string | undefined, partyId: string, delta: number, memory: string): void {
  if (!npcId) return;
  const npc = world.npcs?.[npcId];
  if (!npc) return;
  npc.disposition = npc.disposition || {};
  npc.disposition[partyId] = Math.max(-5, Math.min(5, (npc.disposition[partyId] || 0) + delta));
  npc.memory = [...(npc.memory || []), memory];
}

function failQuest(world: any, quest: any, kind: 'quest_failed' | 'quest_expired', reason: string, events: EngineEvent[]): void {
  const turn = Number(world.turn) || 0;
  quest.status = kind === 'quest_expired' ? 'expired' : 'failed';
  quest.resolvedTurn = turn;
  for (const partyId of quest.acceptedBy || []) {
    adjustDisposition(world, quest.client, partyId, -1, `turn ${turn}: ${partyId} did not deliver "${quest.title || quest.id}"`);
  }
  events.push({
    turn,
    kind,
    questId: quest.id,
    parties: [...(quest.acceptedBy || [])],
    summary: `${quest.title || quest.id}: ${reason}`
  });
  applyEngineEffects(world, quest.onFail, events, `quest ${quest.id} onFail`);
  if (quest.advancesClock?.clockId) {
    tickClock(world, quest.advancesClock.clockId, quest.advancesClock.amount ?? 1, `quest ${quest.id} ${quest.status}`, events);
  }
}

function completeQuest(world: any, quest: any, winners: string[], shares: Record<string, number>, events: EngineEvent[]): void {
  const turn = Number(world.turn) || 0;
  quest.status = 'completed';
  quest.completedBy = winners;
  quest.resolvedTurn = turn;
  // Items go to the largest contributor
  const itemHolder = [...winners].sort((a, b) => (shares[b] ?? 1) - (shares[a] ?? 1) || a.localeCompare(b))[0];
  for (const partyId of winners) {
    grantReward(world, partyId, quest.reward, shares[partyId] ?? 1, partyId === itemHolder);
    adjustDisposition(world, quest.client, partyId, 2, `turn ${turn}: ${partyId} completed "${quest.title || quest.id}"`);
  }
  const losers = (quest.acceptedBy || []).filter((p: string) => !winners.includes(p));
  for (const partyId of losers) {
    adjustDisposition(world, quest.client, partyId, 0, `turn ${turn}: ${partyId} was beaten to "${quest.title || quest.id}"`);
  }
  events.push({
    turn,
    kind: 'quest_completed',
    questId: quest.id,
    parties: winners,
    summary: `${quest.title || quest.id} completed by ${winners.join(', ')}${losers.length ? ` (also pursued by ${losers.join(', ')})` : ''}`,
    details: { shares, reward: quest.reward }
  });
  applyEngineEffects(world, quest.onComplete, events, `quest ${quest.id} onComplete`);

  // Quests that cannot coexist with this outcome fail now
  for (const otherId of quest.conflictsWith || []) {
    const other = world.quests?.[otherId];
    if (other && (other.status === 'open' || other.status === 'accepted')) {
      failQuest(world, other, 'quest_failed', `made impossible by the completion of ${quest.title || quest.id}`, events);
    }
  }
}

/**
 * Resolves quests whose progress requirement has been met. Runs after all
 * responses of a turn so that simultaneous finishes are settled fairly.
 */
export function resolveQuests(world: any): EngineEvent[] {
  normalizeWorld(world);
  const events: EngineEvent[] = [];

  for (const quest of Object.values<any>(world.quests)) {
    for (const [partyId, value] of Object.entries<any>(quest.progress || {})) {
      if (value < 0) quest.progress[partyId] = 0;
    }
  }
  const seed = ensureSeed(world);
  const turn = Number(world.turn) || 0;

  for (const quest of Object.values<any>(world.quests)) {
    if (quest.status !== 'open' && quest.status !== 'accepted') continue;
    const required = Number(quest.requiredProgress) || 1;
    const progress: Record<string, number> = quest.progress || {};

    if (quest.type === 'joint') {
      const contributors = Object.entries(progress).filter(([, v]) => v > 0);
      const total = contributors.reduce((s, [, v]) => s + v, 0);
      const minParties = Number(quest.minParties) || 2;
      if (total >= required && contributors.length >= minParties) {
        const shares: Record<string, number> = {};
        for (const [p, v] of contributors) shares[p] = v / total;
        completeQuest(world, quest, contributors.map(([p]) => p), shares, events);
      }
      continue;
    }

    const finishers = Object.entries(progress).filter(([, v]) => v >= required);
    if (finishers.length === 0) continue;

    const best = Math.max(...finishers.map(([, v]) => v));
    let leaders = finishers.filter(([, v]) => v === best).map(([p]) => p);
    if (leaders.length > 1) {
      const rolls = leaders.map(p => ({ p, total: sum(rollDice(seed, `t${turn}:tiebreak:${quest.id}:${p}`)) }));
      const top = Math.max(...rolls.map(r => r.total));
      const tied = rolls.filter(r => r.total === top).map(r => r.p).sort();
      events.push({
        turn,
        kind: 'tie_break',
        questId: quest.id,
        parties: leaders,
        summary: `Simultaneous finish on ${quest.title || quest.id} settled by roll`,
        details: { rolls }
      });
      leaders = [tied[0]];
    }
    completeQuest(world, quest, leaders, { [leaders[0]]: 1 }, events);
  }

  events.push(...checkClocks(world));
  world.chronicle.push(...events);
  return events;
}

function tickClock(world: any, clockId: string, amount: number, reason: string, events: EngineEvent[]): void {
  const clock = world.clocks?.[clockId];
  if (!clock || clock.triggered) return;
  clock.filled = Math.max(0, (clock.filled || 0) + amount);
  events.push({
    turn: Number(world.turn) || 0,
    kind: 'clock_ticked',
    clockId,
    summary: `${clock.name || clockId} advances to ${clock.filled}/${clock.segments} (${reason})`
  });
}

export function checkClocks(world: any): EngineEvent[] {
  const events: EngineEvent[] = [];
  for (const [clockId, clock] of Object.entries<any>(world.clocks || {})) {
    if (clock.triggered) continue;
    if ((clock.filled || 0) >= (clock.segments || 4)) {
      clock.triggered = true;
      clock.triggeredTurn = Number(world.turn) || 0;
      events.push({
        turn: Number(world.turn) || 0,
        kind: 'clock_triggered',
        clockId,
        summary: `${clock.name || clockId} has run out: ${clock.consequence || 'its threat comes to pass'}`
      });
      applyEngineEffects(world, clock.onComplete, events, `clock ${clockId} onComplete`);
    }
  }
  return events;
}

/**
 * Start-of-turn upkeep: expire quests past their deadline and tick clocks.
 * Idempotent per turn.
 */
export function runUpkeep(world: any, turn: number): EngineEvent[] {
  normalizeWorld(world);
  if (typeof world.upkeepTurn === 'number' && world.upkeepTurn >= turn) {
    return [];
  }
  world.turn = turn;
  const events: EngineEvent[] = [];

  for (const quest of Object.values<any>(world.quests)) {
    if ((quest.status === 'open' || quest.status === 'accepted') && typeof quest.deadlineTurn === 'number' && quest.deadlineTurn < turn) {
      failQuest(world, quest, 'quest_expired', `deadline (turn ${quest.deadlineTurn}) passed`, events);
    }
  }

  for (const [recruitId, recruit] of Object.entries<any>(world.recruits)) {
    if (recruit.status === 'hired' && typeof recruit.hiredUntilTurn === 'number' && recruit.hiredUntilTurn < turn) {
      events.push({
        turn,
        kind: 'recruit_departed',
        parties: [recruit.hiredBy],
        summary: `${recruit.name || recruitId} leaves ${recruit.hiredBy} as the contract ends`
      });
      recruit.status = 'departed';
      recruit.formerEmployer = recruit.hiredBy;
      delete recruit.hiredBy;
    }
  }

  for (const [clockId, clock] of Object.entries<any>(world.clocks)) {
    if (!clock.triggered && typeof clock.tickPerTurn === 'number' && clock.tickPerTurn !== 0) {
      tickClock(world, clockId, clock.tickPerTurn, 'time passes', events);
    }
  }

  events.push(...checkClocks(world));
  world.chronicle.push(...events);
  world.upkeepTurn = turn;
  return events;
}

// ---------------------------------------------------------------------------
// Standings and stop conditions
// ---------------------------------------------------------------------------

export function computeStandings(world: any): Array<{ partyId: string; name: string; reputation: number; questsCompleted: number }> {
  const completedCount: Record<string, number> = {};
  for (const quest of Object.values<any>(world.quests || {})) {
    if (quest.status === 'completed') {
      for (const p of quest.completedBy || []) completedCount[p] = (completedCount[p] || 0) + 1;
    }
  }
  return Object.entries<any>(world.parties || {})
    .map(([partyId, party]) => ({
      partyId,
      name: party.name || partyId,
      reputation: party.reputation || 0,
      questsCompleted: completedCount[partyId] || 0
    }))
    .sort((a, b) => b.reputation - a.reputation || b.questsCompleted - a.questsCompleted || a.partyId.localeCompare(b.partyId));
}

/**
 * Records season standings and promotions. Ties at the promotion line are
 * settled by roll.
 */
export function closeSeason(world: any): EngineEvent[] {
  normalizeWorld(world);
  if (world.guild?.promoted) return [];
  const standings = computeStandings(world);
  const slots = Number(world.guild?.season?.promotionSlots ?? world.guild?.promotionSlots ?? 1);
  const seed = ensureSeed(world);
  const events: EngineEvent[] = [];

  let promoted = standings.slice(0, slots).map(s => s.partyId);
  if (standings.length > slots && slots > 0) {
    const line = standings[slots - 1];
    const tied = standings.filter(s => s.reputation === line.reputation && s.questsCompleted === line.questsCompleted);
    if (tied.length > 1) {
      const secure = standings.slice(0, slots).filter(s => !tied.includes(s)).map(s => s.partyId);
      const remaining = slots - secure.length;
      const rolls = tied.map(s => ({ p: s.partyId, total: sum(rollDice(seed, `season:${s.partyId}`)) }));
      rolls.sort((a, b) => b.total - a.total || a.p.localeCompare(b.p));
      promoted = [...secure, ...rolls.slice(0, remaining).map(r => r.p)];
      events.push({
        turn: Number(world.turn) || 0,
        kind: 'tie_break',
        parties: tied.map(s => s.partyId),
        summary: 'Tie at the promotion line settled by roll',
        details: { rolls }
      });
    }
  }

  world.guild = world.guild || {};
  world.guild.standings = standings;
  world.guild.promoted = promoted;
  events.push({
    turn: Number(world.turn) || 0,
    kind: 'season_end',
    parties: promoted,
    summary: `Season closes. Promoted: ${promoted.join(', ') || 'none'}`,
    details: { standings }
  });
  world.chronicle.push(...events);
  return events;
}

export function checkStopConditions(world: any, stopConditions: Record<string, any> | undefined): { completed: boolean; reason?: string } {
  if (!stopConditions) return { completed: false };

  for (const [condition, threshold] of Object.entries(stopConditions)) {
    switch (condition) {
      case 'totalPartyWealth': {
        const total = Object.values<any>(world.parties || {}).reduce((s, p) => s + (p.resources?.currency || 0), 0);
        if (total >= threshold) return { completed: true, reason: 'totalPartyWealth' };
        break;
      }
      case 'regionDevelopment': {
        const developed = Object.values<any>(world.regions || {}).filter(r => Object.keys(r.influence || {}).length >= threshold).length;
        if (developed >= threshold) return { completed: true, reason: 'regionDevelopment' };
        break;
      }
      case 'seasonEnd': {
        const endsAt = world.guild?.season?.endsAtTurn;
        if (threshold && typeof endsAt === 'number' && Number(world.turn) > endsAt) {
          return { completed: true, reason: 'seasonEnd' };
        }
        break;
      }
      case 'questsResolved': {
        const resolved = Object.values<any>(world.quests || {}).filter(q => ['completed', 'failed', 'expired'].includes(q.status)).length;
        if (resolved >= threshold) return { completed: true, reason: 'questsResolved' };
        break;
      }
      case 'clockTriggered': {
        const ids: string[] = Array.isArray(threshold) ? threshold : [threshold];
        if (ids.some(id => world.clocks?.[id]?.triggered)) return { completed: true, reason: 'clockTriggered' };
        break;
      }
      case 'questCompleted': {
        const ids: string[] = Array.isArray(threshold) ? threshold : [threshold];
        if (ids.some(id => ['completed', 'failed', 'expired'].includes(world.quests?.[id]?.status))) {
          return { completed: true, reason: 'questCompleted' };
        }
        break;
      }
    }
  }
  return { completed: false };
}
