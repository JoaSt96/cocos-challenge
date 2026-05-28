# Cocos Challenge Feature Split And Prompt Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Cocos React Native challenge as a production-minded Expo app by implementing one feature at a time.

**Architecture:** Keep route files thin and put product behavior under `src/features/<feature-name>/`. Each feature owns its API calls, TanStack Query factories, UI hooks, screen/container components, presentational proxy components, and feature-local helpers. The root route renders one composition screen, while child features own their own data loading and user interactions.

**Tech Stack:** Expo SDK 56, Expo Router, React Native, TypeScript, TanStack Query v5, Axios, Zod, Uniwind, class-variance-authority, @gorhom/bottom-sheet.

---

## Context Checked

- Challenge source: `CHALLENGE.md`.
- Versioned Expo docs checked before planning Expo-specific work: `https://docs.expo.dev/versions/v56.0.0/`.
- Current project dependencies include Expo SDK 56, Expo Router, TanStack Query, Axios, Zod, Uniwind, CVA, Bottom Sheet, FlashList, and lucide icons.
- Current `src/features/home-example/` is useful only as a layer reference. Some files there import unavailable packages or components, so prompts must verify imports against the live repo before copying code.
- API samples observed:
  - `/instruments` returns instruments with `id`, `ticker`, `name`, `type`, `last_price`, `close_price`.
  - `/portfolio` returns positions with `instrument_id`, `ticker`, `quantity`, `last_price`, `close_price`, `avg_cost_price`.
  - `/search?query=DYC` returns instrument-shaped search results.

## Recommended Feature Split

### 0. App Foundation

Purpose: Make the app shell ready for feature work without implementing product screens.

Owns:

- `src/app/_layout.tsx` provider wiring.
- `src/app/index.tsx` thin route composition.
- Shared product formatting helpers if needed by multiple features.
- Modal provider setup for order tickets.
- README run instructions and technical decisions section.

Should include:

- `QueryClientProvider` already exists.
- Add bottom sheet provider requirements only if the order modal needs it.
- Keep API base URL in `.env.example` as `EXPO_PUBLIC_API_URL=https://dummy-api-topaz.vercel.app`.
- Keep shared helpers generic and stable, such as money and percent formatting.

Do not include:

- Instrument fetching.
- Portfolio calculations.
- Order submission.
- Search behavior.

### 1. Markets Feature

Folder: `src/features/markets/`

Purpose: Display the instruments list and calculate daily return from `last_price` and `close_price`.

Owns:

- `api/markets.api.ts`: raw `GET /instruments` and `GET /search` calls through `src/config/api.config.ts`.
- `queries/marketsQueries.ts`: query keys and `queryOptions` factories.
- `hooks/useInstrumentsQuery.ts`: UI-facing `useQuery(marketsQueries.instruments())`.
- `hooks/useAssetSearchQuery.ts`: UI-facing search query hook, enabled only when query text is non-empty.
- `components/MarketsPanel.tsx`: container that loads instruments and wires row press callbacks.
- `components/MarketsInstrumentList.tsx`: presentational list.
- `components/MarketsInstrumentRow.tsx`: feature-named proxy row for ticker, name, price, return.
- `components/MarketsInstrumentReturnBadge.tsx`: profit/loss visual state.
- `types.ts`: normalized `Instrument` and related types if they are not shared elsewhere.
- `marketMath.ts`: daily return helper if only markets uses it.

Key calculations:

- `dailyReturn = ((last_price - close_price) / close_price) * 100`.
- Guard against `close_price <= 0` by returning `0` or a safe display state.

Acceptance:

- Loading, empty, error, and pull-to-refresh states.
- Tapping an instrument calls a typed `onInstrumentPress(instrument)` callback.
- No presentational component imports API functions or TanStack Query hooks.

### 2. Portfolio Feature

Folder: `src/features/portfolio/`

Purpose: Display positions with quantity, market value, absolute gain, and total return.

Owns:

- `api/portfolio.api.ts`: raw `GET /portfolio` call and Zod validation/normalization.
- `queries/portfolioQueries.ts`: query keys and `queryOptions`.
- `hooks/usePortfolioQuery.ts`: UI-facing query hook.
- `components/PortfolioPanel.tsx`: container that loads portfolio and wires refresh/error states.
- `components/PortfolioSummary.tsx`: presentational account-style summary.
- `components/PortfolioPositionList.tsx`: presentational list.
- `components/PortfolioAssetRow.tsx`: feature-named proxy row for each holding.
- `portfolioMath.ts`: position calculations.
- `types.ts`: normalized `PortfolioPosition` and `PortfolioPositionMetrics`.

Key calculations:

- `marketValue = quantity * last_price`.
- `costBasis = quantity * avg_cost_price`.
- `gain = marketValue - costBasis`.
- `totalReturn = costBasis > 0 ? (gain / costBasis) * 100 : 0`.

Acceptance:

- Shows all positions returned by the endpoint, including duplicate `instrument_id` rows as separate positions unless product requirements later say to aggregate.
- Uses pesos formatting.
- Profit/loss coloring is derived from calculated gain/return, not from ticker.
- No order mutation code lives here.

### 3. Orders Feature

Folder: `src/features/orders/`

Purpose: Let users submit BUY/SELL MARKET/LIMIT orders for a selected instrument and display returned `id` and `status`.

Owns:

- `api/orders.api.ts`: raw `POST /orders` call and response validation.
- `queries/ordersQueries.ts`: query keys only if an order history/read query is added later; otherwise skip.
- `hooks/useCreateOrderMutation.ts`: UI-facing mutation hook.
- `components/OrdersTicketSheet.tsx`: bottom sheet container form.
- `components/OrdersSideSelector.tsx`: BUY/SELL segmented control.
- `components/OrdersTypeSelector.tsx`: MARKET/LIMIT segmented control.
- `components/OrdersQuantityModeSelector.tsx`: exact shares vs pesos amount.
- `components/OrdersStatusResult.tsx`: submitted id/status display.
- `orderValidation.ts`: request-building and validation helpers.
- `types.ts`: order side, type, status, request, response, and form state types.

Key behavior:

- Side: `BUY` or `SELL`.
- Type: `MARKET` or `LIMIT`.
- Quantity mode:
  - `SHARES`: use the exact integer entered.
  - `AMOUNT`: calculate `Math.floor(amountInPesos / selectedInstrument.last_price)`.
- LIMIT orders require `price`.
- MARKET orders must omit `price`.
- Disable submit when calculated quantity is less than `1`.
- After successful mutation, show returned `id` and `status`.
- Invalidate `portfolioQueries.positions()` after a successful order mutation because filled orders can affect holdings.
- If markets data is stale after a trade, invalidate `marketsQueries.instruments()` only if the implementation displays any order-sensitive values from that query.

Acceptance:

- MARKET response status is displayed as `FILLED` or `REJECTED`.
- LIMIT response status is displayed as `PENDING` or `REJECTED`.
- Rejected orders remain visible to the user.
- Form preserves selected instrument context: ticker, name, last price.

### 4. Search Feature

Folder: `src/features/search/`

Purpose: Provide asset lookup by ticker and route the selected result into the order flow.

Owns:

- `components/SearchAssetPanel.tsx`: container for query text and result loading.
- `components/SearchAssetInput.tsx`: typed input proxy.
- `components/SearchAssetResultList.tsx`: presentational list.
- `components/SearchAssetResultRow.tsx`: feature-named row.
- `hooks/useDebouncedSearchText.ts`: feature-local debounce helper if needed.

Data ownership:

- Reuse `marketsQueries.search(query)` through `src/features/markets/hooks/useAssetSearchQuery.ts` if the search endpoint returns the same normalized instrument type as markets.
- Do not duplicate `/search` raw API calls in this feature if `markets` already owns them.

Acceptance:

- Query text searches by ticker.
- Empty query shows an idle state, not a network error.
- Tapping a result opens the order ticket with that result as selected instrument.
- Debounce search input to avoid request-per-keystroke if implementation time allows.

### 5. Trading Home Feature

Folder: `src/features/trading-home/`

Purpose: Compose the product experience for the root route.

Owns:

- `components/TradingHomeScreen.tsx`: the feature screen rendered by `src/app/index.tsx`.
- `components/TradingHomeHeader.tsx`: app title, market status, optional portfolio summary slot.
- `components/TradingHomeTabSelector.tsx`: optional segmented control for `Markets` and `Portfolio`.
- `components/TradingHomeRefreshControl.tsx`: optional shared refresh composition.

Composition:

- `src/app/index.tsx` should only render `<TradingHomeScreen />`.
- `TradingHomeScreen` can compose `PortfolioPanel`, `SearchAssetPanel`, and `MarketsPanel`.
- `TradingHomeScreen` owns selected instrument state only if it is UI orchestration state. It should not own raw API calls.
- Order modal opening should call the `orders` feature with a normalized instrument object.

Acceptance:

- First screen is the usable app, not a landing page.
- User can inspect portfolio and market instruments without navigating through marketing content.
- User can start an order from either the instruments list or search results.

### 6. Documentation And Verification Feature Pass

Purpose: Finish the challenge deliverables.

Owns:

- `README.md`.
- Any small smoke-test or unit-test setup added during feature work.

Should include:

- Clear install/run commands for Bun and Expo.
- Local environment setup using `EXPO_PUBLIC_API_URL`.
- Technical decisions:
  - Feature-based architecture.
  - TanStack Query for server state.
  - Zod for response normalization.
  - Uniwind literal classes/CVA for styling.
  - Bottom sheet for order ticket.
  - React Compiler awareness: avoid unnecessary manual memoization.
- Known tradeoffs and next improvements.

Acceptance:

- `bun run lint` passes or documented known blocker is fixed.
- `bun run format:check` passes.
- Manual flow verified: load instruments, load portfolio, search ticker, submit a market order, submit a limit order.

## Build Order

1. App Foundation.
2. Markets Feature.
3. Portfolio Feature.
4. Orders Feature.
5. Search Feature.
6. Trading Home Composition.
7. README and final verification.

This order keeps every pass independently testable:

- Markets proves API/query/UI list patterns.
- Portfolio proves derived financial calculations.
- Orders proves mutation and bottom-sheet form behavior.
- Search reuses markets data contracts instead of creating a second source of truth.
- Trading Home connects completed features only after their boundaries exist.

## Copyable Implementation Prompts

### Prompt 0: App Foundation

```text
Use the repo instructions in AGENTS.md exactly. Before writing code, read the Expo SDK 56 docs at https://docs.expo.dev/versions/v56.0.0/ and verify the installed dependencies in package.json.

Implement only the app foundation for the Cocos challenge. Do not build instruments, portfolio, search, or orders yet.

Goals:
- Keep src/app/_layout.tsx as provider wiring only.
- Keep src/app/index.tsx as a thin route that renders a feature screen placeholder under src/features/trading-home/components/TradingHomeScreen.tsx.
- Ensure the modal/bottom-sheet provider setup is ready for a later order ticket if required by the existing @gorhom/bottom-sheet components.
- Add shared formatting helpers only if they are clearly cross-feature, for pesos and percentages.
- Preserve EXPO_PUBLIC_API_URL usage from src/config/api.config.ts.

Architecture constraints:
- New feature code must live under src/features/trading-home/.
- Use Uniwind literal className strings or cva.
- Do not copy unavailable imports from src/features/home-example/.
- Route files must not import TanStack Query hooks or API functions.

Verification:
- Run bun run format:check.
- Run bun run lint.
- Start Expo only if needed to verify provider/runtime behavior.

Output:
- Summarize files changed and any blockers.
```

### Prompt 1: Markets Feature

```text
Use the repo instructions in AGENTS.md exactly. Before writing code, read the Expo SDK 56 docs at https://docs.expo.dev/versions/v56.0.0/ and verify imports/dependencies against package.json.

Implement only the markets feature under src/features/markets/.

Requirements from CHALLENGE.md:
- Fetch GET /instruments through src/config/api.config.ts.
- Show ticker, name, last price in pesos, and daily return calculated from last_price and close_price.
- Tapping an instrument must call a typed callback so a later orders feature can open an order ticket.

Files to create:
- src/features/markets/api/markets.api.ts
- src/features/markets/queries/marketsQueries.ts
- src/features/markets/hooks/useInstrumentsQuery.ts
- src/features/markets/hooks/useAssetSearchQuery.ts
- src/features/markets/components/MarketsPanel.tsx
- src/features/markets/components/MarketsInstrumentList.tsx
- src/features/markets/components/MarketsInstrumentRow.tsx
- src/features/markets/components/MarketsInstrumentReturnBadge.tsx
- src/features/markets/types.ts
- src/features/markets/marketMath.ts

Data rules:
- Validate/normalize the API response with zod before returning it.
- Query files must use queryOptions from @tanstack/react-query.
- Query keys must be readonly arrays and include every query variable.
- useInstrumentsQuery and useAssetSearchQuery are the only files in this feature that import useQuery.
- Include GET /search?query=... in markets.api.ts and marketsQueries.ts because the endpoint returns instrument-shaped data, but do not build search UI yet.

UI rules:
- Feature UI must wrap shared components behind feature-named components.
- Presentational components receive plain props only.
- Use literal className strings or cva only.
- Include loading, empty, error, and refresh states.

Verification:
- Add focused unit tests for marketMath if the repo has a test runner; if not, document that no test runner exists and keep the helper simple.
- Run bun run format:check.
- Run bun run lint.

Output:
- Summarize files changed, calculation behavior, and verification results.
```

### Prompt 2: Portfolio Feature

```text
Use the repo instructions in AGENTS.md exactly. Before writing code, read the Expo SDK 56 docs at https://docs.expo.dev/versions/v56.0.0/ and verify imports/dependencies against package.json.

Implement only the portfolio feature under src/features/portfolio/.

Requirements from CHALLENGE.md:
- Fetch GET /portfolio through src/config/api.config.ts.
- For every returned position, show ticker, quantity, market value, absolute gain, and total return.
- Use avg_cost_price as the average purchase price.

Files to create:
- src/features/portfolio/api/portfolio.api.ts
- src/features/portfolio/queries/portfolioQueries.ts
- src/features/portfolio/hooks/usePortfolioQuery.ts
- src/features/portfolio/components/PortfolioPanel.tsx
- src/features/portfolio/components/PortfolioSummary.tsx
- src/features/portfolio/components/PortfolioPositionList.tsx
- src/features/portfolio/components/PortfolioAssetRow.tsx
- src/features/portfolio/types.ts
- src/features/portfolio/portfolioMath.ts

Calculations:
- marketValue = quantity * last_price
- costBasis = quantity * avg_cost_price
- gain = marketValue - costBasis
- totalReturn = costBasis > 0 ? (gain / costBasis) * 100 : 0

Data rules:
- Validate/normalize API response with zod before returning it.
- Query files must use queryOptions from @tanstack/react-query.
- Query keys must be readonly arrays.
- usePortfolioQuery is the only portfolio file that imports useQuery.

UI rules:
- Show duplicate instrument_id positions separately unless CHALLENGE.md is changed to request aggregation.
- Profit/loss visual state must come from calculated gain.
- Presentational components must not import API functions or TanStack Query hooks.
- Use literal className strings or cva only.

Verification:
- Add focused unit tests for portfolioMath if the repo has a test runner; if not, document that no test runner exists and keep the helper simple.
- Run bun run format:check.
- Run bun run lint.

Output:
- Summarize files changed, calculation behavior, and verification results.
```

### Prompt 3: Orders Feature

```text
Use the repo instructions in AGENTS.md exactly. Before writing code, read the Expo SDK 56 docs at https://docs.expo.dev/versions/v56.0.0/ and verify imports/dependencies against package.json.

Implement only the orders feature under src/features/orders/.

Requirements from CHALLENGE.md:
- Submit POST /orders through src/config/api.config.ts.
- User can choose BUY or SELL.
- User can choose MARKET or LIMIT.
- User can enter exact share quantity or a total investment amount in pesos.
- If amount mode is used, calculate maximum whole shares with Math.floor(amount / selectedInstrument.last_price).
- LIMIT requires price.
- MARKET omits price.
- Display returned id and status.

Files to create:
- src/features/orders/api/orders.api.ts
- src/features/orders/hooks/useCreateOrderMutation.ts
- src/features/orders/components/OrdersTicketSheet.tsx
- src/features/orders/components/OrdersSideSelector.tsx
- src/features/orders/components/OrdersTypeSelector.tsx
- src/features/orders/components/OrdersQuantityModeSelector.tsx
- src/features/orders/components/OrdersStatusResult.tsx
- src/features/orders/types.ts
- src/features/orders/orderValidation.ts

Data rules:
- Validate/normalize request input before posting.
- Validate/normalize response with zod before returning it.
- useCreateOrderMutation is the only orders file that imports useMutation.
- On successful mutation, invalidate portfolioQueries.positions() because a filled order can affect holdings.
- Only invalidate marketsQueries.instruments() if the UI uses order-sensitive market values.

UI rules:
- Build the ticket as a bottom sheet using existing modal/bottom-sheet components where possible.
- Feature components must wrap shared UI primitives behind order-specific names.
- Disable submit when calculated quantity is less than 1.
- Show validation messages near the relevant control.
- Keep returned PENDING, REJECTED, and FILLED states visible after submission.

Verification:
- Add focused unit tests for orderValidation if the repo has a test runner; if not, document that no test runner exists and keep helper logic small.
- Run bun run format:check.
- Run bun run lint.
- Manually submit one MARKET order and one LIMIT order if the API is reachable.

Output:
- Summarize files changed, request body behavior, invalidations, and verification results.
```

### Prompt 4: Search Feature

```text
Use the repo instructions in AGENTS.md exactly. Before writing code, read the Expo SDK 56 docs at https://docs.expo.dev/versions/v56.0.0/ and verify imports/dependencies against package.json.

Implement only the search feature under src/features/search/.

Requirements from CHALLENGE.md:
- Build a ticker asset search using GET /search?query=...
- Selecting a search result must call a typed callback with the selected instrument so the orders feature can open an order ticket.

Files to create:
- src/features/search/components/SearchAssetPanel.tsx
- src/features/search/components/SearchAssetInput.tsx
- src/features/search/components/SearchAssetResultList.tsx
- src/features/search/components/SearchAssetResultRow.tsx
- src/features/search/hooks/useDebouncedSearchText.ts

Data ownership:
- Reuse src/features/markets/hooks/useAssetSearchQuery.ts.
- Do not duplicate raw /search API calls in src/features/search/.

UI rules:
- Empty query shows an idle state.
- Loading query shows a small loading state.
- No results shows an empty state.
- Error state allows retry.
- Use literal className strings or cva only.
- Presentational components receive plain props only.

Verification:
- Run bun run format:check.
- Run bun run lint.
- Manually search DYC and verify DYCA appears if the API is reachable.

Output:
- Summarize files changed, debounce behavior, and verification results.
```

### Prompt 5: Trading Home Composition

```text
Use the repo instructions in AGENTS.md exactly. Before writing code, read the Expo SDK 56 docs at https://docs.expo.dev/versions/v56.0.0/ and verify imports/dependencies against package.json.

Implement only the trading home composition.

Requirements:
- src/app/index.tsx must only render the feature screen component.
- src/features/trading-home/components/TradingHomeScreen.tsx composes completed feature containers.
- The first screen must be the usable app: portfolio, search, and instruments access.
- Starting an order from markets or search opens the orders feature for the selected instrument.

Files to modify/create:
- Modify src/app/index.tsx
- Modify src/features/trading-home/components/TradingHomeScreen.tsx
- Create src/features/trading-home/components/TradingHomeHeader.tsx if needed.
- Create src/features/trading-home/components/TradingHomeTabSelector.tsx if using a Markets/Portfolio segmented control.

Composition rules:
- Do not fetch raw API data in src/app/index.tsx.
- Do not import raw API functions in trading-home components.
- UI orchestration state, such as selected instrument or active tab, can live in TradingHomeScreen.
- Keep repeated domain UI inside each owning feature, not in TradingHomeScreen.

Verification:
- Run bun run format:check.
- Run bun run lint.
- Start Expo and manually verify:
  - instruments load
  - portfolio loads
  - search returns DYCA for DYC
  - order sheet opens from an instrument row
  - order sheet opens from a search result

Output:
- Summarize files changed and manual verification results.
```

### Prompt 6: README And Final Verification

```text
Use the repo instructions in AGENTS.md exactly. Before writing code, read the Expo SDK 56 docs at https://docs.expo.dev/versions/v56.0.0/ and verify imports/dependencies against package.json.

Finish the challenge documentation and verification.

Requirements from CHALLENGE.md:
- README.md must include clear instructions to run the project.
- README.md must include a dedicated technical decisions section.
- The app should be presented as production-ready within challenge scope.

Files to modify:
- README.md

README content:
- Prerequisites: Bun, Node compatible with Expo SDK 56, Expo tooling.
- Environment setup: EXPO_PUBLIC_API_URL=https://dummy-api-topaz.vercel.app.
- Install command: bun install.
- Run commands: bun run start, bun run ios, bun run android as applicable.
- Quality commands: bun run format:check, bun run lint.
- Technical decisions:
  - feature-based architecture
  - TanStack Query for server state
  - Zod for response validation
  - Axios config for API access
  - Uniwind/CVA for styling
  - bottom sheet order ticket
  - React Compiler awareness
- Manual verification checklist.
- Known tradeoffs and next improvements.

Verification:
- Run bun run format:check.
- Run bun run lint.
- Run the app and manually verify the primary challenge flows if possible.

Output:
- Summarize documentation changes and final verification results.
```

## Final Verification Checklist

- [ ] `bun run format:check`
- [ ] `bun run lint`
- [ ] App loads through Expo.
- [ ] `/instruments` list renders ticker, name, price, return.
- [ ] `/portfolio` list renders ticker, quantity, market value, gain, return.
- [ ] `/search?query=DYC` returns DYCA in the UI.
- [ ] MARKET order can be submitted and displays returned `id` and `status`.
- [ ] LIMIT order can be submitted and displays returned `id` and `status`.
- [ ] README explains setup and technical decisions.
