# Markets Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the complete Markets feature for the Cocos challenge: fetch `/instruments`, validate and normalize data, render a production-minded instruments screen, and wire the root route to the feature through Expo Router.

**Architecture:** `src/app/` remains routing-only. `src/features/markets/` owns API calls, TanStack Query factories, UI-facing query hooks, market math, types, and feature-prefixed components. Presentational components receive plain props and never import API or TanStack Query hooks.

**Tech Stack:** Expo SDK 56, Expo Router Stack, React Native, TypeScript, TanStack Query v5, Axios, Zod, Uniwind, class-variance-authority, FlashList or FlatList.

---

## References Used

- Expo SDK 56 docs: `https://docs.expo.dev/versions/v56.0.0/`
- Expo Router Stack docs: `https://docs.expo.dev/router/advanced/stack/`
- Expo Router navigation docs: `https://docs.expo.dev/router/basics/navigation/`
- Expo typed routes docs: `https://docs.expo.dev/router/reference/typed-routes/`
- Local Expo `building-native-ui` skill: route files in `src/app`, use `_layout.tsx` for stacks, keep route files free of feature implementation.
- Local `tanstack-query-best-practices` skill: array query keys, include every variable, query option factories, targeted invalidation, sensible stale/gc times.
- Local `ui-ux-pro-max` skill: fintech/trading UI should be dense, scannable, accessible, touch-friendly, and restrained.

## User-Facing Result

The app opens to a Markets screen that feels like a lightweight Coinbase/Binance Lite/Robinhood watchlist:

- Header title: `Markets`.
- Supporting copy: `Acciones argentinas en pesos`.
- A compact summary strip:
  - total instruments count
  - number up today
  - number down today
- Instrument list rows with:
  - ticker
  - company name
  - last price in pesos
  - daily return percentage
  - profit/loss color state
- Pull-to-refresh.
- Loading skeletons.
- Empty state.
- Error state with retry.
- Pressing an instrument calls `onInstrumentPress(instrument)`. Until the Orders feature exists, `MarketsScreen` can show a small `Alert.alert` or no-op callback, but all component props must already support the future order modal.

## File Map

Create:

- `src/features/markets/api/markets.api.ts`
  - Raw `GET /instruments`.
  - Zod validation.
  - Response normalization.
- `src/features/markets/queries/marketsQueries.ts`
  - Query keys.
  - `queryOptions` factory.
- `src/features/markets/hooks/useMarketsInstrumentsQuery.ts`
  - Only Markets file that imports `useQuery`.
- `src/features/markets/components/MarketsScreen.tsx`
  - Feature screen/container.
  - Calls `useMarketsInstrumentsQuery`.
  - Wires refresh/retry/press handlers.
- `src/features/markets/components/MarketsInstrumentList.tsx`
  - Presentational list.
- `src/features/markets/components/MarketsInstrumentRow.tsx`
  - Pressable, feature-prefixed row.
- `src/features/markets/components/MarketsInstrumentReturnBadge.tsx`
  - Profit/loss/flat badge.
- `src/features/markets/components/MarketsSummaryStrip.tsx`
  - Compact count/up/down summary.
- `src/features/markets/components/MarketsLoadingState.tsx`
  - Skeleton/loading rows.
- `src/features/markets/components/MarketsErrorState.tsx`
  - Retry UI.
- `src/features/markets/components/MarketsEmptyState.tsx`
  - No-data UI.
- `src/features/markets/marketMath.ts`
  - Pure calculation helpers.
- `src/features/markets/marketFormatters.ts`
  - Peso and percent display helpers local to Markets for now.
- `src/features/markets/types.ts`
  - `MarketsInstrument`, `MarketsInstrumentDirection`.

Modify:

- `src/app/_layout.tsx`
  - Wrap providers around an Expo Router `Stack`.
- `src/app/index.tsx`
  - Render only `<MarketsScreen />`.
- `README.md`
  - Only if needed to document that the initial implemented slice is Markets.

Do not modify:

- `src/features/home-example/`
- Portfolio, orders, or search feature folders.
- Global query defaults unless implementation proves they are actively harmful.

## Data Contract

Raw `/instruments` item:

```ts
type MarketsInstrumentApiItem = {
  id: number
  ticker: string
  name: string
  type: string
  last_price: number
  close_price: number
}
```

Normalized item:

```ts
export type MarketsInstrument = {
  id: number
  ticker: string
  name: string
  type: string
  lastPrice: number
  closePrice: number
  dailyReturnPercent: number
  direction: "up" | "down" | "flat"
}
```

Calculation rules:

```ts
export const getMarketsDailyReturnPercent = ({
  lastPrice,
  closePrice,
}: {
  lastPrice: number
  closePrice: number
}) => {
  if (closePrice <= 0) {
    return 0
  }

  return ((lastPrice - closePrice) / closePrice) * 100
}

export const getMarketsInstrumentDirection = (
  dailyReturnPercent: number
): "up" | "down" | "flat" => {
  if (dailyReturnPercent > 0) {
    return "up"
  }

  if (dailyReturnPercent < 0) {
    return "down"
  }

  return "flat"
}
```

Query key:

```ts
export const marketsQueries = {
  all: ["markets"] as const,
  instruments: () =>
    queryOptions({
      queryKey: ["markets", "instruments"] as const,
      queryFn: getMarketsInstruments,
      staleTime: 30_000,
      gcTime: 5 * 60_000,
    }),
} as const
```

## UX/UI Plan

Use the existing app theme:

- Background: `bg-background`.
- Cards/rows: `bg-card`, `border-border`.
- Positive return: `text-profit`, soft `bg-success` only for stronger badges if readable.
- Negative return: `text-loss`, soft destructive treatment.
- Neutral return: `text-muted-foreground`.

Layout:

- Root content uses a scrollable/list surface that respects safe areas.
- Screen has no marketing hero.
- Use compact header text and list rows, not oversized landing-page typography.
- Row height target: `72px` minimum.
- Pressable hit area: at least `44px`; add `hitSlop` only if row action targets become small.
- Use tabular number alignment where React Native supports it through `style={{fontVariant: ["tabular-nums"]}}`.
- Keep every row scannable:
  - left: ticker bold, name muted below
  - right: last price, return badge below

Interaction:

- Pull-to-refresh calls `refetch`.
- Error state button calls `refetch`.
- Row press calls a prop callback; do not introduce order logic.
- Loading state reserves stable row height to avoid content jumping.

Accessibility:

- Pressable rows use `accessibilityRole="button"`.
- Row accessibility label includes ticker, name, price, and return.
- Important market data text should be selectable where reasonable.
- Color is not the only status signal; include sign and percent text.

## Task 1: Route Shell With Expo Router Stack

**Files:**

- Modify: `src/app/_layout.tsx`
- Modify: `src/app/index.tsx`

- [ ] Replace `Slot` with `Stack` inside existing providers.

Expected shape:

```tsx
import {QueryClientProvider} from "@tanstack/react-query"
import {Stack} from "expo-router"
import {KeyboardProvider} from "react-native-keyboard-controller"

import "../global.css"

import {queryClient} from "@/config/query.config"

export default function Layout() {
  return (
    <QueryClientProvider client={queryClient}>
      <KeyboardProvider>
        <Stack
          screenOptions={{
            headerLargeTitle: true,
            headerShadowVisible: false,
            contentStyle: {
              backgroundColor: "#FAFBF7",
            },
          }}
        >
          <Stack.Screen name="index" options={{title: "Markets"}} />
        </Stack>
      </KeyboardProvider>
    </QueryClientProvider>
  )
}
```

- [ ] Replace the placeholder color screen in `src/app/index.tsx` with a route-only render.

Expected shape:

```tsx
import {MarketsScreen} from "@/features/markets/components/MarketsScreen"

export default function IndexRoute() {
  return <MarketsScreen />
}
```

- [ ] Run:

```bash
bunx prettier --check src/app/_layout.tsx src/app/index.tsx
```

Expected: both files use Prettier style.

## Task 2: Markets Types And Math

**Files:**

- Create: `src/features/markets/types.ts`
- Create: `src/features/markets/marketMath.ts`
- Create: `src/features/markets/marketFormatters.ts`

- [ ] Add `MarketsInstrument`, `MarketsInstrumentDirection`, and API item types.
- [ ] Add pure helpers for daily return, direction, and summary counts.
- [ ] Add local formatters:

```ts
export const formatMarketsPeso = (amount: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  }).format(amount)

export const formatMarketsPercent = (value: number) =>
  `${value > 0 ? "+" : ""}${value.toFixed(2)}%`
```

- [ ] Guard all math against invalid close prices.
- [ ] Keep helpers deterministic and side-effect-free.
- [ ] Run:

```bash
bunx prettier --check src/features/markets/types.ts src/features/markets/marketMath.ts src/features/markets/marketFormatters.ts
```

Expected: all files pass formatting.

## Task 3: Markets API And Validation

**Files:**

- Create: `src/features/markets/api/markets.api.ts`

- [ ] Use `api` from `src/config/api.config.ts`.
- [ ] Use Zod to validate an array response.
- [ ] Normalize snake_case API fields to camelCase feature data.
- [ ] Throw a clear `Error("Invalid instruments response")` if validation fails.

Expected public function:

```ts
export const getMarketsInstruments = async (): Promise<MarketsInstrument[]> => {
  const response = await api.get("/instruments")
  const parsed = marketsInstrumentsResponseSchema.safeParse(response.data)

  if (!parsed.success) {
    throw new Error("Invalid instruments response")
  }

  return parsed.data.map(toMarketsInstrument)
}
```

- [ ] Run:

```bash
bunx prettier --check src/features/markets/api/markets.api.ts
```

Expected: file passes formatting.

## Task 4: Markets Query Factory And Hook

**Files:**

- Create: `src/features/markets/queries/marketsQueries.ts`
- Create: `src/features/markets/hooks/useMarketsInstrumentsQuery.ts`

- [ ] Add a query factory using `queryOptions` from `@tanstack/react-query`.
- [ ] Use readonly array query keys.
- [ ] Include every query function variable in the query key. For this first query, there are no variables.
- [ ] Set `staleTime: 30_000` and `gcTime: 5 * 60_000` in the factory, because market prices are fresh enough for challenge UX but should not refetch every render.
- [ ] Add the only Markets UI hook that imports `useQuery`.

Expected hook shape:

```ts
import {useQuery} from "@tanstack/react-query"

import {marketsQueries} from "../queries/marketsQueries"

export const useMarketsInstrumentsQuery = () => {
  return useQuery(marketsQueries.instruments())
}
```

- [ ] Run:

```bash
bunx prettier --check src/features/markets/queries/marketsQueries.ts src/features/markets/hooks/useMarketsInstrumentsQuery.ts
```

Expected: files pass formatting.

## Task 5: Presentational Market Components

**Files:**

- Create: `src/features/markets/components/MarketsInstrumentReturnBadge.tsx`
- Create: `src/features/markets/components/MarketsInstrumentRow.tsx`
- Create: `src/features/markets/components/MarketsInstrumentList.tsx`
- Create: `src/features/markets/components/MarketsSummaryStrip.tsx`
- Create: `src/features/markets/components/MarketsLoadingState.tsx`
- Create: `src/features/markets/components/MarketsErrorState.tsx`
- Create: `src/features/markets/components/MarketsEmptyState.tsx`

- [ ] Every component file and export starts with `Markets`.
- [ ] Components receive plain props only.
- [ ] No presentational component imports `useQuery`, `api`, or query factories.
- [ ] Use shared UI primitives only behind feature-owned components.
- [ ] Use `Pressable` for rows.
- [ ] Use literal Uniwind `className` strings or `cva`; do not build Tailwind class names dynamically.

Component contracts:

```ts
type MarketsInstrumentRowProps = {
  instrument: MarketsInstrument
  onPress: (instrument: MarketsInstrument) => void
}

type MarketsInstrumentListProps = {
  instruments: MarketsInstrument[]
  refreshing: boolean
  onRefresh: () => void
  onInstrumentPress: (instrument: MarketsInstrument) => void
}

type MarketsErrorStateProps = {
  message: string
  onRetry: () => void
}
```

- [ ] Prefer `FlashList` if it integrates cleanly; otherwise use React Native `FlatList` to avoid extra setup. The challenge list has 26 items, so `FlatList` is acceptable.
- [ ] Run:

```bash
bunx prettier --check src/features/markets/components
```

Expected: components pass formatting.

## Task 6: Markets Screen Container

**Files:**

- Create: `src/features/markets/components/MarketsScreen.tsx`

- [ ] Call `useMarketsInstrumentsQuery`.
- [ ] Derive summary counts from normalized instruments.
- [ ] Render:
  - loading state while first load is pending
  - error state when query fails
  - empty state when data is empty
  - summary and list when data exists
- [ ] Wire pull-to-refresh to `refetch`.
- [ ] Keep `onInstrumentPress` as a callback prop boundary. Temporary implementation can show:

```ts
Alert.alert(
  instrument.ticker,
  "Order ticket will be implemented in the Orders feature."
)
```

- [ ] Use `StatusBar` if needed for root screen polish.
- [ ] Do not import raw API functions.
- [ ] Do not import `useQuery` directly.
- [ ] Run:

```bash
bunx prettier --check src/features/markets/components/MarketsScreen.tsx
```

Expected: file passes formatting.

## Task 7: Verification

**Files:**

- No new files unless fixing issues found by checks.

- [ ] Run targeted formatting:

```bash
bunx prettier --check src/app/_layout.tsx src/app/index.tsx src/features/markets
```

Expected: touched code is formatted.

- [ ] Run lint on touched code:

```bash
bunx eslint src/app/_layout.tsx src/app/index.tsx src/features/markets
```

Expected: no lint errors from the Markets feature. If existing global config pulls unrelated files into lint, document exact unrelated failures.

- [ ] Run TypeScript if a script exists. If there is no `tsc` script, run:

```bash
bunx tsc --noEmit
```

Expected: either pass, or document existing unrelated failures.

- [ ] Start Expo in Expo Go mode first:

```bash
bun run start
```

Expected: Metro starts and the app loads.

- [ ] Manual QA:
  - The root screen title is `Markets`.
  - Instruments load from `/instruments`.
  - Rows show ticker, name, ARS price, and signed daily return.
  - Positive, negative, and flat values have distinct visual states.
  - Pull-to-refresh refetches.
  - Disabling network or forcing API error shows retry UI.
  - Tapping a row invokes the temporary instrument press behavior.

## Non-Goals

- Do not implement search UI.
- Do not implement portfolio.
- Do not implement orders or bottom-sheet order ticket.
- Do not add external query-key factory libraries.
- Do not refactor `home-example`.
- Do not fix unrelated scaffold import failures unless they block the Markets route from compiling.

## Self-Review Checklist

- [ ] `src/app/index.tsx` is route-only.
- [ ] `src/app/_layout.tsx` owns the `Stack`.
- [ ] Every Markets component file/export starts with `Markets`.
- [ ] Only `useMarketsInstrumentsQuery.ts` imports `useQuery`.
- [ ] Only `markets.api.ts` imports `api`.
- [ ] Query key is an explicit readonly array.
- [ ] API response is validated before returning feature data.
- [ ] Daily return uses `lastPrice` and `closePrice`.
- [ ] UI has loading, error, empty, success, and refresh states.
- [ ] Pressable rows have accessibility roles/labels.
