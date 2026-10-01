import { EngineEvent } from './world_rules.js';
interface NextTurnResult {
    turnGenerated: number;
    requestsCreated: string[];
    status: 'ready_for_next_turn' | 'session_complete' | 'draft_in_progress';
    completionReason?: string;
    engineEvents?: EngineEvent[];
}
export declare function generateNextTurn(sessionId: string, targetTurn?: number): Promise<NextTurnResult>;
export {};
