interface AppendResult {
    success: boolean;
    entriesAdded: number;
    error?: string;
    validationErrors?: string[];
}
export declare function appendPlaylog(sessionId: string, turnPlaylogFilename: string): Promise<AppendResult>;
export {};
