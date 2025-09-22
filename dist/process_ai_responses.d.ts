interface ProcessResult {
    processedDecisions: number;
    actionsExecuted: number;
    errors: Array<{
        requestId: string;
        error: string;
        details?: any;
        partyId?: string;
        severity: 'warning' | 'error' | 'critical';
    }>;
    failedDecisions: string[];
    partiallySuccessful: boolean;
    criticalErrorCount: number;
    nextStatus: 'error' | 'error_abort' | 'turn_completed' | 'completed' | 'partial_success';
}
export declare function processAiResponses(sessionId: string): Promise<ProcessResult>;
export {};
