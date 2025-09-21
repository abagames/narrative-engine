# Repository Guidelines

This repo hosts the Universal Narrative Engine (UNE). It implements a region graph-based life simulation engine with complex economic, social, and exploration mechanics. AI coding agents (e.g. Claude Code) act as autonomous TRPG GM/Player to generate narrative logs through automated gameplay.

## Project Structure & Module Organization

- `prompts/` — AI decision framework files (all documents used by AI agents)
  - **AI Agent Workflow:**
    - `AI_AGENT_FILE_WORKFLOW.md` - AI Coding Agent 用ファイルベース自律実行ワークフロー（ファイル I/O のみでの完全自律セッション実行手順）
  - **Core Decision Frameworks:**
    - `GM_CORE_MIND.md` - GM 思考フレームワーク (NPC actions, environmental control)
    - `PLAYER_MIND.md` - プレイヤー思考フレームワーク (character decisions, tactical evaluation)
  - **Combat & Interaction Systems:**
    - `INDIVIDUAL_COMBAT_SYSTEM.md` - 個人戦闘システムフレームワーク
    - `TACTICAL_PATTERNS.md` - 戦術パターン定義
    - `DIALOGUE_SYSTEM.md` - キャラクター対話システム
    - `NPC_PERSONALITIES.md` - NPC 個性パターン
  - **Multi-Party & Social Systems:**
    - `GUILD_MANAGEMENT.md` - ギルド管理システム
    - `ALLIANCE_STRATEGY.md` - 同盟戦略
    - `QUEST_MANAGEMENT.md` - クエスト管理システム
    - `ACHIEVEMENT_PURSUIT.md` - 実績追求システム
    - `COMPETITIVE_EVENTS.md` - 競争イベント
  - **Novel Generation System:**
    - `PARTY_PERSPECTIVE_NOVEL_CONVERSION.md` - パーティー視点小説変換（メインプロセス）
    - `CHARACTER_PERSONALITY_TEMPLATES.md` - キャラクター性格テンプレート（マルチパーティー戦略・交渉パターン統合）
    - `NOVEL_CONVERSION_EXAMPLES.md` - 小説変換例と品質チェックリスト
- `autonomous_sessions/` — AI Agent ファイルベース自律実行用標準ディレクトリ

  - `sessions/session_YYYYMMDD_HHMMSS/` — セッション管理（世界状態、プレイログ、ナラティブ）
  - `ai_workspace/` — AI Agent 作業領域（決定要求・応答ファイル、世界状態スナップショット）

- `src/` — tools source code
- `test/` — unit tests
- `dist/` — build output

## Autonomous TRPG Execution Mode

AI coding agents must follow the **complete workflow** defined in `prompts/AI_AGENT_FILE_WORKFLOW.md` for autonomous session execution. This includes file-based state management, decision processing phases, and narrative generation procedures.

### Decision Framework Usage

AI coding agents must **actively consult and apply** the appropriate decision frameworks:

**Before each action, determine your perspective:**

- **NPC が行動する時**: `prompts/GM_CORE_MIND.md`を読み、GM 思考フレームワークを適用
- **プレイヤーキャラクターが行動する時**: `prompts/PLAYER_MIND.md`を読み、キャラクター固有の判断基準を適用
- **個人戦闘が発生する時**: `prompts/INDIVIDUAL_COMBAT_SYSTEM.md`を読み、パーティメンバー個人の剣と魔法の戦闘を詳細処理
- **戦闘中の戦術判断**: `prompts/TACTICAL_PATTERNS.md`で戦術パターンを選択し、状況に応じた最適な行動を決定
- **戦闘中の台詞生成**: `prompts/DIALOGUE_SYSTEM.md`でキャラクター個性に応じた戦闘台詞を生成
- **社会システム**: `prompts/GUILD_MANAGEMENT.md`, `prompts/ALLIANCE_STRATEGY.md`, `prompts/QUEST_MANAGEMENT.md`, `prompts/ACHIEVEMENT_PURSUIT.md`, `prompts/COMPETITIVE_EVENTS.md` でギルド・同盟・クエスト・実績・競争システムを管理
- **マルチパーティー戦略**: `prompts/CHARACTER_PERSONALITY_TEMPLATES.md` に統合されたマルチパーティー戦略・交渉パターン・信頼管理を参照
- **探索協調**: `prompts/GM_CORE_MIND.md` に統合された探索協調管理を参照

### Core Execution Principles

#### Framework Application

- **MUST READ FRAMEWORKS**: 各ターンで必ず`prompts/GM_CORE_MIND.md`または`prompts/PLAYER_MIND.md`を読み込んで適用。必要に応じて関連する補助文書も併用
- **AI AGENT DECISION MAKING**: AI agent が各ターンでフレームワークを読み込み、評価軸・計算式を実際に適用して意思決定
- **FRAMEWORK-DRIVEN EVALUATION**: 各プロンプトの判断フレームワークに従って数値的評価を行い、最も高いスコアの行動を選択
- **DECISION ISOLATION**: AI Agent の思考・判断プロセスはツールによって自動化されず、AI Agent が直接フレームワークを適用して実行

#### Combat & Interaction Systems

- **INDIVIDUAL COMBAT**: `conflict`アクション時は`prompts/INDIVIDUAL_COMBAT_SYSTEM.md`を読み、パーティメンバー個人レベルでの剣と魔法の戦闘を完全実行
- **TACTICAL COMBAT**: 戦闘中は`prompts/TACTICAL_PATTERNS.md`で戦術パターンを評価・選択し、`prompts/DIALOGUE_SYSTEM.md`で個性に応じた台詞生成
- **COMBAT DETAIL REQUIREMENT**: 戦闘時は抽象的な結果ではなく、個人の剣撃・魔法詠唱・ダメージを完全記録

#### Life Simulation & Social Systems

- **LIFE SIMULATION**: 地域ベースシステムでは`prompts/GUILD_MANAGEMENT.md`等の社会システム文書を活用し、経済・外交・探索活動を実行
- **PERSISTENT STATE MANAGEMENT**: 全ての状態・決定をファイルに永続化し、`autonomous_sessions/` ディレクトリ構造で管理

### Tool Usage Policy

#### Allowed Tools

- **ファイルベース永続化ツール**: `start_session.ts`, `process_ai_responses.ts`, `append_playlog.ts`, `generate_next_turn.ts`, `finalize_session.ts` は世界状態・プレイログ記録用として許可

#### Forbidden Tools & Practices

- **事前プログラムされた AI 決定ロジック**: makeGMDecision、executePlayerPhase 等の使用禁止
- **自動化ゲームループ**: demo_session.js 等の使用禁止
- **デモ用コード生成**: 新たな自動化スクリプトの実装禁止
