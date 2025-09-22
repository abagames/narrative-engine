interface NextTurnResult {
    turnGenerated: number;
    requestsCreated: string[];
    status: 'ready_for_next_turn' | 'session_complete';
    completionReason?: string;
}
export declare function generateNextTurn(sessionId: string, targetTurn?: number): Promise<NextTurnResult>;
export {};
