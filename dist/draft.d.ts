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
import { EngineEvent, RuleError } from './world_rules.js';
export type PickKind = 'quest' | 'recruit' | 'item' | 'intel' | 'pass';
export type DraftMode = 'order' | 'pick' | 'answer';
export interface DraftPickInput {
    kind: PickKind;
    id?: string;
    target?: string;
}
export interface DraftResponseInput {
    pick?: DraftPickInput;
    respond?: Array<{
        inviteId: string;
        accept: boolean;
    }>;
    swap?: {
        favorId: string;
    };
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
export declare const DEFAULT_PICKS_PER_PARTY = 2;
export declare function isDraftActive(world: any): boolean;
/** A snake order over `rounds` rounds: 1-2-3-3-2-1-1-2-3 ... */
export declare function buildSequence(baseOrder: string[], rounds: number): string[];
/**
 * Starts a pending draft: fixes the base order (lowest standing first, ties by
 * roll) and opens favor swaps if any party holds a favor it could call in.
 */
export declare function startDraft(world: any): EngineEvent[] | RuleError;
/** Who must respond now, and in which mode */
export declare function currentDraftActors(world: any): Array<{
    party: string;
    mode: DraftMode;
}>;
/**
 * Checks a draft response without changing anything.
 */
export declare function validateDraftResponse(world: any, partyId: string, input: DraftResponseInput | undefined): RuleError | null;
/**
 * Applies a validated draft response and advances the draft.
 */
export declare function applyDraftResponse(world: any, partyId: string, input: DraftResponseInput, meta?: {
    reasoning?: string;
    voices?: Record<string, string>;
}): EngineEvent[];
/** The draft as a party may see it: intel titles only, picks without hidden contents */
export declare function publicDraftView(world: any, partyId: string): Record<string, any>;
