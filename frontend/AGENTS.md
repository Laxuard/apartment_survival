# Frontend Operational & Design System Rules

## 1. Design Token System ("Warm Modernism")
- Strictly use defined CSS variable tokens for theming:
  - `--oak` (primary / grounding tone)
  - `--sage` (accent / muted secondary)
  - `--canvas` (background)
  - `--card` (surface / card background)
  - `--border` (subtle structural divider)
- Forbid arbitrary ad-hoc Tailwind class soup on foundational elements (buttons, cards, inputs). Mandate usage of reusable UI components: `@/components/ui/button`, `@/components/ui/card`.

## 2. Defensive UI & Layout Stability
- **No Early-Return Skeletons**: Do not use full-page or early-return skeletons that unmount layout trees. Wrap content states inside `<DataCard>` or stable container wrappers.
- **CLS Prevention**: Always lock `min-height` on asynchronous containers and dynamic lists to eliminate Cumulative Layout Shift (CLS).
- **Segmented / Tab Switchers**: Tab switchers MUST use a single absolute sliding pill (`translate-x-0` ↔ `translate-x-full`) with `transition-colors` on buttons. Never animate individual button backgrounds independently.

## 3. State Management & Navigation Flow
- **Reverse Onboarding**: Keep onboarding wizard state in frontend memory/session state until final account creation. Never create orphan household or user accounts before explicit confirmation.


