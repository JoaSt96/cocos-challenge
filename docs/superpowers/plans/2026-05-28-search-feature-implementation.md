# Search Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Search feature for the Cocos challenge: debounce ticker input, fetch `GET /search?query=DYC`, validate and normalize results, render ticker-first result rows, cover empty/loading/error states, and keep result presses as an Orders-modal placeholder.

**Architecture:** `src/app/search.tsx` stays routing-only and renders a `SearchScreen`. `src/features/search/` owns raw API access, TanStack Query options, the UI-facing query hook, query text normalization, local formatters, types, and Search-prefixed components. The screen container owns input/debounce/query wiring; presentational components receive plain props and never import API functions or TanStack Query hooks.

**Tech Stack:** Expo SDK 56, Expo Router Stack, React Native, TypeScript, TanStack Query v5, Axios, Zod, Uniwind, FlashList, Bun test, Argent native UI verification.

---

## References Used

- Expo SDK 56 docs: `https://docs.expo.dev/versions/v56.0.0/`
- Expo Router SDK 56 docs: `https://docs.expo.dev/versions/v56.0.0/sdk/router/`
- Local `AGENTS.md`: feature architecture, TanStack Query boundaries, Uniwind styling, formatter, and Argent verification rules.
- Existing Markets feature under `src/features/markets/` for API validation, query factory shape, loading/error/empty states, FlashList rows, and placeholder row press behavior.
- Existing Portfolio feature under `src/features/portfolio/` for the latest feature folder pattern and `/portfolio` route registration.
- Live API sample: `GET https://dummy-api-topaz.vercel.app/search?query=DYC` returns:

```json
[
  {
    "id": 1,
    "ticker": "DYCA",
    "name": "Dycasa S.A.",
    "type": "ACCIONES",
    "last_price": 45.72,
    "close_price": 50.07
  }
]
```

## User-Facing Result

The app has a `/search` route showing:

- Stack title: `Search`.
- Search input with placeholder `Buscar ticker`.
- Debounced search: user input updates immediately, API query runs after 350 ms of inactivity.
- No API call for blank or whitespace-only input.
- Results list sorted by ticker so scanning is stable.
- Result rows show ticker, name, asset type, and latest price in pesos.
- Idle state before typing.
- Loading skeleton while the debounced query fetches.
- Empty state when a non-empty query has no results.
- Error state with retry.
- Pressing a result shows a native alert placeholder for the future Orders modal.

## File Map

Create:

- `src/features/search/types.ts`
  - API item type, normalized result type, and query state type.
- `src/features/search/searchText.ts`
  - Input/query normalization and result sorting helpers.
- `src/features/search/searchText.test.ts`
  - Unit coverage for query normalization and ticker sorting.
- `src/features/search/searchFormatters.ts`
  - Peso display helper local to Search.
- `src/features/search/api/search.api.ts`
  - Raw `GET /search`, Zod validation, response normalization.
- `src/features/search/queries/searchQueries.ts`
  - Query keys and `queryOptions` factory.
- `src/features/search/hooks/useSearchResultsQuery.ts`
  - The only Search file that imports `useQuery`.
- `src/features/search/components/SearchScreen.tsx`
  - Feature screen/container. Owns input state, debounce, query hook, refresh/retry, and result press placeholder.
- `src/features/search/components/SearchResultsView.tsx`
  - Presentational layout for input, states, and result list.
- `src/features/search/components/SearchInputField.tsx`
  - Search-prefixed proxy around shared `Input`.
- `src/features/search/components/SearchResultList.tsx`
  - Presentational FlashList wrapper.
- `src/features/search/components/SearchResultRow.tsx`
  - Pressable ticker-first result row.
- `src/features/search/components/SearchLoadingState.tsx`
  - Stable-height skeleton rows.
- `src/features/search/components/SearchErrorState.tsx`
  - Retry UI.
- `src/features/search/components/SearchEmptyState.tsx`
  - Idle and no-results UI.
- `src/app/search.tsx`
  - Route file that renders only `<SearchScreen />`.

Modify:

- `src/app/_layout.tsx`
  - Add the `search` Stack screen title.

Do not modify:

- `src/features/home-example/`
- `src/features/markets/`
- `src/features/portfolio/`
- Global query defaults, unless implementation uncovers a real blocker.

## Data Contract

Raw `/search` item:

```ts
export type SearchResultApiItem = {
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
export type SearchResult = {
  id: number
  ticker: string
  name: string
  type: string
  lastPrice: number
  closePrice: number
}
```

Query state:

```ts
export type SearchQueryState =
  | "idle"
  | "loading"
  | "error"
  | "empty"
  | "results"
```

Normalization rules:

```ts
normalizeSearchQuery(" dyc ") === "DYC"
normalizeSearchQuery("   ") === ""
```

## UX/UI Plan

Follow the current Markets/Portfolio visual language:

- Background: `bg-background`.
- Result rows: `bg-card`, `border-border`, ticker-first, minimum height `72px`.
- Input: shared `Input` wrapped by `SearchInputField`.
- Loading: stable skeleton rows below the still-visible input.
- Empty states: compact, no marketing hero.
- Accessibility: input has `accessibilityLabel="Buscar ticker"`; rows use `accessibilityRole="button"` and labels include ticker, name, type, and latest price.
- Native keyboard: use `autoCapitalize="characters"`, `autoCorrect={false}`, `returnKeyType="search"`.
- No dynamic Tailwind class construction.

## Task 1: Search Text Helpers

**Files:**

- Create: `src/features/search/types.ts`
- Create: `src/features/search/searchText.ts`
- Create: `src/features/search/searchText.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/features/search/searchText.test.ts`:

```ts
import {describe, expect, it} from "bun:test"

import {normalizeSearchQuery, sortSearchResultsByTicker} from "./searchText"
import type {SearchResult} from "./types"

describe("searchText", () => {
  it("trims and uppercases ticker query text", () => {
    expect(normalizeSearchQuery(" dyc ")).toBe("DYC")
    expect(normalizeSearchQuery("bbar")).toBe("BBAR")
  })

  it("normalizes whitespace-only input to an empty query", () => {
    expect(normalizeSearchQuery("   ")).toBe("")
  })

  it("sorts results by ticker", () => {
    const results: SearchResult[] = [
      {
        closePrice: 71.67,
        id: 22,
        lastPrice: 79.36,
        name: "Banco Frances",
        ticker: "BBAR",
        type: "ACCIONES",
      },
      {
        closePrice: 50.07,
        id: 1,
        lastPrice: 45.72,
        name: "Dycasa S.A.",
        ticker: "DYCA",
        type: "ACCIONES",
      },
      {
        closePrice: 24.44,
        id: 16,
        lastPrice: 27.12,
        name: "Garovaglio Y Zorraquin",
        ticker: "GARO",
        type: "ACCIONES",
      },
    ]

    expect(
      sortSearchResultsByTicker(results).map(result => result.ticker)
    ).toEqual(["BBAR", "DYCA", "GARO"])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
bun test src/features/search/searchText.test.ts
```

Expected: FAIL because `src/features/search/searchText.ts` and `src/features/search/types.ts` do not exist yet.

- [ ] **Step 3: Add types**

Create `src/features/search/types.ts`:

```ts
export type SearchResultApiItem = {
  close_price: number
  id: number
  last_price: number
  name: string
  ticker: string
  type: string
}

export type SearchResult = {
  closePrice: number
  id: number
  lastPrice: number
  name: string
  ticker: string
  type: string
}

export type SearchQueryState =
  | "idle"
  | "loading"
  | "error"
  | "empty"
  | "results"
```

- [ ] **Step 4: Add helper implementation**

Create `src/features/search/searchText.ts`:

```ts
import type {SearchResult} from "./types"

export const normalizeSearchQuery = (query: string) =>
  query.trim().toUpperCase()

export const sortSearchResultsByTicker = (results: SearchResult[]) => {
  return [...results].sort((left, right) =>
    left.ticker.localeCompare(right.ticker, "es-AR")
  )
}
```

- [ ] **Step 5: Run test to verify it passes**

Run:

```bash
bun test src/features/search/searchText.test.ts
```

Expected: PASS.

- [ ] **Step 6: Format touched files**

Run:

```bash
node scripts/format-after-edit.mjs <<'JSON'
{"file_path":"src/features/search/searchText.test.ts","target_file":"src/features/search/searchText.ts","path":"src/features/search/types.ts"}
JSON
```

Expected: Prettier rewrites only the three Search files if needed.

- [ ] **Step 7: Commit**

```bash
git add src/features/search/types.ts src/features/search/searchText.ts src/features/search/searchText.test.ts
git commit -m "feat: add search text helpers"
```

## Task 2: Search API, Query Factory, And Hook

**Files:**

- Create: `src/features/search/api/search.api.ts`
- Create: `src/features/search/queries/searchQueries.ts`
- Create: `src/features/search/hooks/useSearchResultsQuery.ts`

- [ ] **Step 1: Add API validation and normalization**

Create `src/features/search/api/search.api.ts`:

```ts
import {z} from "zod"

import {api} from "@/config/api.config"

import {sortSearchResultsByTicker} from "../searchText"
import type {SearchResult, SearchResultApiItem} from "../types"

const searchResultApiItemSchema = z.object({
  close_price: z.number(),
  id: z.number(),
  last_price: z.number(),
  name: z.string(),
  ticker: z.string(),
  type: z.string(),
})

const searchResultsResponseSchema = z.array(searchResultApiItemSchema)

const toSearchResult = (item: SearchResultApiItem): SearchResult => {
  return {
    closePrice: item.close_price,
    id: item.id,
    lastPrice: item.last_price,
    name: item.name,
    ticker: item.ticker,
    type: item.type,
  }
}

export const getSearchResults = async (
  query: string
): Promise<SearchResult[]> => {
  const response = await api.get("/search", {
    params: {
      query,
    },
  })
  const parsed = searchResultsResponseSchema.safeParse(response.data)

  if (!parsed.success) {
    throw new Error("Invalid search response")
  }

  return sortSearchResultsByTicker(parsed.data.map(toSearchResult))
}
```

- [ ] **Step 2: Add query options factory**

Create `src/features/search/queries/searchQueries.ts`:

```ts
import {queryOptions} from "@tanstack/react-query"

import {getSearchResults} from "../api/search.api"
import {normalizeSearchQuery} from "../searchText"

const SEARCH_BASE_QUERY_KEY = "search"

export const searchQueries = {
  all: [SEARCH_BASE_QUERY_KEY] as const,
  results: (query: string) => {
    const normalizedQuery = normalizeSearchQuery(query)

    return queryOptions({
      enabled: normalizedQuery.length > 0,
      gcTime: 5 * 60_000,
      queryFn: () => getSearchResults(normalizedQuery),
      queryKey: [SEARCH_BASE_QUERY_KEY, "results", normalizedQuery] as const,
      staleTime: 30_000,
    })
  },
} as const
```

- [ ] **Step 3: Add UI-facing query hook**

Create `src/features/search/hooks/useSearchResultsQuery.ts`:

```ts
import {useQuery} from "@tanstack/react-query"

import {searchQueries} from "../queries/searchQueries"

export const useSearchResultsQuery = (query: string) => {
  return useQuery(searchQueries.results(query))
}
```

- [ ] **Step 4: Verify API sample manually**

Run:

```bash
curl -sS 'https://dummy-api-topaz.vercel.app/search?query=DYC'
```

Expected: response contains `DYCA`.

- [ ] **Step 5: Run focused tests and lint the data layer**

Run:

```bash
bun test src/features/search/searchText.test.ts
bunx prettier --check src/features/search/api/search.api.ts src/features/search/queries/searchQueries.ts src/features/search/hooks/useSearchResultsQuery.ts
```

Expected: both commands pass.

- [ ] **Step 6: Commit**

```bash
git add src/features/search/api/search.api.ts src/features/search/queries/searchQueries.ts src/features/search/hooks/useSearchResultsQuery.ts
git commit -m "feat: add search data query"
```

## Task 3: Search State Components

**Files:**

- Create: `src/features/search/searchFormatters.ts`
- Create: `src/features/search/components/SearchInputField.tsx`
- Create: `src/features/search/components/SearchLoadingState.tsx`
- Create: `src/features/search/components/SearchErrorState.tsx`
- Create: `src/features/search/components/SearchEmptyState.tsx`

- [ ] **Step 1: Add formatters**

Create `src/features/search/searchFormatters.ts`:

```ts
const searchPesoFormatter = new Intl.NumberFormat("es-AR", {
  currency: "ARS",
  maximumFractionDigits: 2,
  style: "currency",
})

export const formatSearchPeso = (amount: number) =>
  searchPesoFormatter.format(amount)
```

- [ ] **Step 2: Add input proxy**

Create `src/features/search/components/SearchInputField.tsx`:

```tsx
import {Input} from "@/components/ui/input"

type SearchInputFieldProps = {
  onChangeText: (value: string) => void
  value: string
}

export const SearchInputField = ({
  onChangeText,
  value,
}: SearchInputFieldProps) => {
  return (
    <Input
      accessibilityLabel="Buscar ticker"
      autoCapitalize="characters"
      autoCorrect={false}
      className="h-12 rounded-lg text-base"
      onChangeText={onChangeText}
      placeholder="Buscar ticker"
      returnKeyType="search"
      value={value}
    />
  )
}
```

- [ ] **Step 3: Add loading state**

Create `src/features/search/components/SearchLoadingState.tsx`:

```tsx
import {View} from "react-native"

import {Skeleton} from "@/components/ui/skeleton"

const SEARCH_LOADING_ROWS = ["row-1", "row-2", "row-3", "row-4"]

export const SearchLoadingState = () => {
  return (
    <View className="border-border bg-card overflow-hidden rounded-lg border">
      {SEARCH_LOADING_ROWS.map(row => (
        <View
          className="border-border px-md py-md min-h-[72px] flex-row items-center justify-between border-b"
          key={row}
        >
          <View className="gap-sm min-w-0 flex-1">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-44" />
          </View>
          <Skeleton className="h-4 w-20" />
        </View>
      ))}
    </View>
  )
}
```

- [ ] **Step 4: Add error state**

Create `src/features/search/components/SearchErrorState.tsx`:

```tsx
import {View} from "react-native"

import {AlertCircle} from "lucide-react-native"

import {Button} from "@/components/ui/button"
import {Icon} from "@/components/ui/icon"
import {Text} from "@/components/ui/text"

type SearchErrorStateProps = {
  message: string
  onRetry: () => void
}

export const SearchErrorState = ({message, onRetry}: SearchErrorStateProps) => {
  return (
    <View className="border-destructive/30 bg-card p-lg overflow-hidden rounded-lg border">
      <Icon as={AlertCircle} className="mb-sm text-destructive size-5" />
      <Text selectable className="text-foreground text-lg font-semibold">
        No pudimos buscar activos
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

- [ ] **Step 5: Add idle and no-results state**

Create `src/features/search/components/SearchEmptyState.tsx`:

```tsx
import {View} from "react-native"

import {Search} from "lucide-react-native"

import {Icon} from "@/components/ui/icon"
import {Text} from "@/components/ui/text"

type SearchEmptyStateProps = {
  query: string
  state: "idle" | "empty"
}

export const SearchEmptyState = ({query, state}: SearchEmptyStateProps) => {
  const title =
    state === "idle" ? "Busca por ticker" : `Sin resultados para ${query}`
  const description =
    state === "idle"
      ? "Escribe el simbolo del activo para buscarlo."
      : "Prueba con otro ticker del mercado."

  return (
    <View className="border-border bg-card p-lg rounded-lg border">
      <Icon as={Search} className="text-muted-foreground mb-sm size-5" />
      <Text selectable className="text-foreground text-lg font-semibold">
        {title}
      </Text>
      <Text
        selectable
        className="text-muted-foreground mt-sm text-sm leading-5"
      >
        {description}
      </Text>
    </View>
  )
}
```

- [ ] **Step 6: Format and check**

Run:

```bash
node scripts/format-after-edit.mjs <<'JSON'
{"file_path":"src/features/search/searchFormatters.ts","target_file":"src/features/search/components/SearchInputField.tsx","path":"src/features/search/components/SearchLoadingState.tsx","files":[{"file_path":"src/features/search/components/SearchErrorState.tsx"},{"file_path":"src/features/search/components/SearchEmptyState.tsx"}]}
JSON
bunx prettier --check src/features/search/searchFormatters.ts src/features/search/components/SearchInputField.tsx src/features/search/components/SearchLoadingState.tsx src/features/search/components/SearchErrorState.tsx src/features/search/components/SearchEmptyState.tsx
```

Expected: formatting check passes.

- [ ] **Step 7: Commit**

```bash
git add src/features/search/searchFormatters.ts src/features/search/components/SearchInputField.tsx src/features/search/components/SearchLoadingState.tsx src/features/search/components/SearchErrorState.tsx src/features/search/components/SearchEmptyState.tsx
git commit -m "feat: add search state components"
```

## Task 4: Result List And Screen Container

**Files:**

- Create: `src/features/search/components/SearchResultRow.tsx`
- Create: `src/features/search/components/SearchResultList.tsx`
- Create: `src/features/search/components/SearchResultsView.tsx`
- Create: `src/features/search/components/SearchScreen.tsx`

- [ ] **Step 1: Add result row**

Create `src/features/search/components/SearchResultRow.tsx`:

```tsx
import {Pressable, View} from "react-native"

import {Text} from "@/components/ui/text"

import {formatSearchPeso} from "../searchFormatters"
import type {SearchResult} from "../types"

type SearchResultRowProps = {
  onPress: (result: SearchResult) => void
  result: SearchResult
}

export const SearchResultRow = ({onPress, result}: SearchResultRowProps) => {
  const price = formatSearchPeso(result.lastPrice)
  const accessibilityLabel = `${result.ticker}, ${result.name}, ${result.type}, ultimo precio ${price}`

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      className="border-border bg-card gap-md px-street py-md min-h-[72px] flex-row items-center justify-between border-b active:opacity-70"
      onPress={() => onPress(result)}
    >
      <View className="gap-xs min-w-0 flex-1">
        <Text selectable className="text-foreground text-base font-semibold">
          {result.ticker}
        </Text>
        <Text
          selectable
          className="text-muted-foreground text-sm leading-5"
          numberOfLines={1}
        >
          {result.name}
        </Text>
      </View>

      <View className="gap-xs items-end">
        <Text selectable className="text-foreground text-base font-semibold">
          {price}
        </Text>
        <Text selectable className="text-muted-foreground text-xs uppercase">
          {result.type}
        </Text>
      </View>
    </Pressable>
  )
}
```

- [ ] **Step 2: Add FlashList wrapper**

Create `src/features/search/components/SearchResultList.tsx`:

```tsx
import {View} from "react-native"

import {FlashList} from "@shopify/flash-list"

import {SearchResultRow} from "./SearchResultRow"

import type {SearchResult} from "../types"

type SearchResultListProps = {
  onRefresh: () => void
  onResultPress: (result: SearchResult) => void
  refreshing: boolean
  results: SearchResult[]
}

const SearchResultListSeparator = () => {
  return <View className="bg-border h-px" />
}

export const SearchResultList = ({
  onRefresh,
  onResultPress,
  refreshing,
  results,
}: SearchResultListProps) => {
  return (
    <View className="border-border bg-card flex-1 overflow-hidden rounded-lg border">
      <FlashList
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="pb-safe"
        data={results}
        ItemSeparatorComponent={SearchResultListSeparator}
        keyExtractor={result => `${result.id}`}
        onRefresh={onRefresh}
        refreshing={refreshing}
        renderItem={({item}) => (
          <SearchResultRow onPress={onResultPress} result={item} />
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  )
}
```

- [ ] **Step 3: Add presentational results view**

Create `src/features/search/components/SearchResultsView.tsx`:

```tsx
import {View} from "react-native"

import {Container} from "@/components/Container"
import {Text} from "@/components/ui/text"

import {SearchEmptyState} from "./SearchEmptyState"
import {SearchErrorState} from "./SearchErrorState"
import {SearchInputField} from "./SearchInputField"
import {SearchLoadingState} from "./SearchLoadingState"
import {SearchResultList} from "./SearchResultList"

import type {SearchQueryState, SearchResult} from "../types"

type SearchResultsViewProps = {
  debouncedQuery: string
  errorMessage: string | null
  onQueryChange: (value: string) => void
  onRefresh: () => void
  onResultPress: (result: SearchResult) => void
  query: string
  refreshing: boolean
  results: SearchResult[]
  state: SearchQueryState
}

export const SearchResultsView = ({
  debouncedQuery,
  errorMessage,
  onQueryChange,
  onRefresh,
  onResultPress,
  query,
  refreshing,
  results,
  state,
}: SearchResultsViewProps) => {
  return (
    <Container expanded className="gap-md pt-md">
      <View className="gap-xs">
        <SearchInputField onChangeText={onQueryChange} value={query} />
        <Text selectable className="text-muted-foreground text-sm leading-5">
          Busca activos por ticker para preparar una orden.
        </Text>
      </View>

      {state === "idle" ? (
        <SearchEmptyState query={debouncedQuery} state="idle" />
      ) : null}

      {state === "loading" ? <SearchLoadingState /> : null}

      {state === "error" ? (
        <SearchErrorState
          message={errorMessage ?? "Intenta nuevamente en unos segundos."}
          onRetry={onRefresh}
        />
      ) : null}

      {state === "empty" ? (
        <SearchEmptyState query={debouncedQuery} state="empty" />
      ) : null}

      {state === "results" ? (
        <SearchResultList
          onRefresh={onRefresh}
          onResultPress={onResultPress}
          refreshing={refreshing}
          results={results}
        />
      ) : null}
    </Container>
  )
}
```

- [ ] **Step 4: Add screen container with debounce and placeholder press**

Create `src/features/search/components/SearchScreen.tsx`:

```tsx
import {useEffect, useState} from "react"
import {Alert as NativeAlert} from "react-native"

import {StatusBar} from "expo-status-bar"

import {SearchResultsView} from "./SearchResultsView"

import {useSearchResultsQuery} from "../hooks/useSearchResultsQuery"
import {normalizeSearchQuery} from "../searchText"
import type {SearchQueryState, SearchResult} from "../types"

const SEARCH_DEBOUNCE_MS = 350

const getSearchErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message
  }

  return "Intenta nuevamente en unos segundos."
}

const getSearchQueryState = ({
  debouncedQuery,
  isError,
  isFetching,
  results,
}: {
  debouncedQuery: string
  isError: boolean
  isFetching: boolean
  results: SearchResult[]
}): SearchQueryState => {
  if (debouncedQuery.length === 0) {
    return "idle"
  }

  if (isFetching && results.length === 0) {
    return "loading"
  }

  if (isError) {
    return "error"
  }

  if (results.length === 0) {
    return "empty"
  }

  return "results"
}

export const SearchScreen = () => {
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedQuery(normalizeSearchQuery(query))
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [query])

  const resultsQuery = useSearchResultsQuery(debouncedQuery)
  const results = resultsQuery.data ?? []
  const state = getSearchQueryState({
    debouncedQuery,
    isError: resultsQuery.isError,
    isFetching: resultsQuery.isFetching,
    results,
  })

  const handleRefresh = () => {
    void resultsQuery.refetch()
  }

  const handleResultPress = (result: SearchResult) => {
    NativeAlert.alert(
      result.ticker,
      "El ticket de orden se implementa en la feature Orders."
    )
  }

  return (
    <>
      <StatusBar style="auto" />
      <SearchResultsView
        debouncedQuery={debouncedQuery}
        errorMessage={
          resultsQuery.isError
            ? getSearchErrorMessage(resultsQuery.error)
            : null
        }
        onQueryChange={setQuery}
        onRefresh={handleRefresh}
        onResultPress={handleResultPress}
        query={query}
        refreshing={resultsQuery.isRefetching}
        results={results}
        state={state}
      />
    </>
  )
}
```

- [ ] **Step 5: Format and check**

Run:

```bash
node scripts/format-after-edit.mjs <<'JSON'
{"file_path":"src/features/search/components/SearchResultRow.tsx","target_file":"src/features/search/components/SearchResultList.tsx","path":"src/features/search/components/SearchResultsView.tsx","files":[{"file_path":"src/features/search/components/SearchScreen.tsx"}]}
JSON
bunx prettier --check src/features/search/components/SearchResultRow.tsx src/features/search/components/SearchResultList.tsx src/features/search/components/SearchResultsView.tsx src/features/search/components/SearchScreen.tsx
```

Expected: formatting check passes.

- [ ] **Step 6: Commit**

```bash
git add src/features/search/components/SearchResultRow.tsx src/features/search/components/SearchResultList.tsx src/features/search/components/SearchResultsView.tsx src/features/search/components/SearchScreen.tsx
git commit -m "feat: add search screen UI"
```

## Task 5: Route Wiring And Verification

**Files:**

- Create: `src/app/search.tsx`
- Modify: `src/app/_layout.tsx`

- [ ] **Step 1: Add route file**

Create `src/app/search.tsx`:

```tsx
import {SearchScreen} from "@/features/search/components/SearchScreen"

export default function SearchRoute() {
  return <SearchScreen />
}
```

- [ ] **Step 2: Register Stack screen**

Modify `src/app/_layout.tsx` so the Stack screens are:

```tsx
<Stack.Screen name="index" options={{title: "Markets"}} />
<Stack.Screen name="portfolio" options={{title: "Portfolio"}} />
<Stack.Screen name="search" options={{title: "Search"}} />
```

Keep the existing imports and providers. Do not import from `@react-navigation/*`; Expo SDK 56 routes navigation through `expo-router` entry points.

- [ ] **Step 3: Format route files**

Run:

```bash
node scripts/format-after-edit.mjs <<'JSON'
{"file_path":"src/app/search.tsx","target_file":"src/app/_layout.tsx"}
JSON
```

Expected: Prettier runs only on the route files.

- [ ] **Step 4: Run focused verification**

Run:

```bash
bun test src/features/search/searchText.test.ts
bun run lint
bun run format:check
```

Expected: all commands pass. If `bun run lint` or `bun run format:check` reports pre-existing unrelated dirty-worktree issues, record the exact files and do not change unrelated code.

- [ ] **Step 5: Start Metro for native verification**

Run:

```bash
EXPO_PUBLIC_API_URL=https://dummy-api-topaz.vercel.app bun start -- --port 8081
```

Expected: Metro starts on port `8081`.

- [ ] **Step 6: Verify with Argent MCP**

Use the Argent workflow required by `AGENTS.md`:

1. Discover/select the simulator or emulator.
2. Use Argent `describe`.
3. Use Argent `debugger-component-tree`.
4. Use Argent `screenshot`.
5. Navigate to `/search` if the current route is not Search.
6. Type `DYC`.
7. Wait at least 350 ms for debounce plus network completion.
8. Verify the result list shows `DYCA`.
9. Tap `DYCA`.
10. Verify the placeholder alert appears and references the future Orders feature.
11. Search a nonsense ticker such as `ZZZZZ`.
12. Verify the no-results empty state.

Expected: Search input, loading state, `DYCA` result, no-results state, and press placeholder are visible and usable on native.

- [ ] **Step 7: Commit**

```bash
git add src/app/search.tsx src/app/_layout.tsx
git commit -m "feat: expose search route"
```

## Final Quality Gate

- [ ] `src/app/search.tsx` only renders `<SearchScreen />`.
- [ ] Every new source file is under `src/features/search/`, except the route file.
- [ ] Every Search component file/export starts with `Search`.
- [ ] Only `src/features/search/hooks/useSearchResultsQuery.ts` imports `useQuery`.
- [ ] `searchQueries.results(query)` uses `queryOptions`.
- [ ] Query key includes the normalized query variable.
- [ ] Blank input does not call `/search`.
- [ ] Debounce waits 350 ms before updating the query.
- [ ] API responses are Zod-validated before returning.
- [ ] Results are sorted by ticker.
- [ ] Presentational components do not import API functions or TanStack Query hooks.
- [ ] Result press is only a placeholder alert for the future Orders modal.
- [ ] No dynamic Tailwind class names.
- [ ] Formatter script ran after edits.
- [ ] Native UI verification used Argent with Metro on port `8081`.

## Out Of Scope

- Do not implement the Orders modal.
- Do not POST `/orders`.
- Do not invalidate Portfolio queries from Search; that belongs to Orders.
- Do not redesign global navigation unless a later app-shell feature explicitly adds tabs or a trading home.
- Do not fetch blank search as "all instruments"; the Search UX should begin in an idle state.

## Self-Review

- Spec coverage: The plan covers `GET /search?query=DYC`, debounced input, results by ticker, idle/loading/error/no-results states, and result press placeholder.
- Placeholder scan: No task uses disallowed placeholder language or unspecified edge handling.
- Type consistency: `SearchResult`, `SearchResultApiItem`, and `SearchQueryState` are defined before use and referenced consistently in later tasks.
- Architecture consistency: Route files stay thin, the API/query/hook layers follow the repo rules, and all Search UI components use the feature prefix.
