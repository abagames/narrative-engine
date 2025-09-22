interface SessionResult {
    sessionId: string;
    status: string;
    firstTurnRequests: string[];
    workspaceDir: string;
}
export declare function startSession(worldInitialPath: string, sessionConfigPath: string): Promise<SessionResult>;
export {};
