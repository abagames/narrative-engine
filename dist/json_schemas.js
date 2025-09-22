export const DecisionResponseSchema = {
    type: "object",
    required: ["requestId", "timestamp", "status", "proposal"],
    properties: {
        requestId: {
            type: "string",
            pattern: "^request_",
        },
        timestamp: {
            type: "string",
            format: "date-time",
        },
        status: {
            type: "string",
            enum: ["completed", "failed", "partial"],
        },
        proposal: {
            type: "object",
            required: ["type", "participants", "effects"],
            properties: {
                type: {
                    type: "string",
                    minLength: 1,
                },
                participants: {
                    type: "array",
                    items: { type: "string" },
                    minItems: 1,
                },
                effects: {
                    type: "array",
                    items: {
                        type: "object",
                        required: ["target", "operation", "value"],
                        properties: {
                            target: {
                                type: "string",
                                pattern: "^[^/].*[^/]$", // No leading or trailing slashes
                                description: "Path like 'parties/party_id/property' (no leading slash)",
                            },
                            operation: {
                                type: "string",
                                enum: ["set", "add"],
                            },
                            value: {
                            // Can be any type: number, string, object, array
                            },
                        },
                    },
                },
            },
        },
        meta: {
            type: "object",
            properties: {
                llmDecision: {
                    type: "object",
                    properties: {
                        frameworkEvaluation: { type: "object" },
                        optionsConsidered: {
                            type: "array",
                            items: {
                                type: "object",
                                required: ["action", "score", "reasoning"],
                                properties: {
                                    action: { type: "string" },
                                    score: { type: "number", minimum: 0, maximum: 10 },
                                    reasoning: { type: "string" },
                                },
                            },
                        },
                        selectedAction: {
                            type: "object",
                            required: ["type", "reasoning"],
                            properties: {
                                type: { type: "string" },
                                reasoning: { type: "string" },
                            },
                        },
                        character_voices: {
                            type: "object",
                            patternProperties: {
                                ".*": { type: "string" },
                            },
                        },
                    },
                },
            },
        },
    },
};
export const EffectSchema = {
    type: "object",
    required: ["target", "operation", "value"],
    properties: {
        target: {
            type: "string",
            pattern: "^[a-zA-Z0-9_]+(/[a-zA-Z0-9_]+)+$", // At least 2 levels, no leading slash
            description: "Target path like 'parties/party_id/morale'",
        },
        operation: {
            type: "string",
            enum: ["set", "add"],
        },
        value: {
        // Can be any type
        },
    },
};
// Party and Region IDs are generated dynamically per world, so we only validate basic format
export const PartyIdPattern = /^[a-zA-Z0-9_]+$/;
export const RegionIdPattern = /^[a-zA-Z0-9_]+$/;
export function validateDecisionResponse(data) {
    const errors = [];
    // Basic structure validation
    if (!data || typeof data !== "object") {
        errors.push("Response must be an object");
        return { valid: false, errors };
    }
    // Required fields
    const requiredFields = ["requestId", "timestamp", "status", "proposal"];
    for (const field of requiredFields) {
        if (!(field in data)) {
            errors.push(`Missing required field: ${field}`);
        }
    }
    // RequestId format
    if (data.requestId && !data.requestId.startsWith("request_")) {
        errors.push('requestId must start with "request_"');
    }
    // Status validation
    if (data.status &&
        !["completed", "failed", "partial"].includes(data.status)) {
        errors.push('status must be "completed", "failed", or "partial"');
    }
    // Proposal validation
    if (data.proposal) {
        const proposal = data.proposal;
        if (!proposal.type || typeof proposal.type !== "string") {
            errors.push("proposal.type is required and must be a string");
        }
        if (!Array.isArray(proposal.participants) ||
            proposal.participants.length === 0) {
            errors.push("proposal.participants must be a non-empty array");
        }
        if (!Array.isArray(proposal.effects)) {
            errors.push("proposal.effects must be an array");
        }
        else {
            // Validate effects
            proposal.effects.forEach((effect, index) => {
                const effectErrors = validateEffect(effect);
                effectErrors.forEach((error) => {
                    errors.push(`Effect ${index}: ${error}`);
                });
            });
        }
    }
    return { valid: errors.length === 0, errors };
}
export function validateEffect(effect) {
    const errors = [];
    if (!effect || typeof effect !== "object") {
        errors.push("Effect must be an object");
        return errors;
    }
    // Required fields
    if (!effect.target || typeof effect.target !== "string") {
        errors.push("target is required and must be a string");
    }
    else {
        // Path format validation
        if (effect.target.startsWith("/")) {
            errors.push('target path must not start with "/" (use "parties/..." not "/parties/...")');
        }
        const pathParts = effect.target.split("/").filter((p) => p);
        if (pathParts.length < 2) {
            errors.push('target path must have at least 2 levels (e.g., "parties/party_id")');
        }
        // Basic format validation for dynamic IDs
        if (pathParts[0] === "parties" &&
            pathParts[1] &&
            !PartyIdPattern.test(pathParts[1])) {
            errors.push(`Invalid party ID format: ${pathParts[1]}. Must contain only alphanumeric characters and underscores`);
        }
        if (pathParts[0] === "regions" &&
            pathParts[1] &&
            !RegionIdPattern.test(pathParts[1])) {
            errors.push(`Invalid region ID format: ${pathParts[1]}. Must contain only alphanumeric characters and underscores`);
        }
    }
    if (!effect.operation || !["set", "add"].includes(effect.operation)) {
        errors.push('operation must be "set" or "add"');
    }
    if (!("value" in effect)) {
        errors.push("value is required");
    }
    // Currency operation validation
    if (effect.target &&
        effect.target.includes("/currency") &&
        effect.operation === "add" &&
        typeof effect.value === "number" &&
        effect.value < 0) {
        // This is a currency deduction - we'll validate balance at runtime
        // But we can warn about the pattern
    }
    return errors;
}
export function validateJsonSafety(jsonString) {
    const errors = [];
    try {
        const parsed = JSON.parse(jsonString);
        // Check for potentially dangerous patterns
        const dangerousPatterns = [
            /__proto__/,
            /constructor/,
            /prototype/,
            /\.\.\/|\/\.\./, // Path traversal (only with slashes)
            /eval\s*\(/,
            /Function\s*\(/,
            /require\s*\(/,
            /import\s*\(/,
        ];
        for (const pattern of dangerousPatterns) {
            if (pattern.test(jsonString)) {
                errors.push(`Potentially dangerous pattern detected: ${pattern.source}`);
            }
        }
        return { valid: errors.length === 0, errors };
    }
    catch (error) {
        errors.push(`Invalid JSON: ${error instanceof Error ? error.message : "Unknown error"}`);
        return { valid: false, errors };
    }
}
//# sourceMappingURL=json_schemas.js.map