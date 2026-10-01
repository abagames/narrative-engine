export interface DecisionRequest {
    requestId: string;
    timestamp: string;
    sessionId: string;
    worldStateFile: string;
    framework: {
        role: 'GM' | 'Player';
        actorId?: string;
    };
    contextData: Record<string, any>;
    instructions: string;
}
/**
 * Writes requests for the parties that must act in the draft right now.
 */
export declare function writeDraftRequests(sessionId: string, worldState: any, requestsDir: string, recentHistory: any[]): Promise<string[]>;
export declare function writeDecisionRequests(sessionId: string, worldState: any, requestsDir: string, recentHistory: any[]): Promise<string[]>;
export declare function generateGMContextData(worldState: any, recentHistory: any[]): Record<string, any>;
export declare function generatePartyContextData(partyId: string, party: any, worldState: any, recentHistory: any[]): Record<string, any>;
export declare function getVisibleRegions(party: any, regions: Record<string, any>): any[];
export declare function getAvailableActions(party: any, regions: Record<string, any>, activeQuestCount?: number): string[];
/**
 * Reads recent events from playlog.jsonl. Turn entries that carry an
 * `actions` array are expanded so every actor's action is visible.
 */
export declare function readRecentHistory(sessionDir: string, limit?: number): Promise<any[]>;
