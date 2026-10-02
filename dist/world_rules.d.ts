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
    opposedBy?: {
        party: string;
        capability: string;
    };
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
    bonuses?: {
        recruit?: string;
        item?: string;
        conditions?: string[];
    };
    showdown?: {
        winner: string;
        loser: string;
        winnerQuest?: string;
        loserQuest?: string;
    };
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
    kind: 'quest_completed' | 'quest_failed' | 'quest_expired' | 'clock_triggered' | 'clock_ticked' | 'tie_break' | 'season_end' | 'quest_abandoned' | 'recruit_departed' | 'showdown' | 'party_spent' | 'condition_recovered' | 'recruit_lured' | 'draft_started' | 'draft_order' | 'draft_pick' | 'draft_invite' | 'draft_closed' | 'engine_warning';
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
export declare const MAX_ACTIVE_QUESTS = 1;
export declare const MAX_CHECKS_PER_RESPONSE = 2;
export declare const MAX_RECRUITS = 2;
/** A party carrying this many conditions is spent: no checks until it rests */
export declare const MAX_CONDITIONS = 3;
/** Sabotage removes at most this much of a rival's progress per check */
export declare const MAX_SABOTAGE = 1;
/** After this many opposed clashes over quests, the next one between the same pair is a showdown */
export declare const SHOWDOWN_AFTER = 2;
export declare const SHOWDOWN_GAIN = 2;
export declare const SITUATIONAL_LIMIT = 1;
export declare const MISSING_CAPABILITY_MODIFIER = -1;
/**
 * Rolls 2d6 from a key. The same world seed and key always give the same dice,
 * so resubmitting a response cannot be used to reroll a bad result.
 */
export declare function rollDice(seed: number, key: string, count?: number): number[];
export declare function ensureSeed(world: any): number;
export declare function capabilityModifier(party: any, capability: string): number;
/**
 * A party's capability for a check: its own value, raised by a hired recruit
 * who has that capability.
 */
export declare function effectiveCapability(world: any, partyId: string, capability: string): {
    value: number | undefined;
    recruit?: string;
};
/** +1 when the party holds an item that aids this capability */
export declare function itemBonus(world: any, partyId: string, capability: string): {
    bonus: number;
    item?: string;
};
/** Conditions (wounded, exhausted, shaken ...) that hamper this capability, -1 each */
export declare function conditionPenalties(world: any, partyId: string, capability: string): string[];
export declare function checkModifier(world: any, partyId: string, capability: string): {
    modifier: number;
    recruit?: string;
    item?: string;
    conditions?: string[];
};
export declare function conditionCount(party: any): number;
export declare function rollCheck(world: any, check: CheckDeclaration, requestId: string, index: number, role?: 'GM' | 'Player'): CheckResult;
export declare function identifyActor(response: any, world: any): Actor | RuleError;
interface PermissionContext {
    viaCheck?: CheckDeclaration;
}
/**
 * Returns null when the effect is allowed, otherwise an error.
 */
export declare function checkPermission(actor: Actor, effect: Effect, world: any, ctx?: PermissionContext): RuleError | null;
export declare function applyEffect(effect: Effect, world: any): RuleError | null;
export declare function normalizeQuest(id: string, quest: any, turn: number): any;
export declare function normalizeWorld(world: any): void;
/**
 * Validates and repairs the world after a response's effects were applied to a draft.
 * `before` is the state prior to this response.
 */
export declare function enforceInvariants(before: any, draft: any, actor: Actor): RuleError | null;
export interface ExecutionResult {
    success: boolean;
    error?: string;
    details?: any;
    actor?: Actor;
    checks?: CheckResult[];
    appliedEffects?: Effect[];
}
/**
 * Applies one decision response to the world. All-or-nothing: on error the
 * world is left untouched.
 */
export declare function executeResponse(response: any, world: any): ExecutionResult;
export declare function rivalryKey(a: string, b: string): string;
/** The quest a party is pursuing (parties hold one quest at a time) */
export declare function activeQuestOf(world: any, partyId: string): string | undefined;
/**
 * Resolves quests whose progress requirement has been met. Runs after all
 * responses of a turn so that simultaneous finishes are settled fairly.
 */
export declare function resolveQuests(world: any): EngineEvent[];
export declare function checkClocks(world: any): EngineEvent[];
/**
 * Start-of-turn upkeep: expire quests past their deadline and tick clocks.
 * Idempotent per turn.
 */
export declare function runUpkeep(world: any, turn: number): EngineEvent[];
export declare function computeStandings(world: any): Array<{
    partyId: string;
    name: string;
    reputation: number;
    questsCompleted: number;
}>;
/**
 * Records season standings and promotions. Ties at the promotion line are
 * settled by roll.
 */
export declare function closeSeason(world: any): EngineEvent[];
export declare function checkStopConditions(world: any, stopConditions: Record<string, any> | undefined): {
    completed: boolean;
    reason?: string;
};
export {};
