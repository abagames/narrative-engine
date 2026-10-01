import * as fs from 'fs/promises';
import * as path from 'path';
import { capabilityModifier, computeStandings, MAX_ACTIVE_QUESTS } from './world_rules.js';
const GM_INSTRUCTIONS = 'worldStateFileを読み込んで世界状態を分析し、適切なフレームワークを適用してGMとしての最適な行動を決定してください。' +
    '依頼掲示板が手薄なら、パーティー同士が交差する依頼（競合・衝突・共同・隠された真相）を発行してください。' +
    '結果が不確かな出来事はchecksで宣言し、判定はエンジンに任せてください';
const PLAYER_INSTRUCTIONS = 'worldStateFileを読み込んで世界状態を分析し、適切なフレームワークを適用してパーティーとしての最適な行動を決定してください。' +
    '行動の目的は依頼（quests）の達成です。依頼の進捗・妨害・秘密の調査はchecksで成功/部分成功/失敗の結果を事前に宣言し、' +
    'ダイス判定はエンジンに任せてください。guildBoardに見えない情報（他依頼との衝突・依頼主の真意）は知らない前提で判断してください';
const ACTIVE_STATUSES = ['open', 'accepted'];
export async function writeDecisionRequests(sessionId, worldState, requestsDir, recentHistory) {
    const requestsCreated = [];
    const timestamp = new Date().toISOString();
    await fs.mkdir(requestsDir, { recursive: true });
    const gmRequestId = `request_GM_${Date.now()}`;
    const gmRequest = {
        requestId: gmRequestId,
        timestamp,
        sessionId,
        worldStateFile: `../sessions/${sessionId}/world_current.json`,
        framework: { role: 'GM' },
        contextData: generateGMContextData(worldState, recentHistory),
        instructions: GM_INSTRUCTIONS
    };
    const gmFileName = `${gmRequestId}.json`;
    await fs.writeFile(path.join(requestsDir, gmFileName), JSON.stringify(gmRequest, null, 2));
    requestsCreated.push(gmFileName);
    for (const [partyId, party] of Object.entries(worldState.parties || {})) {
        const partyRequestId = `request_${partyId}_${Date.now() + Math.floor(Math.random() * 1000)}`;
        const partyRequest = {
            requestId: partyRequestId,
            timestamp,
            sessionId,
            worldStateFile: `../sessions/${sessionId}/world_current.json`,
            framework: { role: 'Player', actorId: partyId },
            contextData: generatePartyContextData(partyId, party, worldState, recentHistory),
            instructions: PLAYER_INSTRUCTIONS
        };
        const partyFileName = `${partyRequestId}.json`;
        await fs.writeFile(path.join(requestsDir, partyFileName), JSON.stringify(partyRequest, null, 2));
        requestsCreated.push(partyFileName);
    }
    return requestsCreated;
}
// ---------------------------------------------------------------------------
// GM context
// ---------------------------------------------------------------------------
export function generateGMContextData(worldState, recentHistory) {
    const partyDistribution = {};
    for (const party of Object.values(worldState.parties || {})) {
        partyDistribution[party.location] = (partyDistribution[party.location] || 0) + 1;
    }
    const context = {
        worldSummary: {
            turn: worldState.turn,
            totalParties: Object.keys(worldState.parties || {}).length,
            activeRegions: Object.keys(worldState.regions || {}).length,
            partyDistribution,
            seasonEndsAtTurn: worldState.guild?.season?.endsAtTurn
        },
        questBoard: summarizeQuestBoardForGM(worldState),
        clocks: Object.values(worldState.clocks || {}),
        standings: computeStandings(worldState),
        favors: Object.entries(worldState.favors || {}).map(([id, f]) => ({ id, ...f })),
        npcs: worldState.npcs || {},
        openThreads: summarizeThreads(worldState),
        recentChecks: (worldState.checkLog || []).slice(-8),
        recentEngineEvents: (worldState.chronicle || []).slice(-8),
        pacing: summarizePacing(recentHistory),
        availableActions: [
            'issue_quest',
            'npc_action',
            'complication',
            'advance_clock',
            'reveal_secret',
            'environmental_change',
            'discovery_event',
            'weather_change'
        ],
        recentHistory: recentHistory.slice(-10)
    };
    if (worldState.market) {
        context.marketData = buildGMMarketData(worldState.market);
        context.availableActions.push('price_update', 'market_event');
    }
    return context;
}
function buildGMMarketData(rawMarket) {
    const market = { currentPrices: {}, priceHistory: [], ...rawMarket };
    const priceHistory = Array.isArray(market.priceHistory) ? market.priceHistory : [];
    const priceVolatility = {};
    for (const resource of Object.keys(market.currentPrices)) {
        const recentPrices = priceHistory
            .slice(-5)
            .map((entry) => entry[resource])
            .filter((price) => price !== undefined);
        if (recentPrices.length > 1) {
            const avg = recentPrices.reduce((s, p) => s + p, 0) / recentPrices.length;
            const variance = recentPrices.reduce((s, p) => s + Math.pow(p - avg, 2), 0) / recentPrices.length;
            priceVolatility[resource] = Math.sqrt(variance);
        }
        else {
            priceVolatility[resource] = 0;
        }
    }
    return {
        currentPrices: market.currentPrices,
        priceHistory,
        totalVolume: Object.values(market.currentPrices).reduce((s, p) => s + (p || 0), 0),
        priceVolatility
    };
}
function summarizeQuestBoardForGM(worldState) {
    const quests = Object.values(worldState.quests || {});
    const active = quests.filter(q => ACTIVE_STATUSES.includes(q.status));
    const partyCount = Object.keys(worldState.parties || {}).length;
    const turn = Number(worldState.turn) || 0;
    const questsByRegion = {};
    for (const quest of active) {
        if (quest.location) {
            (questsByRegion[quest.location] = questsByRegion[quest.location] || []).push(quest.id);
        }
    }
    const contested = active.filter(q => (q.acceptedBy || []).length >= 2).map(q => q.id);
    const idleParties = Object.keys(worldState.parties || {}).filter(p => !active.some(q => (q.acceptedBy || []).includes(p)));
    return {
        active,
        resolved: quests
            .filter(q => !ACTIVE_STATUSES.includes(q.status))
            .map(q => ({ id: q.id, title: q.title, status: q.status, completedBy: q.completedBy, resolvedTurn: q.resolvedTurn })),
        // Facts for the GM to weigh; the GM decides what to issue
        signals: {
            activeQuestCount: active.length,
            partyCount,
            idleParties,
            contestedQuests: contested,
            conflictPairs: active.flatMap(q => (q.conflictsWith || []).map((o) => [q.id, o])),
            questsByRegion,
            deadlinesWithin2Turns: active
                .filter(q => typeof q.deadlineTurn === 'number' && q.deadlineTurn - turn <= 2)
                .map(q => ({ id: q.id, deadlineTurn: q.deadlineTurn }))
        }
    };
}
function summarizeThreads(worldState) {
    const turn = Number(worldState.turn) || 0;
    return Object.entries(worldState.threads || {})
        .filter(([, t]) => t.status !== 'resolved')
        .map(([id, t]) => ({ id, ...t, age: typeof t.turn === 'number' ? turn - t.turn : undefined }));
}
function summarizePacing(recentHistory) {
    const typeCounts = {};
    for (const event of recentHistory) {
        if (event.actor === 'GM' && event.type) {
            typeCounts[event.type] = (typeCounts[event.type] || 0) + 1;
        }
    }
    const outcomes = { success: 0, partial: 0, failure: 0 };
    for (const event of recentHistory) {
        for (const check of event.checks || []) {
            if (check.outcome in outcomes)
                outcomes[check.outcome]++;
        }
    }
    return { recentGMActionTypes: typeCounts, recentCheckOutcomes: outcomes };
}
// ---------------------------------------------------------------------------
// Party context
// ---------------------------------------------------------------------------
function coarseProgress(value, required) {
    if (!value)
        return 'none';
    return value >= Math.ceil((required * 2) / 3) ? 'close' : 'started';
}
function publicQuestView(quest, partyId) {
    const required = Number(quest.requiredProgress) || 1;
    const view = {
        id: quest.id,
        title: quest.title,
        client: quest.client,
        description: quest.description,
        type: quest.type,
        location: quest.location,
        deadlineTurn: quest.deadlineTurn,
        requiredProgress: required,
        reward: quest.reward,
        status: quest.status,
        acceptedBy: quest.acceptedBy || [],
        yourProgress: quest.progress?.[partyId] || 0,
        // Rivals' progress is known only roughly
        rivalProgress: Object.fromEntries(Object.entries(quest.progress || {})
            .filter(([p]) => p !== partyId)
            .map(([p, v]) => [p, coarseProgress(v, required)]))
    };
    if (quest.type === 'joint')
        view.minParties = quest.minParties ?? 2;
    if (quest.secret && (quest.secret.revealedTo || []).includes(partyId)) {
        view.secret = quest.secret.truth;
    }
    return view;
}
export function generatePartyContextData(partyId, party, worldState, recentHistory) {
    const quests = Object.values(worldState.quests || {});
    const board = quests.filter(q => ACTIVE_STATUSES.includes(q.status));
    const mine = board.filter(q => (q.acceptedBy || []).includes(partyId));
    const partyRecentHistory = recentHistory.filter(event => event.participants?.includes(partyId) || event.actor === partyId);
    const context = {
        partyState: {
            id: party.id || partyId,
            name: party.name || `Party ${partyId}`,
            location: party.location,
            resources: party.resources || {},
            capabilities: party.capabilities || {},
            morale: party.morale ?? 5,
            reputation: party.reputation || 0,
            inventory: party.inventory || [],
            goals: party.goals,
            flaws: party.flaws
        },
        checkModifiers: Object.fromEntries(Object.keys(party.capabilities || {}).map(c => [c, capabilityModifier(party, c)])),
        guildBoard: board.map(q => publicQuestView(q, partyId)),
        activeQuests: mine.map(q => q.id),
        questSlotsFree: Math.max(0, MAX_ACTIVE_QUESTS - mine.length),
        knowledge: (party.knowledge || []).map((k) => {
            if (k && typeof k === 'object') {
                const { truth, ...rest } = k;
                return rest;
            }
            return k;
        }),
        favors: Object.entries(worldState.favors || {})
            .filter(([, f]) => f.owedBy === partyId || f.owedTo === partyId)
            .map(([id, f]) => ({ id, ...f })),
        clientDispositions: Object.fromEntries(Object.entries(worldState.npcs || {})
            .filter(([id]) => board.some(q => q.client === id) || mine.some(q => q.client === id))
            .map(([id, npc]) => [id, { name: npc.name, towardYou: npc.disposition?.[partyId] || 0 }])),
        standings: computeStandings(worldState),
        seasonEndsAtTurn: worldState.guild?.season?.endsAtTurn,
        visibleClocks: Object.values(worldState.clocks || {})
            .filter(c => c.visible !== false)
            .map(c => ({ id: c.id, name: c.name, filled: c.filled, segments: c.segments, triggered: c.triggered })),
        visibleRegions: getVisibleRegions(party, worldState.regions || {}),
        availableActions: getAvailableActions(party, worldState.regions || {}, mine.length),
        recentHistory: partyRecentHistory.slice(-5)
    };
    if (worldState.market) {
        const relevant = getRelevantResources(party);
        const prices = {};
        for (const resource of relevant) {
            if (worldState.market.currentPrices?.[resource] !== undefined) {
                prices[resource] = worldState.market.currentPrices[resource];
            }
        }
        context.marketData = {
            currentPrices: prices,
            recentTrades: Array.isArray(worldState.market.completedTrades) ? worldState.market.completedTrades.slice(-5) : []
        };
    }
    return context;
}
export function getVisibleRegions(party, regions) {
    const currentRegion = regions[party.location];
    if (!currentRegion)
        return [];
    const describe = (region, distance) => ({
        id: region.id,
        name: region.name,
        type: region.type,
        isAccessible: true,
        resources: region.resources || [],
        distance,
        occupants: region.occupantParties?.length || 0,
        occupantParties: region.occupantParties || []
    });
    const visible = [describe(currentRegion, 0)];
    for (const neighborId of currentRegion.neighbors || []) {
        const neighbor = regions[neighborId];
        if (neighbor)
            visible.push(describe(neighbor, 1));
    }
    return visible;
}
export function getAvailableActions(party, regions, activeQuestCount = 0) {
    const actions = ['pursue_quest', 'investigate', 'negotiate', 'assist', 'contest', 'rest', 'explore', 'trade', 'cooperate'];
    if (activeQuestCount < MAX_ACTIVE_QUESTS)
        actions.unshift('accept_quest');
    if (activeQuestCount > 0)
        actions.push('abandon_quest');
    const currentRegion = regions[party.location];
    if (currentRegion?.neighbors?.length > 0)
        actions.push('move');
    const specialEffects = Array.isArray(currentRegion?.specialEffects)
        ? currentRegion.specialEffects
        : currentRegion?.specialEffects
            ? Object.values(currentRegion.specialEffects)
            : [];
    if (specialEffects.includes('market_access') || specialEffects.includes('enhanced_trade')) {
        actions.push('market_trade');
    }
    const resources = Array.isArray(currentRegion?.resources)
        ? currentRegion.resources
        : currentRegion?.resources
            ? Object.values(currentRegion.resources)
            : [];
    if (resources.length > 0)
        actions.push('extract_resources');
    return actions;
}
function getRelevantResources(party) {
    const resources = ['currency'];
    if (party.capabilities?.crafting > 6)
        resources.push('ore', 'materials', 'tools');
    if (party.capabilities?.exploration > 7)
        resources.push('gems', 'artifacts', 'maps');
    if (party.capabilities?.trade > 6)
        resources.push('luxury_goods', 'rare_items');
    return resources;
}
// ---------------------------------------------------------------------------
// History
// ---------------------------------------------------------------------------
/**
 * Reads recent events from playlog.jsonl. Turn entries that carry an
 * `actions` array are expanded so every actor's action is visible.
 */
export async function readRecentHistory(sessionDir, limit = 10) {
    try {
        const content = await fs.readFile(path.join(sessionDir, 'playlog.jsonl'), 'utf-8');
        const lines = content.trim().split('\n').filter(line => line);
        const events = [];
        for (const line of lines.slice(-limit)) {
            let entry;
            try {
                entry = JSON.parse(line);
            }
            catch {
                continue;
            }
            if (Array.isArray(entry.actions) && entry.actions.length > 0) {
                for (const action of entry.actions) {
                    events.push({
                        step: entry.step,
                        turn: entry.turn,
                        type: action.type,
                        participants: action.participants,
                        actor: action.actor,
                        checks: action.checks || [],
                        description: action.summary || entry.narrative?.basicDescription || `${action.type} action`
                    });
                }
                for (const event of entry.engineEvents || []) {
                    events.push({
                        step: entry.step,
                        turn: entry.turn,
                        type: event.kind,
                        participants: event.parties || [],
                        actor: 'engine',
                        description: event.summary
                    });
                }
            }
            else {
                events.push({
                    step: entry.step,
                    type: entry.type,
                    participants: entry.participants,
                    actor: entry.actor,
                    description: entry.narrative?.basicDescription || `${entry.type} action`
                });
            }
        }
        return events.slice(-limit * 4);
    }
    catch {
        return [];
    }
}
//# sourceMappingURL=turn_context.js.map