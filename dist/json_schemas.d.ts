export declare const DecisionResponseSchema: {
    type: string;
    required: string[];
    properties: {
        requestId: {
            type: string;
            pattern: string;
        };
        timestamp: {
            type: string;
            format: string;
        };
        status: {
            type: string;
            enum: string[];
        };
        proposal: {
            type: string;
            required: string[];
            properties: {
                type: {
                    type: string;
                    minLength: number;
                };
                participants: {
                    type: string;
                    items: {
                        type: string;
                    };
                    minItems: number;
                };
                effects: {
                    type: string;
                    items: {
                        type: string;
                        required: string[];
                        properties: {
                            target: {
                                type: string;
                                pattern: string;
                                description: string;
                            };
                            operation: {
                                type: string;
                                enum: string[];
                            };
                            value: {};
                        };
                    };
                };
            };
        };
        meta: {
            type: string;
            properties: {
                llmDecision: {
                    type: string;
                    properties: {
                        frameworkEvaluation: {
                            type: string;
                        };
                        optionsConsidered: {
                            type: string;
                            items: {
                                type: string;
                                required: string[];
                                properties: {
                                    action: {
                                        type: string;
                                    };
                                    score: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                    };
                                    reasoning: {
                                        type: string;
                                    };
                                };
                            };
                        };
                        selectedAction: {
                            type: string;
                            required: string[];
                            properties: {
                                type: {
                                    type: string;
                                };
                                reasoning: {
                                    type: string;
                                };
                            };
                        };
                        character_voices: {
                            type: string;
                            patternProperties: {
                                ".*": {
                                    type: string;
                                };
                            };
                        };
                    };
                };
            };
        };
    };
};
export declare const EffectSchema: {
    type: string;
    required: string[];
    properties: {
        target: {
            type: string;
            pattern: string;
            description: string;
        };
        operation: {
            type: string;
            enum: string[];
        };
        value: {};
    };
};
export declare const PartyIdPattern: RegExp;
export declare const RegionIdPattern: RegExp;
export declare function validateDecisionResponse(data: any): {
    valid: boolean;
    errors: string[];
};
export declare function validateEffect(effect: any): string[];
export declare function validateJsonSafety(jsonString: string): {
    valid: boolean;
    errors: string[];
};
