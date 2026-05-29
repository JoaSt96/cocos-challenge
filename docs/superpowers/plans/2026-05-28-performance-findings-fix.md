# React Native Performance Findings Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix every repo-wide React Native performance audit finding while preserving the existing Expo Router and feature-folder architecture.

**Architecture:** Keep fixes narrow and local: correct the chart render-prop type at the shared chart boundary, set safe TanStack Query defaults in the central query client, make the search field native-owned while keeping debounced query state in the route, and remove the root modal barrel import. Do not rewrite list rendering because the active long lists already use FlashList v2.

**Tech Stack:** Expo SDK 56, React Native 0.85, React 19, Expo Router, Uniwind, TanStack Query v5, FlashList v2, Skia/Victory Native, Bun test runner.

**Docs checked:** Expo SDK 56 docs at `https://docs.expo.dev/versions/v56.0.0/` confirm this repo's target stack is Expo 56, React Native 0.85, and React 19.2.3.

---

## File Structure

- Modify `src/components/charts/ChartContainer.tsx`
  - Owns the shared chart font loading boundary and the render-prop type exposed to chart consumers.
- Modify `src/features/markets/components/MarketsPriceChart.tsx`
  - No behavior change expected after fixing the shared chart type.
- Modify `src/features/portfolio/components/PortfolioPositionChart.tsx`
  - No behavior change expected after fixing the shared chart type.
- Modify `src/config/query.config.ts`
  - Owns central TanStack Query defaults.
- Create `src/config/query.config.test.ts`
  - Guards that default query cache settings keep data briefly cached instead of immediate garbage collection.
- Modify `src/features/search/components/SearchInputField.tsx`
  - Converts the search input from controlled to uncontrolled.
- Modify `src/features/search/components/SearchResultsView.tsx`
  - Passes an initial input value instead of a controlled value.
- Modify `src/app/_layout.tsx`
  - Imports `ModalProvider` directly instead of through `src/components/modals/index.ts`.
- Optional later cleanup, not required for this plan: remove `src/components/modals/index.ts` only after confirming no external repo imports need the barrel.

---

### Task 1: Fix Chart Font Type Contract

**Files:**

- Modify: `src/components/charts/ChartContainer.tsx`
- Verify: `src/features/markets/components/MarketsPriceChart.tsx`
- Verify: `src/features/portfolio/components/PortfolioPositionChart.tsx`

- [ ] **Step 1: Reproduce the current type failure**

Run:

```bash
bunx tsc --noEmit
```

Expected before the fix:

```text
src/features/markets/components/MarketsPriceChart.tsx(...): error TS2345: Argument of type 'SkFont | null' is not assignable to parameter of type 'SkFont'.
src/features/portfolio/components/PortfolioPositionChart.tsx(...): error TS2345: Argument of type 'SkFont | null' is not assignable to parameter of type 'SkFont'.
```

- [ ] **Step 2: Make the render prop expose a non-null font**

In `src/components/charts/ChartContainer.tsx`, replace the props type with a non-null font contract:

```tsx
type ChartFont = NonNullable<ReturnType<typeof useFont>>

type ChartContainerProps = {
  children: (options: {font: ChartFont}) => ReactNode
}
```

Then update `getDefaultChartAxisOptions` to use the same alias:

```tsx
export const getDefaultChartAxisOptions = (font: ChartFont) => ({
  font,
  tickCount: {x: 3, y: 4},
  labelColor: {
    x: getChartLabelColor(),
    y: getChartLabelColor(),
  },
  lineColor: {
    grid: {x: getChartGridColor(), y: getChartGridColor()},
    frame: getChartFrameColor(),
  },
  lineWidth: {grid: {x: 0, y: 1}, frame: 1},
})
```

Keep the runtime guard unchanged:

```tsx
{
  font ? children({font}) : null
}
```

This narrows the type after the guard and keeps chart consumers simple.

- [ ] **Step 3: Verify typecheck**

Run:

```bash
bunx tsc --noEmit
```

Expected after the fix:

```text
no output, exit code 0
```

---

### Task 2: Set Safe QueryClient Defaults

**Files:**

- Modify: `src/config/query.config.ts`
- Create: `src/config/query.config.test.ts`

- [ ] **Step 1: Add a failing test for query defaults**

Create `src/config/query.config.test.ts`:

```ts
import {describe, expect, test} from "bun:test"

import {queryClient} from "./query.config"

describe("queryClient", () => {
  test("keeps inactive query data cached briefly by default", () => {
    const queryDefaults = queryClient.getDefaultOptions().queries

    expect(queryDefaults?.staleTime).toBe(30_000)
    expect(queryDefaults?.gcTime).toBe(5 * 60_000)
  })
})
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run:

```bash
bun test src/config/query.config.test.ts
```

Expected before implementation:

```text
FAIL
Expected: 30000
Received: 0
```

- [ ] **Step 3: Update the central query defaults**

In `src/config/query.config.ts`, change the defaults to:

```ts
import {QueryClient} from "@tanstack/react-query"

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 5 * 60_000,
      staleTime: 30_000,
    },
  },
})
```

Rationale: existing feature queries already use these values; setting them globally prevents future queries from accidentally using immediate stale/immediate garbage-collection behavior.

- [ ] **Step 4: Run the focused test**

Run:

```bash
bun test src/config/query.config.test.ts
```

Expected:

```text
pass
```

- [ ] **Step 5: Run all tests**

Run:

```bash
bun test
```

Expected:

```text
all tests pass
```

---

### Task 3: Convert Search Input To Uncontrolled

**Files:**

- Modify: `src/features/search/components/SearchInputField.tsx`
- Modify: `src/features/search/components/SearchResultsView.tsx`

- [ ] **Step 1: Keep orders inputs controlled**

Do not change `src/features/orders/components/OrdersNumberInput.tsx`. Those inputs are tied to React Hook Form, validation, computed quantity, and submit payload construction, so controlled state is intentional there.

- [ ] **Step 2: Change `SearchInputField` props**

In `src/features/search/components/SearchInputField.tsx`, replace the prop type:

```tsx
type SearchInputFieldProps = {
  defaultValue?: string
  onChangeText: (value: string) => void
}
```

Then update the component:

```tsx
export const SearchInputField = ({
  defaultValue = "",
  onChangeText,
}: SearchInputFieldProps) => {
  return (
    <Input
      accessibilityLabel="Buscar ticker"
      autoCapitalize="characters"
      autoCorrect={false}
      className="h-12 rounded-lg text-base"
      defaultValue={defaultValue}
      onChangeText={onChangeText}
      placeholder="Buscar ticker"
      returnKeyType="search"
    />
  )
}
```

The important behavior change is removing `value={value}` and using `defaultValue` only for the native initial value.

- [ ] **Step 3: Update `SearchResultsView` call site**

In `src/features/search/components/SearchResultsView.tsx`, change:

```tsx
<SearchInputField onChangeText={onQueryChange} value={query} />
```

to:

```tsx
<SearchInputField defaultValue={query} onChangeText={onQueryChange} />
```

Keep `query` in `SearchResultsViewProps` for now because the route still owns the debounced query state and this avoids a broader screen-state refactor.

- [ ] **Step 4: Run checks**

Run:

```bash
bunx tsc --noEmit
bun test src/features/search/searchText.test.ts
```

Expected:

```text
typecheck passes
searchText tests pass
```

- [ ] **Step 5: Native smoke test with Argent**

Use the Argent workflow required by `AGENTS.md`:

1. Start Metro on port 8081:

```bash
bun run start
```

2. Use Argent discovery first:
   - `describe`
   - `debugger-component-tree`
   - `screenshot`

3. Verify the Search tab:
   - Tap Search.
   - Type a ticker such as `GGAL`.
   - Confirm the input stays responsive and results eventually render.
   - Confirm clearing/retyping does not visually lag.

Expected:

```text
Search input accepts fast typing without flicker or visible lag; debounced results still update.
```

---

### Task 4: Remove Root Modal Barrel Import

**Files:**

- Modify: `src/app/_layout.tsx`
- Leave unchanged unless unused later: `src/components/modals/index.ts`

- [ ] **Step 1: Change root layout import**

In `src/app/_layout.tsx`, replace:

```tsx
import {ModalProvider} from "@/components/modals"
```

with:

```tsx
import {ModalProvider} from "@/components/modals/ModalContext"
```

This avoids evaluating every modal barrel export when the root app layout only needs `ModalProvider`.

- [ ] **Step 2: Verify there are no remaining app imports from the modal barrel**

Run:

```bash
rg -n "from [\"']@/components/modals[\"']" src
```

Expected:

```text
no output
```

- [ ] **Step 3: Keep the barrel for now**

Do not delete `src/components/modals/index.ts` in this task. The direct startup import fixes the performance issue; deleting the barrel is a public-surface cleanup that can be done separately if desired.

- [ ] **Step 4: Run typecheck**

Run:

```bash
bunx tsc --noEmit
```

Expected:

```text
no output, exit code 0
```

---

### Task 5: Full Verification And Bundle Baseline

**Files:**

- No source changes unless prior tasks fail verification.

- [ ] **Step 1: Run repository checks**

Run:

```bash
bun run lint
bun run format:check
bunx tsc --noEmit
bun test
```

Expected:

```text
lint passes
format check passes
typecheck passes
all tests pass
```

- [ ] **Step 2: Export an iOS bundle for a comparable size baseline**

Run:

```bash
rm -rf /tmp/cocos-challenge-export
bunx expo export --platform ios --output-dir /tmp/cocos-challenge-export --clear
find /tmp/cocos-challenge-export/_expo/static/js/ios -type f -name "*.hbc" -print0 | xargs -0 ls -lh
```

Expected:

```text
export succeeds
one Hermes iOS bundle is listed
bundle size is at or below the prior 8.5M baseline, allowing small noise from compiler/cache changes
```

- [ ] **Step 3: Native UI verification**

Use Argent, not Playwright, for the Expo native flow:

1. Keep Metro on port 8081.
2. Use discovery tools before interaction:
   - `describe`
   - `debugger-component-tree`
   - `screenshot`
3. Smoke the affected flows:
   - Markets list renders and navigates to an instrument detail.
   - Instrument detail chart renders or leaves no broken blank/error state while font loads.
   - Search input accepts fast typing and results still update.
   - Portfolio list renders and navigates to a position detail.
   - Position detail chart renders or leaves no broken blank/error state while font loads.

Expected:

```text
No runtime regressions in the affected flows; no visible input lag in Search; no broken chart screens.
```

---

## Self-Review

- Spec coverage:
  - Chart TypeScript failure: Task 1.
  - Query cache defaults: Task 2.
  - Controlled search input: Task 3.
  - Modal barrel import: Task 4.
  - Verification and bundle signal: Task 5.
- Placeholder scan:
  - No `TBD`, `TODO`, or unspecified implementation steps.
- Type consistency:
  - `ChartFont` is defined once and reused by `ChartContainerProps` and `getDefaultChartAxisOptions`.
  - `SearchInputField` exposes `defaultValue` and `onChangeText`; `SearchResultsView` passes those exact props.
  - Query default test asserts the exact default values implemented in `query.config.ts`.
