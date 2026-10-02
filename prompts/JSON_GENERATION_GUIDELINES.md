# JSON Generation Guidelines - Common Specifications

## 🎯 Overview

This document provides common guidelines for AI Agents when generating decision response JSON. Referenced by both GM_CORE_MIND.md and PLAYER_MIND.md, it supports error-free and accurate JSON generation. The quest and check rules themselves are defined in QUEST_MANAGEMENT.md.

## ⚠️ Common Error Patterns and Solutions

### 1. Path Notation Errors
```json
// ❌ Absolutely NG: Leading slash
{"target": "/parties/emerald_hunters/location"}

// ✅ Correct notation
{"target": "parties/emerald_hunters/location"}
```

### 2. Batch Setting Errors
```json
// ❌ Batch setting of multiple objects is NG
{"target": "parties", "operation": "set", "value": {
  "emerald_hunters": {...},
  "fire_forge_guild": {...}
}}

// ✅ Split into individual effects
[
  {"target": "parties/emerald_hunters", "operation": "set", "value": {...}},
  {"target": "parties/fire_forge_guild", "operation": "set", "value": {...}}
]
```

### 3. Deciding an Uncertain Outcome Yourself
```json
// ❌ Writing quest progress directly (rejected: "only change through a check outcome")
{"target": "quests/escort_vell/progress/iron_wolves", "operation": "add", "value": 3}

// ✅ Declare a check; the engine rolls and applies one branch
"checks": [{
  "id": "guard_the_wagon", "actor": "iron_wolves", "capability": "combat",
  "outcomes": {
    "success": [{"target": "quests/escort_vell/progress/iron_wolves", "operation": "add", "value": 2}],
    "partial": [{"target": "quests/escort_vell/progress/iron_wolves", "operation": "add", "value": 1},
                {"target": "parties/iron_wolves/conditions/strained", "operation": "set", "value": {"name": "Strained", "capability": "combat"}}],
    "failure": [{"target": "parties/iron_wolves/conditions/wounded", "operation": "set", "value": {"name": "Wounded", "capability": "combat"}}]
  }
}]
```

### 4. Writing Outside Your Permissions
```json
// ❌ A party raising its own capabilities or reputation
{"target": "parties/iron_wolves/capabilities/combat", "operation": "add", "value": 2}
// ❌ A party harming a rival without an opposed check
{"target": "parties/silver_quill/conditions/wounded", "operation": "set", "value": {"name": "Wounded", "capability": "investigation"}}
// ❌ Anyone setting engine-managed values
{"target": "quests/escort_vell/status", "operation": "set", "value": "completed"}
```
The error message `Permission denied: <target> (<reason>)` names the rule. See the permission tables in PLAYER_MIND.md and GM_CORE_MIND.md.

### 5. Missing Balance Checks
```json
// ❌ Payment without balance confirmation
{"target": "parties/party_id/resources/currency", "operation": "add", "value": -100}

// ✅ Execute after confirming balance in advance
// Current currency: 80, Payment: 100 → Execution impossible
// Current currency: 150, Payment: 100 → Execution possible
```
No resource may go below zero. If any effect would do so, the **whole response** is rejected and nothing is applied.

### 6. Incomplete Checks
```json
// ❌ Missing failure branch (rejected before the roll)
{"id": "c1", "actor": "iron_wolves", "capability": "combat", "outcomes": {"success": [...], "partial": [...]}}

// ❌ situational outside -1..+1, more than 2 checks, or actor other than your own party
```

## 🔧 Basic JSON Structure

### GM Decision Response
```json
{
  "requestId": "request_GM_1234567890",
  "timestamp": "2025-09-17T22:00:00.000Z",
  "status": "completed",
  "proposal": {
    "type": "issue_quest",
    "participants": ["GM"],
    "effects": [
      {
        "target": "quests/find_the_heir",
        "operation": "set",
        "value": {"title": "Find the Heir", "client": "duchess_ilse", "location": "old_road", "requiredProgress": 3, "deadlineTurn": 9, "reward": {"reputation": 3}}
      }
    ]
  }
}
```

### Player Decision Response
```json
{
  "requestId": "request_emerald_hunters_1234567890",
  "timestamp": "2025-09-17T22:00:00.000Z",
  "status": "completed",
  "proposal": {
    "type": "pursue_quest",
    "participants": ["emerald_hunters"],
    "effects": [],
    "checks": [
      {
        "id": "track_the_heir",
        "description": "Rex follows cart tracks into the fog",
        "actor": "emerald_hunters",
        "capability": "exploration",
        "outcomes": {
          "success": [{"target": "quests/find_the_heir/progress/emerald_hunters", "operation": "add", "value": 2}],
          "partial": [{"target": "quests/find_the_heir/progress/emerald_hunters", "operation": "add", "value": 1},
                      {"target": "parties/emerald_hunters/conditions/strained", "operation": "set", "value": {"name": "Strained", "capability": "exploration"}}],
          "failure": [{"target": "parties/emerald_hunters/conditions/wounded", "operation": "set", "value": {"name": "Wounded", "capability": "exploration"}}]
        }
      }
    ]
  },
  "meta": {
    "llmDecision": {
      "frameworkEvaluation": {
        "aggressive_opportunist": "Reason for application",
        "risk_taking_decisive": "Reason for application"
      },
      "character_voices": {
        "Rex": "'Character's statement'",
        "Ruby": "'Character's statement'"
      },
      "selectedAction": {
        "type": "pursue_quest",
        "reasoning": "Detailed selection reasoning"
      }
    }
  }
}
```

## 📝 Operation Types

### "set" - Complete Value Replacement
```json
{"target": "parties/party_id/location", "operation": "set", "value": "new_region"}
{"target": "threads/thread_id/status", "operation": "set", "value": "resolved"}
```

### "add" - Value Addition/Appending
```json
// Numerical addition
{"target": "clocks/clock_id/filled", "operation": "add", "value": 1}
{"target": "parties/party_id/resources/currency", "operation": "add", "value": -50}

// Object merging
{"target": "parties/party_id/resources/materials", "operation": "add", "value": {"gems": 3}}

// Array appending (a single item or an array of items)
{"target": "quests/quest_id/acceptedBy", "operation": "add", "value": "party_id"}
{"target": "narrativeContext/rumors", "operation": "add", "value": ["rumor one", "rumor two"]}
```

### Values the Engine Maintains
- Moving a party (`parties/<id>/location`) updates `regions/*/occupantParties` automatically; do not edit occupancy by hand
- Quest progress is clamped to ≥ 0 at the end of the turn. Morale no longer exists: setbacks are conditions (`parties/<id>/conditions/<key>` = `{name, capability}`; `null` clears one)
- `quests/*/status`, `quests/*/progress` (outside checks), `clocks/*/triggered`, `rng`, `checkLog`, `chronicle`, `guild/standings`, `guild/promoted` cannot be written

## 🔍 Pre-Check Procedures

1. **Load worldStateFile**: Obtain current state from decision request's `worldStateFile`
2. **Permission Check**: Every target is inside your role's permissions (GM / Player tables)
3. **Uncertainty Check**: Uncertain outcomes are checks with all three branches
4. **Balance & Location Check**: No resource below zero; quest progress only at the quest's location; moves only to neighbors
5. **ID Consistency Check**: requestId and `participants[0]` refer to the same party
6. **Path Notation Check**: No leading slash, appropriate hierarchical structure

Following these guidelines enables error-free and stable JSON generation.
