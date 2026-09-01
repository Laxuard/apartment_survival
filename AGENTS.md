# Agent Operational Constraints & Token Preservation Policy

## 1. Token Conservation & Mutation Policy
- **Targeted Edits Only**: NEVER rewrite entire files for minor modifications. Always use `replace_file_content` targeting specific line numbers and exact search-and-replace blocks.
- **Bounded File Inspection**: When viewing code with `view_file`, always supply explicit `StartLine` and `EndLine` slices. Never ingest more than 150 lines in a single view call.
- **Focused Code Search**: Forbid broad, unindexed grep searches or autonomous recursive crawling across unrelated directories. Target exact paths and extensions.

## 2. Background Execution & Reactive Wakeup Discipline
- **No Task Polling**: NEVER loop or spam `manage_task(Action='status')` or rapid timer schedules while waiting for background tasks (e.g. `mvnw test`, `npm build`). Launch the command and let Antigravity's reactive message notification deliver the completion result.

## 3. Interface Contracts & Navigation
- **API Contracts Manifest**: Always check `docs/API_CONTRACTS.md` for schemas, DTOs, and endpoints before modifying or invoking API interfaces.
- **Contract Auto-Sync Rule**: Whenever modifying, creating, or removing a DTO, endpoint, or request/response shape in either frontend or backend, you MUST immediately update `docs/API_CONTRACTS.md` within the same turn to reflect the new shape and status (`[SYNCED]`, `[BACKEND-ONLY]`, `[FRONTEND-MOCK]`).
- **Clarification Over Ingestion**: If an endpoint or schema contract is missing or ambiguous, ask directly rather than recursively crawling controllers, repositories, and entity files.

## 4. Communication Style
- **Zero-Fluff Execution**: Be concise and direct. State exact actions taken, files edited, and commands executed. Avoid conversational recaps, repetitive summaries, and explanations of untouched code.

## 5. UI Architecture & Motion System Rules
- **Semantic Tokens Only**: Never use raw hex colors or hardcoded borders in card/modal components. Always reference CSS variables (`var(--card)`, `var(--canvas)`, `var(--border)`, `var(--oak)`, `var(--muted)`).
- **Mandatory DataCard Pattern**: All data-driven cards, rosters, and activity feeds MUST use `@/components/ui/DataCard` with structured `skeleton`, `emptyState`, and `headerAction` props.
- **Segmented / Tab Switchers**: Tab switchers MUST use a single absolute sliding pill (`translate-x-0` ↔ `translate-x-full`) with `transition-colors` on buttons to eliminate color-fading ghost highlights.
- **Stabilized Container Heights**: Modals and tabbed views MUST enforce stabilized container dimensions (`min-h-[...] flex flex-col justify-between`) to prevent vertical layout shifts when toggling tabs.

