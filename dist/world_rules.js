/**
 * World rules: deterministic engine-side adjudication.
 *
 * AI agents decide *what* their characters attempt and declare the stakes in
 * advance. This module decides *what happens*: it rolls dice, enforces who may
 * change which part of the world, keeps the world consistent, and resolves
 * quests, deadlines and progress clocks. It contains no decision-making logic
 * for GM or parties.
 */
export const MAX_ACTIVE_QUESTS = 2;
export const MAX_CHECKS_PER_RESPONSE = 2;
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
    'guild/promoted'
];
// ---------------------------------------------------------------------------
// Deterministic dice
// ---------------------------------------------------------------------------
function hashString(input) {
    // FNV-1a 32-bit
    let hash = 0x811c9dc5;
    for (let i = 0; i < input.length; i++) {
        hash ^= input.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193);
    }
    return hash >>> 0;
}
function mulberry32(seed) {
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
export function rollDice(seed, key, count = 2) {
    const next = mulberry32(hashString(`${seed}:${key}`));
    const rolls = [];
    for (let i = 0; i < count; i++) {
        rolls.push(1 + Math.floor(next() * 6));
    }
    return rolls;
}
export function ensureSeed(world) {
    if (!world.rng || typeof world.rng.seed !== 'number') {
        world.rng = { seed: hashString(`${Date.now()}:${Math.random()}`) };
    }
    return world.rng.seed;
}
export function capabilityModifier(party, capability) {
    const value = party?.capabilities?.[capability];
    if (typeof value !== 'number') {
        return MISSING_CAPABILITY_MODIFIER;
    }
    return Math.max(-2, Math.min(2, Math.round((value - 5) / 2.5)));
}
function sum(values) {
    return values.reduce((a, b) => a + b, 0);
}
export function rollCheck(world, check, requestId, index) {
    const seed = ensureSeed(world);
    const turn = Number(world.turn) || 0;
    const situational = Math.max(-SITUATIONAL_LIMIT, Math.min(SITUATIONAL_LIMIT, check.situational ?? 0));
    const actorParty = world.parties?.[check.actor];
    const rolls = rollDice(seed, `t${turn}:${check.actor}:c${index}`);
    const modifier = capabilityModifier(actorParty, check.capability) + situational;
    const total = sum(rolls) + modifier;
    const result = {
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
    if (check.opposedBy) {
        const opponent = world.parties?.[check.opposedBy.party];
        const oppRolls = rollDice(seed, `t${turn}:${check.opposedBy.party}:vs:${check.actor}:c${index}`);
        const oppModifier = capabilityModifier(opponent, check.opposedBy.capability);
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
    }
    else {
        result.outcome = total >= 10 ? 'success' : total >= 7 ? 'partial' : 'failure';
    }
    return result;
}
// ---------------------------------------------------------------------------
// Actor identification and permissions
// ---------------------------------------------------------------------------
export function identifyActor(response, world) {
    const requestId = response.requestId || '';
    const participant = response.proposal?.participants?.[0];
    if (requestId.startsWith('request_GM_') || participant === 'GM') {
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
    // A response for one party's request must not act as another party
    for (const partyId of Object.keys(world.parties)) {
        if (partyId !== participant && requestId.startsWith(`request_${partyId}_`)) {
            return {
                error: `Permission denied: request for ${partyId} cannot act as ${participant}`,
                details: { requestId, participant }
            };
        }
    }
    return { role: 'Player', partyId: participant };
}
function splitPath(target) {
    return target.split('/').filter(p => p);
}
function matchesPattern(parts, pattern) {
    const patternParts = pattern.split('/');
    if (patternParts.length !== parts.length)
        return false;
    return patternParts.every((p, i) => p === '*' || p === parts[i]);
}
function isEngineOnly(parts) {
    // Writing a parent of an engine-only path is also forbidden (e.g. `quests/q1/status` via `quests/q1`
    // is allowed only for GM when creating a new quest, handled in checkGmPermission)
    return ENGINE_ONLY_PATHS.some(pattern => matchesPattern(parts, pattern));
}
function relationshipIncludes(key, partyId) {
    return key.split('__').includes(partyId);
}
/**
 * Returns null when the effect is allowed, otherwise an error.
 */
export function checkPermission(actor, effect, world, ctx = {}) {
    const parts = splitPath(effect.target);
    if (actor.role === 'GM') {
        return checkGmPermission(parts, effect, world, ctx);
    }
    return checkPlayerPermission(actor.partyId, parts, effect, world, ctx);
}
function denied(effect, reason) {
    return {
        error: `Permission denied: ${effect.target} (${reason})`,
        details: { target: effect.target, operation: effect.operation, reason }
    };
}
function checkGmPermission(parts, effect, world, ctx) {
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
function checkPlayerPermission(partyId, parts, effect, world, ctx) {
    const [root, id, field, sub] = parts;
    const opposed = ctx.viaCheck?.opposedBy?.party;
    if (root === 'quests' && field === 'progress' && parts.length === 4) {
        if (!ctx.viaCheck) {
            return denied(effect, 'quest progress can only change through a check outcome');
        }
        const quest = world.quests?.[id];
        if (!quest)
            return denied(effect, `quest ${id} does not exist`);
        if (effect.operation !== 'add' || typeof effect.value !== 'number') {
            return denied(effect, 'quest progress only accepts numeric add');
        }
        if (sub === partyId)
            return null;
        if (!(quest.acceptedBy || []).includes(sub)) {
            return denied(effect, `${sub} has not accepted quest ${id}`);
        }
        if (effect.value > 0)
            return null; // assisting another party
        if (sub === opposed)
            return null; // sabotage requires an opposed check
        return denied(effect, 'reducing another party\'s progress requires a check opposed by that party');
    }
    if (isEngineOnly(parts)) {
        return denied(effect, 'engine-managed value');
    }
    if (root === 'parties') {
        if (id === partyId) {
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
        if (opposed && id === opposed && ['morale', 'resources', 'inventory'].includes(field))
            return null;
        return denied(effect, 'parties may only change their own state (or an opponent\'s morale, resources or inventory through an opposed check)');
    }
    if (root === 'quests') {
        const quest = world.quests?.[id];
        if (!quest)
            return denied(effect, `quest ${id} does not exist`);
        if (field === 'acceptedBy' && parts.length === 3) {
            const value = Array.isArray(effect.value) ? effect.value : [effect.value];
            if (effect.operation !== 'add' || value.length !== 1 || value[0] !== partyId) {
                return denied(effect, 'a party may only add itself to acceptedBy');
            }
            return null;
        }
        if (field === 'abandonedBy' && parts.length === 3) {
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
            if (!ctx.viaCheck)
                return denied(effect, 'secrets are uncovered through a check outcome');
            const value = Array.isArray(effect.value) ? effect.value : [effect.value];
            if (effect.operation !== 'add' || value.length !== 1 || value[0] !== partyId) {
                return denied(effect, 'a party may only reveal a secret to itself');
            }
            return null;
        }
        return denied(effect, 'quest definitions are controlled by the GM');
    }
    if (root === 'relationships') {
        if (id && relationshipIncludes(id, partyId))
            return null;
        return denied(effect, 'parties may only change relationships they are part of');
    }
    if (root === 'favors') {
        // A party may acknowledge a debt it owes, or mark its own debt as repaid
        if (parts.length === 2 && effect.operation === 'set') {
            if (effect.value?.owedBy === partyId && effect.value?.owedTo && effect.value.owedTo !== partyId) {
                return null;
            }
            return denied(effect, 'a party may only record favors it owes (owedBy must be itself)');
        }
        if (parts.length === 3 && field === 'status') {
            const favor = world.favors?.[id];
            if (favor && favor.owedBy === partyId)
                return null;
            return denied(effect, 'only the debtor may update a favor\'s status');
        }
        return denied(effect, 'unsupported favor operation');
    }
    if (root === 'regions' && field === 'influence' && sub === partyId && parts.length === 4) {
        if (!ctx.viaCheck)
            return denied(effect, 'influence is earned through a check outcome');
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
export function applyEffect(effect, world) {
    const parts = splitPath(effect.target);
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
            if (i === 0 && ['quests', 'clocks', 'favors', 'npcs', 'threads', 'guild'].includes(key)) {
                current[key] = {};
            }
            else {
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
    }
    else if (typeof existing === 'number') {
        if (typeof effect.value !== 'number') {
            return { error: `Type mismatch: cannot add non-number to ${effect.target}`, details: { value: effect.value } };
        }
        current[finalKey] = existing + effect.value;
    }
    else if (Array.isArray(existing)) {
        const items = Array.isArray(effect.value) ? effect.value : [effect.value];
        current[finalKey] = [...existing, ...items];
    }
    else if (typeof existing === 'object') {
        if (typeof effect.value !== 'object' || Array.isArray(effect.value)) {
            return { error: `Type mismatch: cannot add non-object to ${effect.target}`, details: { value: effect.value } };
        }
        current[finalKey] = { ...existing, ...effect.value };
    }
    else {
        current[finalKey] = effect.value;
    }
    return null;
}
// ---------------------------------------------------------------------------
// World normalization and invariants
// ---------------------------------------------------------------------------
export function normalizeQuest(id, quest, turn) {
    const normalized = {
        id,
        type: 'exclusive',
        requiredProgress: 3,
        status: 'open',
        issuedTurn: turn,
        ...quest
    };
    if (!Array.isArray(normalized.acceptedBy))
        normalized.acceptedBy = [];
    if (!Array.isArray(normalized.abandonedBy))
        normalized.abandonedBy = [];
    if (!normalized.progress || typeof normalized.progress !== 'object')
        normalized.progress = {};
    if (normalized.status === 'open' && normalized.acceptedBy.length > 0)
        normalized.status = 'accepted';
    return normalized;
}
// Fields a newly issued quest always starts with, whatever the issuer wrote
function resetNewQuest(quest, turn) {
    quest.status = 'open';
    quest.progress = {};
    quest.completedBy = undefined;
    quest.resolvedTurn = undefined;
    quest.issuedTurn = turn;
    quest.abandonedBy = [];
    if ((quest.acceptedBy || []).length > 0)
        quest.status = 'accepted';
}
export function normalizeWorld(world) {
    const turn = Number(world.turn) || 0;
    world.quests = world.quests || {};
    for (const [id, quest] of Object.entries(world.quests)) {
        world.quests[id] = normalizeQuest(id, quest, turn);
    }
    world.clocks = world.clocks || {};
    for (const [id, clock] of Object.entries(world.clocks)) {
        world.clocks[id] = { id, segments: 4, filled: 0, triggered: false, ...clock };
    }
    world.favors = world.favors || {};
    world.npcs = world.npcs || {};
    world.threads = world.threads || {};
    world.checkLog = Array.isArray(world.checkLog) ? world.checkLog : [];
    world.chronicle = Array.isArray(world.chronicle) ? world.chronicle : [];
}
function activeQuestCount(world, partyId) {
    return Object.values(world.quests || {}).filter(q => (q.acceptedBy || []).includes(partyId) && (q.status === 'open' || q.status === 'accepted')).length;
}
/**
 * Validates and repairs the world after a response's effects were applied to a draft.
 * `before` is the state prior to this response.
 */
export function enforceInvariants(before, draft, actor) {
    normalizeWorld(draft);
    const turn = Number(draft.turn) || 0;
    for (const [questId, quest] of Object.entries(draft.quests)) {
        if (!before.quests?.[questId])
            resetNewQuest(quest, turn);
    }
    // Abandoning a quest withdraws the party and forfeits its progress
    for (const [questId, quest] of Object.entries(draft.quests)) {
        const prevAbandoned = before.quests?.[questId]?.abandonedBy || [];
        for (const partyId of quest.abandonedBy) {
            if (prevAbandoned.includes(partyId))
                continue;
            quest.acceptedBy = quest.acceptedBy.filter(p => p !== partyId);
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
        if (quest.status === 'accepted' && quest.acceptedBy.length === 0)
            quest.status = 'open';
    }
    // Resources may never go negative
    for (const [partyId, party] of Object.entries(draft.parties || {})) {
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
    for (const [partyId, party] of Object.entries(draft.parties || {})) {
        const prev = before.parties?.[partyId];
        if (!prev || prev.location === party.location)
            continue;
        if (!draft.regions?.[party.location]) {
            return { error: `Region not found: ${party.location}`, details: { partyId } };
        }
        if (actor.role === 'Player') {
            const neighbors = before.regions?.[prev.location]?.neighbors || [];
            if (!neighbors.includes(party.location)) {
                return {
                    error: `Invalid move: ${party.location} is not adjacent to ${prev.location}`,
                    details: { partyId, from: prev.location, to: party.location, neighbors }
                };
            }
        }
        syncOccupancy(draft, partyId, prev.location, party.location);
    }
    // Quest acceptance rules
    for (const [questId, quest] of Object.entries(draft.quests)) {
        const prevAccepted = before.quests?.[questId]?.acceptedBy || [];
        const added = quest.acceptedBy.filter(p => !prevAccepted.includes(p));
        if (added.length === 0)
            continue;
        const abandoned = quest.abandonedBy.filter(p => added.includes(p));
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
    // Progress requires presence at the quest site; it never drops below zero
    for (const [questId, quest] of Object.entries(draft.quests)) {
        const prevProgress = before.quests?.[questId]?.progress || {};
        for (const [partyId, value] of Object.entries(quest.progress)) {
            if (typeof value !== 'number') {
                return { error: `Invalid progress value for ${partyId} on ${questId}`, details: { value } };
            }
            const delta = value - (prevProgress[partyId] || 0);
            if (delta > 0 && quest.location && actor.role === 'Player') {
                const loc = draft.parties?.[actor.partyId]?.location;
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
            if (value < 0)
                quest.progress[partyId] = 0;
        }
    }
    return null;
}
function findNegative(obj, basePath) {
    if (!obj || typeof obj !== 'object')
        return null;
    for (const [key, value] of Object.entries(obj)) {
        const p = `${basePath}/${key}`;
        if (typeof value === 'number' && value < 0)
            return { key, path: p, value };
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            const nested = findNegative(value, p);
            if (nested)
                return nested;
        }
    }
    return null;
}
function syncOccupancy(world, partyId, from, to) {
    const fromRegion = world.regions?.[from];
    if (fromRegion && Array.isArray(fromRegion.occupantParties)) {
        fromRegion.occupantParties = fromRegion.occupantParties.filter((p) => p !== partyId);
    }
    const toRegion = world.regions?.[to];
    if (toRegion) {
        const list = Array.isArray(toRegion.occupantParties) ? toRegion.occupantParties : [];
        if (!list.includes(partyId))
            list.push(partyId);
        toRegion.occupantParties = list;
    }
}
function validateCheckDeclaration(check, actor, world, index) {
    const where = `checks[${index}]`;
    if (!check || typeof check !== 'object')
        return { error: `${where} must be an object` };
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
export function executeResponse(response, world) {
    const identified = identifyActor(response, world);
    if ('error' in identified) {
        return { success: false, error: identified.error, details: identified.details };
    }
    const actor = identified;
    const effects = response.proposal.effects || [];
    const checks = response.proposal.checks || [];
    if (checks.length > MAX_CHECKS_PER_RESPONSE) {
        return { success: false, error: `Too many checks: at most ${MAX_CHECKS_PER_RESPONSE} per response` };
    }
    // Validate every effect in every branch before any dice are rolled
    for (const effect of effects) {
        const denial = checkPermission(actor, effect, world);
        if (denial)
            return { success: false, ...denial };
    }
    for (let i = 0; i < checks.length; i++) {
        const check = checks[i];
        const invalid = validateCheckDeclaration(check, actor, world, i);
        if (invalid)
            return { success: false, ...invalid };
        for (const outcome of ['success', 'partial', 'failure']) {
            for (const effect of check.outcomes[outcome]) {
                const denial = checkPermission(actor, effect, world, { viaCheck: check });
                if (denial) {
                    return { success: false, error: `checks[${i}].outcomes.${outcome}: ${denial.error}`, details: denial.details };
                }
            }
        }
    }
    const draft = structuredClone(world);
    normalizeWorld(draft);
    const applied = [];
    for (const effect of effects) {
        const err = applyEffect(effect, draft);
        if (err)
            return { success: false, ...err };
        applied.push(effect);
    }
    const results = [];
    for (let i = 0; i < checks.length; i++) {
        const result = rollCheck(draft, checks[i], response.requestId, i);
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
    if (violation)
        return { success: false, ...violation };
    draft.checkLog.push(...results);
    // Commit the draft
    for (const key of Object.keys(world))
        delete world[key];
    Object.assign(world, draft);
    return { success: true, actor, checks: results, appliedEffects: applied };
}
// ---------------------------------------------------------------------------
// Quest resolution, deadlines and clocks
// ---------------------------------------------------------------------------
function applyEngineEffects(world, effects, events, source) {
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
function grantReward(world, partyId, reward, share, receivesItems) {
    const party = world.parties?.[partyId];
    if (!party || !reward)
        return;
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
function adjustDisposition(world, npcId, partyId, delta, memory) {
    if (!npcId)
        return;
    const npc = world.npcs?.[npcId];
    if (!npc)
        return;
    npc.disposition = npc.disposition || {};
    npc.disposition[partyId] = Math.max(-5, Math.min(5, (npc.disposition[partyId] || 0) + delta));
    npc.memory = [...(npc.memory || []), memory];
}
function failQuest(world, quest, kind, reason, events) {
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
function completeQuest(world, quest, winners, shares, events) {
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
    const losers = (quest.acceptedBy || []).filter((p) => !winners.includes(p));
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
export function resolveQuests(world) {
    normalizeWorld(world);
    const events = [];
    const seed = ensureSeed(world);
    const turn = Number(world.turn) || 0;
    for (const quest of Object.values(world.quests)) {
        if (quest.status !== 'open' && quest.status !== 'accepted')
            continue;
        const required = Number(quest.requiredProgress) || 1;
        const progress = quest.progress || {};
        if (quest.type === 'joint') {
            const contributors = Object.entries(progress).filter(([, v]) => v > 0);
            const total = contributors.reduce((s, [, v]) => s + v, 0);
            const minParties = Number(quest.minParties) || 2;
            if (total >= required && contributors.length >= minParties) {
                const shares = {};
                for (const [p, v] of contributors)
                    shares[p] = v / total;
                completeQuest(world, quest, contributors.map(([p]) => p), shares, events);
            }
            continue;
        }
        const finishers = Object.entries(progress).filter(([, v]) => v >= required);
        if (finishers.length === 0)
            continue;
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
function tickClock(world, clockId, amount, reason, events) {
    const clock = world.clocks?.[clockId];
    if (!clock || clock.triggered)
        return;
    clock.filled = Math.max(0, (clock.filled || 0) + amount);
    events.push({
        turn: Number(world.turn) || 0,
        kind: 'clock_ticked',
        clockId,
        summary: `${clock.name || clockId} advances to ${clock.filled}/${clock.segments} (${reason})`
    });
}
export function checkClocks(world) {
    const events = [];
    for (const [clockId, clock] of Object.entries(world.clocks || {})) {
        if (clock.triggered)
            continue;
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
export function runUpkeep(world, turn) {
    normalizeWorld(world);
    if (typeof world.upkeepTurn === 'number' && world.upkeepTurn >= turn) {
        return [];
    }
    world.turn = turn;
    const events = [];
    for (const quest of Object.values(world.quests)) {
        if ((quest.status === 'open' || quest.status === 'accepted') && typeof quest.deadlineTurn === 'number' && quest.deadlineTurn < turn) {
            failQuest(world, quest, 'quest_expired', `deadline (turn ${quest.deadlineTurn}) passed`, events);
        }
    }
    for (const [clockId, clock] of Object.entries(world.clocks)) {
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
export function computeStandings(world) {
    const completedCount = {};
    for (const quest of Object.values(world.quests || {})) {
        if (quest.status === 'completed') {
            for (const p of quest.completedBy || [])
                completedCount[p] = (completedCount[p] || 0) + 1;
        }
    }
    return Object.entries(world.parties || {})
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
export function closeSeason(world) {
    normalizeWorld(world);
    if (world.guild?.promoted)
        return [];
    const standings = computeStandings(world);
    const slots = Number(world.guild?.season?.promotionSlots ?? world.guild?.promotionSlots ?? 1);
    const seed = ensureSeed(world);
    const events = [];
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
export function checkStopConditions(world, stopConditions) {
    if (!stopConditions)
        return { completed: false };
    for (const [condition, threshold] of Object.entries(stopConditions)) {
        switch (condition) {
            case 'totalPartyWealth': {
                const total = Object.values(world.parties || {}).reduce((s, p) => s + (p.resources?.currency || 0), 0);
                if (total >= threshold)
                    return { completed: true, reason: 'totalPartyWealth' };
                break;
            }
            case 'regionDevelopment': {
                const developed = Object.values(world.regions || {}).filter(r => Object.keys(r.influence || {}).length >= threshold).length;
                if (developed >= threshold)
                    return { completed: true, reason: 'regionDevelopment' };
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
                const resolved = Object.values(world.quests || {}).filter(q => ['completed', 'failed', 'expired'].includes(q.status)).length;
                if (resolved >= threshold)
                    return { completed: true, reason: 'questsResolved' };
                break;
            }
            case 'clockTriggered': {
                const ids = Array.isArray(threshold) ? threshold : [threshold];
                if (ids.some(id => world.clocks?.[id]?.triggered))
                    return { completed: true, reason: 'clockTriggered' };
                break;
            }
            case 'questCompleted': {
                const ids = Array.isArray(threshold) ? threshold : [threshold];
                if (ids.some(id => ['completed', 'failed', 'expired'].includes(world.quests?.[id]?.status))) {
                    return { completed: true, reason: 'questCompleted' };
                }
                break;
            }
        }
    }
    return { completed: false };
}
//# sourceMappingURL=world_rules.js.map