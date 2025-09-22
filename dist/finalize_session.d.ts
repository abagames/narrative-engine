interface FinalizeResult {
    sessionId: string;
    status: 'finalized';
    finalTurn: number;
    completedAt: string;
    cleanupSummary: {
        deletedFiles: number;
        preservedFiles: string[];
        finalSizeKB: number;
    };
}
export declare function finalizeSession(sessionId: string): Promise<FinalizeResult>;
export {};
