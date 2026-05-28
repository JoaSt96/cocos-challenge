# Portfolio Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Portfolio feature for the Cocos challenge: fetch `GET /portfolio`, validate and normalize positions, calculate market value/gain/return, render a summary card plus positions list, and expose the screen at `/portfolio`.

**Architecture:** `src/app/` remains routing-only. `src/features/portfolio/` owns the raw API call, TanStack Query option factory, UI-facing query hook, pure portfolio calculations, local formatters, types, and Portfolio-prefixed UI components. Presentational components receive plain props and never import API functions or TanStack Query hooks.

**Tech Stack:** Expo SDK 56, Expo Router Stack, React Native, TypeScript, TanStack Query v5, Axios, Zod, Uniwind, FlashList, Bun test.

---

## References Used

- Expo SDK 56 docs: `https://docs.expo.dev/versions/v56.0.0/`
- Expo Router docs: `https://docs.expo.dev/versions/v56.0.0/sdk/router/`
- Expo Router Stack docs: `https://docs.expo.dev/versions/v56.0.0/sdk/router/stack/`
- Local `ui-ux-pro-max` skill: fintech/trading UI should be dense, scannable, high-contrast, touch-friendly, and accessible.
- Existing Markets feature under `src/features/markets/` for feature structure, query factory shape, loading/error/empty state patterns, FlashList usage, and Uniwind class style.
- Live API sample from `https://dummy-api-topaz.vercel.app/portfolio`, which returns duplicate tickers as separate rows. This plan keeps each returned row as its own position and uses a generated `positionId` for list keys.

## User-Facing Result

The app has a `/portfolio` route showing:

- Stack title: `Portfolio`.
- Supporting copy: `Tenencias valorizadas en pesos`.
- Summary card with:
  - total market value
  - total gain
  - total return
  - invested cost basis as supporting context
- Positions list rows with:
  - ticker
  - quantity
  - market value: `quantity * last_price`
  - gain: `quantity * (last_price - avg_cost_price)`
  - return: `gain / costBasis`
- Pull-to-refresh.
- Loading skeletons.
- Empty state.
- Error state with retry.

## File Map

Create:

- `src/features/portfolio/types.ts`
  - API item type, normalized position type, direction type, and summary type.
- `src/features/portfolio/portfolioMath.ts`
  - Pure calculation helpers for cost basis, market value, gain, return, direction, and summary.
- `src/features/portfolio/portfolioMath.test.ts`
  - Unit coverage for the required formulas and summary aggregation.
- `src/features/portfolio/portfolioFormatters.ts`
  - Peso, percent, and quantity display helpers local to Portfolio.
- `src/features/portfolio/api/portfolio.api.ts`
  - Raw `GET /portfolio`, Zod validation, response normalization.
- `src/features/portfolio/queries/portfolioQueries.ts`
  - Query keys and `queryOptions` factory.
- `src/features/portfolio/hooks/usePortfolioPositionsQuery.ts`
  - The only Portfolio file that imports `useQuery`.
- `src/features/portfolio/components/PortfolioScreen.tsx`
  - Feature screen/container. Loads data and wires refresh/retry.
- `src/features/portfolio/components/PortfolioPositionList.tsx`
  - Presentational FlashList wrapper.
- `src/features/portfolio/components/PortfolioPositionRow.tsx`
  - Pressable/scannable position row.
- `src/features/portfolio/components/PortfolioSummaryCard.tsx`
  - Summary card.
- `src/features/portfolio/components/PortfolioReturnBadge.tsx`
  - Gain/return visual state.
- `src/features/portfolio/components/PortfolioLoadingState.tsx`
  - Skeleton rows and summary skeleton.
- `src/features/portfolio/components/PortfolioErrorState.tsx`
  - Retry UI.
- `src/features/portfolio/components/PortfolioEmptyState.tsx`
  - No-data UI.
- `src/app/portfolio.tsx`
  - Route file that renders only `<PortfolioScreen />`.

Modify:

- `src/app/_layout.tsx`
  - Add the `portfolio` Stack screen title.

Do not modify:

- `src/features/home-example/`
- `src/features/markets/`, unless a later navigation task explicitly links Markets to Portfolio.
- Global query defaults, unless implementation uncovers a real issue.

## Data Contract

Raw `/portfolio` item:

```ts
export type PortfolioPositionApiItem = {
  instrument_id: number
  ticker: string
  quantity: number
  last_price: number
  close_price: number
  avg_cost_price: number
}
```

Normalized item:

```ts
export type PortfolioPosition = {
  positionId: string
  instrumentId: number
  ticker: string
  quantity: number
  lastPrice: number
  closePrice: number
  avgCostPrice: number
  costBasis: number
  marketValue: number
  gain: number
  returnRatio: number
  direction: "up" | "down" | "flat"
}
```

Summary:

```ts
export type PortfolioSummary = {
  positions: number
  totalCostBasis: number
  totalMarketValue: number
  totalGain: number
  totalReturnRatio: number
}
```

Calculation rules:

```ts
costBasis = quantity * avgCostPrice
marketValue = quantity * lastPrice
gain = quantity * (lastPrice - avgCostPrice)
returnRatio = costBasis <= 0 ? 0 : gain / costBasis
```

For display, `returnRatio` is formatted as a percent. For example, `0.0612` displays as `+6.12%`.

## UX/UI Plan

Follow the current visual system already established by Markets:

- Background: `bg-background`.
- Cards/rows: `bg-card`, `border-border`, `rounded-lg`.
- Positive values: `text-profit`.
- Negative values: `text-loss`.
- Neutral values: `text-muted-foreground`.
- Touch targets: row height at least `76px`; buttons remain at least `44px`.
- Loading: skeleton summary card and stable-height rows.
- Accessibility: rows use `accessibilityRole="button"` and labels include ticker, quantity, market value, gain, and return.
- Data scanning: use right-aligned financial values and `fontVariant: ["tabular-nums"]` on number-heavy text where useful.

The summary card should be compact, not a marketing hero. The primary number is total market value. Gain and return are grouped together because they describe the same performance state.

## Task 1: Portfolio Types And Math

**Files:**

- Create: `src/features/portfolio/types.ts`
- Create: `src/features/portfolio/portfolioMath.ts`
- Create: `src/features/portfolio/portfolioMath.test.ts`

- [ ] **Step 1: Write the failing math test**

Create `src/features/portfolio/portfolioMath.test.ts`:

```ts
import {describe, expect, it} from "bun:test"

import {
  getPortfolioPositionMetrics,
  getPortfolioPositionDirection,
  getPortfolioSummary,
} from "./portfolioMath"
import type {PortfolioPosition} from "./types"

describe("portfolioMath", () => {
  it("calculates position market value, gain, and return ratio", () => {
    const metrics = getPortfolioPositionMetrics({
      avgCostPrice: 91.86,
      lastPrice: 97.56,
      quantity: 4,
    })

    expect(metrics.costBasis).toBeCloseTo(367.44)
    expect(metrics.marketValue).toBeCloseTo(390.24)
    expect(metrics.gain).toBeCloseTo(22.8)
    expect(metrics.returnRatio).toBeCloseTo(0.062051)
  })

  it("returns zero ratio when cost basis is not positive", () => {
    expect(
      getPortfolioPositionMetrics({
        avgCostPrice: 0,
        lastPrice: 10,
        quantity: 10,
      })
    ).toEqual({
      costBasis: 0,
      gain: 100,
      marketValue: 100,
      returnRatio: 0,
    })
  })

  it("classifies positive, negative, and flat position performance", () => {
    expect(getPortfolioPositionDirection(10)).toBe("up")
    expect(getPortfolioPositionDirection(-10)).toBe("down")
    expect(getPortfolioPositionDirection(0)).toBe("flat")
  })

  it("aggregates portfolio summary totals", () => {
    const positions: PortfolioPosition[] = [
      {
        avgCostPrice: 91.86,
        closePrice: 88.31,
        costBasis: 367.44,
        direction: "up",
        gain: 22.80000000000001,
        instrumentId: 11,
        lastPrice: 97.56,
        marketValue: 390.24,
        positionId: "11-0",
        quantity: 4,
        returnRatio: 0.062051,
        ticker: "GAMI",
      },
      {
        avgCostPrice: 49.62,
        closePrice: 28.57,
        costBasis: 4962,
        direction: "down",
        gain: -1767,
        instrumentId: 3,
        lastPrice: 31.95,
        marketValue: 3195,
        positionId: "3-1",
        quantity: 100,
        returnRatio: -0.35610640870616685,
        ticker: "PGR",
      },
    ]

    const summary = getPortfolioSummary(positions)

    expect(summary.positions).toBe(2)
    expect(summary.totalCostBasis).toBeCloseTo(5329.44)
    expect(summary.totalMarketValue).toBeCloseTo(3585.24)
    expect(summary.totalGain).toBeCloseTo(-1744.2)
    expect(summary.totalReturnRatio).toBeCloseTo(-0.327084)
  })
})
```

- [ ] **Step 2: Run the test and verify it fails**

Run:

```bash
bun test src/features/portfolio/portfolioMath.test.ts
```

Expected: FAIL because `src/features/portfolio/portfolioMath.ts` and `src/features/portfolio/types.ts` do not exist yet.

- [ ] **Step 3: Create the Portfolio types**

Create `src/features/portfolio/types.ts`:

```ts
export type PortfolioPositionDirection = "up" | "down" | "flat"

export type PortfolioPositionApiItem = {
  instrument_id: number
  ticker: string
  quantity: number
  last_price: number
  close_price: number
  avg_cost_price: number
}

export type PortfolioPosition = {
  positionId: string
  instrumentId: number
  ticker: string
  quantity: number
  lastPrice: number
  closePrice: number
  avgCostPrice: number
  costBasis: number
  marketValue: number
  gain: number
  returnRatio: number
  direction: PortfolioPositionDirection
}

export type PortfolioSummary = {
  positions: number
  totalCostBasis: number
  totalMarketValue: number
  totalGain: number
  totalReturnRatio: number
}
```

- [ ] **Step 4: Create the Portfolio math helpers**

Create `src/features/portfolio/portfolioMath.ts`:

```ts
import type {
  PortfolioPosition,
  PortfolioPositionDirection,
  PortfolioSummary,
} from "./types"

type PortfolioPositionMetricInput = {
  avgCostPrice: number
  lastPrice: number
  quantity: number
}

export const getPortfolioPositionMetrics = ({
  avgCostPrice,
  lastPrice,
  quantity,
}: PortfolioPositionMetricInput) => {
  const costBasis = quantity * avgCostPrice
  const marketValue = quantity * lastPrice
  const gain = quantity * (lastPrice - avgCostPrice)

  return {
    costBasis,
    gain,
    marketValue,
    returnRatio: costBasis <= 0 ? 0 : gain / costBasis,
  }
}

export const getPortfolioPositionDirection = (
  gain: number
): PortfolioPositionDirection => {
  if (gain > 0) {
    return "up"
  }

  if (gain < 0) {
    return "down"
  }

  return "flat"
}

export const getPortfolioSummary = (
  positions: PortfolioPosition[]
): PortfolioSummary => {
  const totals = positions.reduce(
    (summary, position) => {
      return {
        totalCostBasis: summary.totalCostBasis + position.costBasis,
        totalGain: summary.totalGain + position.gain,
        totalMarketValue: summary.totalMarketValue + position.marketValue,
      }
    },
    {
      totalCostBasis: 0,
      totalGain: 0,
      totalMarketValue: 0,
    }
  )

  return {
    positions: positions.length,
    ...totals,
    totalReturnRatio:
      totals.totalCostBasis <= 0 ? 0 : totals.totalGain / totals.totalCostBasis,
  }
}
```

- [ ] **Step 5: Run the math test**

Run:

```bash
bun test src/features/portfolio/portfolioMath.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/features/portfolio/types.ts src/features/portfolio/portfolioMath.ts src/features/portfolio/portfolioMath.test.ts
git commit -m "feat: add portfolio calculations"
```

## Task 2: Portfolio API, Query Factory, And Hook

**Files:**

- Create: `src/features/portfolio/api/portfolio.api.ts`
- Create: `src/features/portfolio/queries/portfolioQueries.ts`
- Create: `src/features/portfolio/hooks/usePortfolioPositionsQuery.ts`

- [ ] **Step 1: Create the Portfolio API module**

Create `src/features/portfolio/api/portfolio.api.ts`:

```ts
import {z} from "zod"

import {api} from "@/config/api.config"

import {
  getPortfolioPositionDirection,
  getPortfolioPositionMetrics,
} from "../portfolioMath"
import type {PortfolioPosition, PortfolioPositionApiItem} from "../types"

const portfolioPositionApiItemSchema = z.object({
  avg_cost_price: z.number(),
  close_price: z.number(),
  instrument_id: z.number(),
  last_price: z.number(),
  quantity: z.number(),
  ticker: z.string(),
})

const portfolioResponseSchema = z.array(portfolioPositionApiItemSchema)

const toPortfolioPosition = (
  item: PortfolioPositionApiItem,
  index: number
): PortfolioPosition => {
  const metrics = getPortfolioPositionMetrics({
    avgCostPrice: item.avg_cost_price,
    lastPrice: item.last_price,
    quantity: item.quantity,
  })

  return {
    avgCostPrice: item.avg_cost_price,
    closePrice: item.close_price,
    direction: getPortfolioPositionDirection(metrics.gain),
    instrumentId: item.instrument_id,
    lastPrice: item.last_price,
    positionId: `${item.instrument_id}-${index}`,
    quantity: item.quantity,
    ticker: item.ticker,
    ...metrics,
  }
}

export const getPortfolioPositions = async (): Promise<PortfolioPosition[]> => {
  const response = await api.get("/portfolio")
  const parsed = portfolioResponseSchema.safeParse(response.data)

  if (!parsed.success) {
    throw new Error("Invalid portfolio response")
  }

  return parsed.data.map(toPortfolioPosition)
}
```

- [ ] **Step 2: Create the query factory**

Create `src/features/portfolio/queries/portfolioQueries.ts`:

```ts
import {queryOptions} from "@tanstack/react-query"

import {getPortfolioPositions} from "../api/portfolio.api"

const PORTFOLIO_BASE_QUERY_KEY = "portfolio"

export const portfolioQueries = {
  all: [PORTFOLIO_BASE_QUERY_KEY] as const,
  positions: () =>
    queryOptions({
      gcTime: 5 * 60_000,
      queryFn: getPortfolioPositions,
      queryKey: [PORTFOLIO_BASE_QUERY_KEY, "positions"] as const,
      staleTime: 30_000,
    }),
} as const
```

- [ ] **Step 3: Create the UI-facing query hook**

Create `src/features/portfolio/hooks/usePortfolioPositionsQuery.ts`:

```ts
import {useQuery} from "@tanstack/react-query"

import {portfolioQueries} from "../queries/portfolioQueries"

export const usePortfolioPositionsQuery = () => {
  return useQuery(portfolioQueries.positions())
}
```

- [ ] **Step 4: Run type and lint checks**

Run:

```bash
bunx tsc --noEmit
bun run lint
```

Expected: both commands pass. If existing unrelated worktree issues fail these commands, record the exact failing files before changing anything outside `src/features/portfolio/`.

- [ ] **Step 5: Commit**

```bash
git add src/features/portfolio/api/portfolio.api.ts src/features/portfolio/queries/portfolioQueries.ts src/features/portfolio/hooks/usePortfolioPositionsQuery.ts
git commit -m "feat: add portfolio data query"
```

## Task 3: Portfolio Formatters And State Components

**Files:**

- Create: `src/features/portfolio/portfolioFormatters.ts`
- Create: `src/features/portfolio/components/PortfolioReturnBadge.tsx`
- Create: `src/features/portfolio/components/PortfolioSummaryCard.tsx`
- Create: `src/features/portfolio/components/PortfolioLoadingState.tsx`
- Create: `src/features/portfolio/components/PortfolioErrorState.tsx`
- Create: `src/features/portfolio/components/PortfolioEmptyState.tsx`

- [ ] **Step 1: Create local formatters**

Create `src/features/portfolio/portfolioFormatters.ts`:

```ts
const portfolioPesoFormatter = new Intl.NumberFormat("es-AR", {
  currency: "ARS",
  maximumFractionDigits: 2,
  style: "currency",
})

const portfolioQuantityFormatter = new Intl.NumberFormat("es-AR", {
  maximumFractionDigits: 0,
})

export const formatPortfolioPeso = (amount: number) =>
  portfolioPesoFormatter.format(amount)

export const formatPortfolioPercent = (ratio: number) =>
  `${ratio > 0 ? "+" : ""}${(ratio * 100).toFixed(2)}%`

export const formatPortfolioQuantity = (quantity: number) =>
  portfolioQuantityFormatter.format(quantity)
```

- [ ] **Step 2: Create the return badge**

Create `src/features/portfolio/components/PortfolioReturnBadge.tsx`:

```tsx
import {View} from "react-native"

import {Text} from "@/components/ui/text"
import {cn} from "@/lib/utils"

import {
  formatPortfolioPercent,
  formatPortfolioPeso,
} from "../portfolioFormatters"
import type {PortfolioPositionDirection} from "../types"

type PortfolioReturnBadgeProps = {
  direction: PortfolioPositionDirection
  gain: number
  returnRatio: number
}

export const PortfolioReturnBadge = ({
  direction,
  gain,
  returnRatio,
}: PortfolioReturnBadgeProps) => {
  const valueClassName =
    direction === "up"
      ? "text-profit"
      : direction === "down"
        ? "text-loss"
        : "text-muted-foreground"

  return (
    <View className="gap-xs items-end">
      <Text
        selectable
        className={cn("text-sm font-semibold", valueClassName)}
        style={{fontVariant: ["tabular-nums"]}}
      >
        {formatPortfolioPeso(gain)}
      </Text>
      <Text
        selectable
        className={cn("text-xs font-medium", valueClassName)}
        style={{fontVariant: ["tabular-nums"]}}
      >
        {formatPortfolioPercent(returnRatio)}
      </Text>
    </View>
  )
}
```

- [ ] **Step 3: Create the summary card**

Create `src/features/portfolio/components/PortfolioSummaryCard.tsx`:

```tsx
import {View} from "react-native"

import {Text} from "@/components/ui/text"
import {cn} from "@/lib/utils"

import {
  formatPortfolioPercent,
  formatPortfolioPeso,
} from "../portfolioFormatters"
import type {PortfolioSummary} from "../types"

type PortfolioSummaryCardProps = {
  summary: PortfolioSummary
}

export const PortfolioSummaryCard = ({summary}: PortfolioSummaryCardProps) => {
  const performanceClassName =
    summary.totalGain > 0
      ? "text-profit"
      : summary.totalGain < 0
        ? "text-loss"
        : "text-muted-foreground"

  return (
    <View className="mx-street border-border bg-card p-lg rounded-lg border">
      <View className="gap-xs">
        <Text className="text-muted-foreground text-xs font-medium">
          Valor total
        </Text>
        <Text
          selectable
          className="text-foreground text-3xl font-bold"
          style={{fontVariant: ["tabular-nums"]}}
        >
          {formatPortfolioPeso(summary.totalMarketValue)}
        </Text>
      </View>

      <View className="mt-lg gap-sm flex-row">
        <View className="border-border pr-md flex-1 border-r">
          <Text className="text-muted-foreground text-xs font-medium">
            Ganancia
          </Text>
          <Text
            selectable
            className={cn("mt-xs text-lg font-semibold", performanceClassName)}
            style={{fontVariant: ["tabular-nums"]}}
          >
            {formatPortfolioPeso(summary.totalGain)}
          </Text>
        </View>

        <View className="border-border px-md flex-1 border-r">
          <Text className="text-muted-foreground text-xs font-medium">
            Retorno
          </Text>
          <Text
            selectable
            className={cn("mt-xs text-lg font-semibold", performanceClassName)}
            style={{fontVariant: ["tabular-nums"]}}
          >
            {formatPortfolioPercent(summary.totalReturnRatio)}
          </Text>
        </View>

        <View className="pl-md flex-1">
          <Text className="text-muted-foreground text-xs font-medium">
            Posiciones
          </Text>
          <Text
            selectable
            className="text-foreground mt-xs text-lg font-semibold"
          >
            {summary.positions}
          </Text>
        </View>
      </View>

      <Text
        selectable
        className="text-muted-foreground mt-md text-xs leading-4"
        style={{fontVariant: ["tabular-nums"]}}
      >
        Costo invertido: {formatPortfolioPeso(summary.totalCostBasis)}
      </Text>
    </View>
  )
}
```

- [ ] **Step 4: Create loading, error, and empty states**

Create `src/features/portfolio/components/PortfolioLoadingState.tsx`:

```tsx
import {View} from "react-native"

import {Container} from "@/components/Container"
import {Skeleton} from "@/components/ui/skeleton"

const PORTFOLIO_LOADING_ROWS = ["row-1", "row-2", "row-3", "row-4", "row-5"]

export const PortfolioLoadingState = () => {
  return (
    <Container expanded className="gap-md pt-md">
      <Skeleton className="h-40 rounded-lg" />
      <View className="border-border bg-card overflow-hidden rounded-lg border">
        {PORTFOLIO_LOADING_ROWS.map(row => (
          <View
            className="border-border px-md py-md min-h-[76px] flex-row items-center justify-between border-b"
            key={row}
          >
            <View className="gap-sm flex-1">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-28" />
            </View>
            <View className="gap-sm items-end">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </View>
          </View>
        ))}
      </View>
    </Container>
  )
}
```

Create `src/features/portfolio/components/PortfolioErrorState.tsx`:

```tsx
import {View} from "react-native"

import {AlertCircle} from "lucide-react-native"

import {Button} from "@/components/ui/button"
import {Icon} from "@/components/ui/icon"
import {Text} from "@/components/ui/text"

type PortfolioErrorStateProps = {
  message: string
  onRetry: () => void
}

export const PortfolioErrorState = ({
  message,
  onRetry,
}: PortfolioErrorStateProps) => {
  return (
    <View className="mx-street mt-md border-destructive/30 bg-card p-lg overflow-hidden rounded-lg border">
      <Icon as={AlertCircle} className="mb-sm text-destructive size-5" />
      <Text selectable className="text-foreground text-lg font-semibold">
        No pudimos cargar el portfolio
      </Text>
      <Text
        selectable
        className="text-muted-foreground mt-sm text-sm leading-5"
      >
        {message}
      </Text>
      <Button className="mt-md self-start" onPress={onRetry}>
        <Text>Reintentar</Text>
      </Button>
    </View>
  )
}
```

Create `src/features/portfolio/components/PortfolioEmptyState.tsx`:

```tsx
import {View} from "react-native"

import {Text} from "@/components/ui/text"

export const PortfolioEmptyState = () => {
  return (
    <View className="mx-street mt-md border-border bg-card p-lg rounded-lg border">
      <Text selectable className="text-foreground text-lg font-semibold">
        No hay posiciones en el portfolio
      </Text>
      <Text
        selectable
        className="text-muted-foreground mt-sm text-sm leading-5"
      >
        Cuando la API devuelva tenencias, van a aparecer en esta lista.
      </Text>
    </View>
  )
}
```

- [ ] **Step 5: Run formatting and lint checks**

Run:

```bash
bun run format
bun run lint
```

Expected: both commands pass, or only pre-existing unrelated files fail.

- [ ] **Step 6: Commit**

```bash
git add src/features/portfolio/portfolioFormatters.ts src/features/portfolio/components/PortfolioReturnBadge.tsx src/features/portfolio/components/PortfolioSummaryCard.tsx src/features/portfolio/components/PortfolioLoadingState.tsx src/features/portfolio/components/PortfolioErrorState.tsx src/features/portfolio/components/PortfolioEmptyState.tsx
git commit -m "feat: add portfolio state components"
```

## Task 4: Portfolio List, Screen, And Route

**Files:**

- Create: `src/features/portfolio/components/PortfolioPositionRow.tsx`
- Create: `src/features/portfolio/components/PortfolioPositionList.tsx`
- Create: `src/features/portfolio/components/PortfolioScreen.tsx`
- Create: `src/app/portfolio.tsx`
- Modify: `src/app/_layout.tsx`

- [ ] **Step 1: Create the position row**

Create `src/features/portfolio/components/PortfolioPositionRow.tsx`:

```tsx
import {Pressable, View} from "react-native"

import {Text} from "@/components/ui/text"

import {PortfolioReturnBadge} from "./PortfolioReturnBadge"

import {
  formatPortfolioPeso,
  formatPortfolioQuantity,
} from "../portfolioFormatters"
import type {PortfolioPosition} from "../types"

type PortfolioPositionRowProps = {
  position: PortfolioPosition
  onPress: (position: PortfolioPosition) => void
}

export const PortfolioPositionRow = ({
  position,
  onPress,
}: PortfolioPositionRowProps) => {
  const marketValue = formatPortfolioPeso(position.marketValue)
  const gain = formatPortfolioPeso(position.gain)
  const quantity = formatPortfolioQuantity(position.quantity)
  const accessibilityLabel = `${position.ticker}, cantidad ${quantity}, valor de mercado ${marketValue}, ganancia ${gain}`

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      className="border-border bg-card gap-md px-street py-md min-h-[76px] flex-row items-center justify-between border-b active:opacity-70"
      onPress={() => onPress(position)}
    >
      <View className="gap-xs min-w-0 flex-1">
        <Text selectable className="text-foreground text-base font-semibold">
          {position.ticker}
        </Text>
        <Text
          selectable
          className="text-muted-foreground text-sm leading-5"
          numberOfLines={1}
        >
          {quantity} acciones
        </Text>
      </View>

      <View className="gap-xs items-end">
        <Text
          selectable
          className="text-foreground text-base font-semibold"
          style={{fontVariant: ["tabular-nums"]}}
        >
          {marketValue}
        </Text>
        <PortfolioReturnBadge
          direction={position.direction}
          gain={position.gain}
          returnRatio={position.returnRatio}
        />
      </View>
    </Pressable>
  )
}
```

- [ ] **Step 2: Create the position list**

Create `src/features/portfolio/components/PortfolioPositionList.tsx`:

```tsx
import {View} from "react-native"

import {FlashList} from "@shopify/flash-list"

import {Text} from "@/components/ui/text"

import {PortfolioEmptyState} from "./PortfolioEmptyState"
import {PortfolioPositionRow} from "./PortfolioPositionRow"
import {PortfolioSummaryCard} from "./PortfolioSummaryCard"

import type {PortfolioPosition, PortfolioSummary} from "../types"

type PortfolioPositionListProps = {
  onPositionPress: (position: PortfolioPosition) => void
  onRefresh: () => void
  positions: PortfolioPosition[]
  refreshing: boolean
  summary: PortfolioSummary
}

const PortfolioPositionListSeparator = () => {
  return <View className="bg-border h-px" />
}

const PortfolioPositionListHeader = ({
  summary,
}: Pick<PortfolioPositionListProps, "summary">) => {
  return (
    <View className="gap-lg pt-md">
      <View className="gap-xs px-street">
        <Text selectable className="text-muted-foreground text-base">
          Tenencias valorizadas en pesos
        </Text>
      </View>
      <PortfolioSummaryCard summary={summary} />
    </View>
  )
}

export const PortfolioPositionList = ({
  onPositionPress,
  onRefresh,
  positions,
  refreshing,
  summary,
}: PortfolioPositionListProps) => {
  return (
    <FlashList
      contentInsetAdjustmentBehavior="automatic"
      contentContainerClassName="pb-safe"
      data={positions}
      ItemSeparatorComponent={PortfolioPositionListSeparator}
      keyExtractor={position => position.positionId}
      ListEmptyComponent={<PortfolioEmptyState />}
      ListHeaderComponent={<PortfolioPositionListHeader summary={summary} />}
      onRefresh={onRefresh}
      refreshing={refreshing}
      renderItem={({item}) => (
        <PortfolioPositionRow onPress={onPositionPress} position={item} />
      )}
      showsVerticalScrollIndicator={false}
    />
  )
}
```

- [ ] **Step 3: Create the Portfolio screen container**

Create `src/features/portfolio/components/PortfolioScreen.tsx`:

```tsx
import {Alert as NativeAlert} from "react-native"

import {StatusBar} from "expo-status-bar"

import {Container} from "@/components/Container"

import {PortfolioErrorState} from "./PortfolioErrorState"
import {PortfolioLoadingState} from "./PortfolioLoadingState"
import {PortfolioPositionList} from "./PortfolioPositionList"

import {usePortfolioPositionsQuery} from "../hooks/usePortfolioPositionsQuery"
import {getPortfolioSummary} from "../portfolioMath"
import type {PortfolioPosition} from "../types"

const getPortfolioErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message
  }

  return "Intenta nuevamente en unos segundos."
}

export const PortfolioScreen = () => {
  const positionsQuery = usePortfolioPositionsQuery()
  const summary = getPortfolioSummary(positionsQuery.data ?? [])

  const handlePositionPress = (position: PortfolioPosition) => {
    NativeAlert.alert(
      position.ticker,
      "El detalle de posicion se puede ampliar en una feature futura."
    )
  }

  const handleRefresh = () => {
    void positionsQuery.refetch()
  }

  if (positionsQuery.isPending) {
    return (
      <>
        <StatusBar style="auto" />
        <PortfolioLoadingState />
      </>
    )
  }

  if (positionsQuery.isError) {
    return (
      <PortfolioErrorState
        message={getPortfolioErrorMessage(positionsQuery.error)}
        onRetry={handleRefresh}
      />
    )
  }

  return (
    <Container expanded>
      <StatusBar style="auto" />

      <PortfolioPositionList
        onPositionPress={handlePositionPress}
        onRefresh={handleRefresh}
        positions={positionsQuery.data}
        refreshing={positionsQuery.isRefetching}
        summary={summary}
      />
    </Container>
  )
}
```

- [ ] **Step 4: Add the route file**

Create `src/app/portfolio.tsx`:

```tsx
import {PortfolioScreen} from "@/features/portfolio/components/PortfolioScreen"

export default function PortfolioRoute() {
  return <PortfolioScreen />
}
```

- [ ] **Step 5: Register the Stack screen**

Modify `src/app/_layout.tsx` inside the existing `<Stack>`:

```tsx
<Stack.Screen name="index" options={{title: "Markets"}} />
<Stack.Screen name="portfolio" options={{title: "Portfolio"}} />
```

Do not import from `@react-navigation/*`; Expo SDK 56 routes navigation through `expo-router` entry points.

- [ ] **Step 6: Run full verification**

Run:

```bash
bun test src/features/portfolio/portfolioMath.test.ts
bun run format
bun run format:check
bunx tsc --noEmit
bun run lint
```

Expected:

- Portfolio math test passes.
- Formatting passes after `bun run format`.
- TypeScript and lint pass, unless the active worktree already has unrelated failures. If unrelated failures exist, capture them in the final handoff and do not fix them under this Portfolio task.

- [ ] **Step 7: Manually verify the screen**

Start the app:

```bash
EXPO_PUBLIC_API_URL=https://dummy-api-topaz.vercel.app bun start
```

Open `/portfolio` in Expo web or the simulator. Verify:

- The summary card displays total market value, gain, return, and cost basis.
- The list shows one row per API item, including duplicate tickers as separate rows.
- Market value equals `quantity * last_price`.
- Gain equals `quantity * (last_price - avg_cost_price)`.
- Return equals `gain / costBasis`, displayed as a percent.
- Pull-to-refresh runs without layout jumps.
- Error retry works by temporarily setting an invalid API URL and pressing `Reintentar`.

- [ ] **Step 8: Commit**

```bash
git add src/features/portfolio/components/PortfolioPositionRow.tsx src/features/portfolio/components/PortfolioPositionList.tsx src/features/portfolio/components/PortfolioScreen.tsx src/app/portfolio.tsx src/app/_layout.tsx
git commit -m "feat: add portfolio screen"
```

## Self-Review

- Spec coverage: The plan covers `GET /portfolio`, positions list, `quantity * last_price`, `quantity * (last_price - avg_cost_price)`, `gain / costBasis`, and the summary card.
- Architecture: Route files stay thin; Portfolio owns its feature-local API, queries, hooks, math, formatters, types, and UI.
- Data risk: The live API returns duplicate tickers. The plan uses `positionId = instrument_id-index` and does not aggregate rows.
- UI risk: The plan keeps the finance UI compact and scannable, uses stable loading dimensions, explicit accessible labels, and does not rely on color alone for performance because gain and percent text are always shown.
- Verification: The plan includes a Bun unit test for the required calculations, full formatting, type/lint checks, and manual Expo route verification.
