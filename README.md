# Cocos Challenge

React Native trading app built with Expo Router, TypeScript, Uniwind, TanStack Query, and the dummy Cocos challenge API.

## Requirements

- Bun
- Node.js compatible with Expo SDK 56
- Xcode for iOS simulator or Android Studio for Android emulator

## Setup

```sh
bun install
```

Start Metro on the default port:

```sh
bun run start
```

Run a native target:

```sh
bun run ios
bun run android
```

For a clean Metro restart after native, Babel, or React Compiler config changes:

```sh
npx expo start --clear
```

## Verification

```sh
bun test
bunx tsc --noEmit
bun run lint
bun run format:check
```

Native UI verification should use the Argent workflow against Metro on port `8081`.

## Challenge Coverage

- Markets: loads `/instruments` and displays ticker, name, last price, and daily return calculated from `last_price` and `close_price`.
- Portfolio: loads `/portfolio` and displays ticker, quantity, market value, gain, and total return using `avg_cost_price` as cost basis.
- Search: queries `/search?query=...` by ticker with debounced input and quick ticker suggestions.
- Orders: opens a bottom-sheet order ticket from instruments/search/portfolio flows, supports `BUY` and `SELL`, `MARKET` and `LIMIT`, exact shares or ARS amount, and displays returned order id/status.

## Technical Decisions

- Expo SDK 56 and Expo Router provide the native app shell, tab navigation, and stack routes.
- Feature code lives under `src/features/<feature-name>/`; route files in `src/app/` compose screen-level data and navigation.
- Raw HTTP calls go through `src/config/api.config.ts` and feature-local `api/*.api.ts` files. Responses are parsed with Zod before being normalized for UI use.
- TanStack Query owns server state. Query option factories live under feature `queries/` folders, UI hooks live under feature `hooks/`, and the global query client keeps inactive data cached briefly to avoid immediate refetch churn.
- React Hook Form and Zod validate the order ticket. ARS amount mode computes the maximum whole-share quantity using the selected instrument last price; fractional shares are rejected.
- Shared UI primitives live in `src/components/`, while feature UI wraps them behind domain-named components such as `MarketsInstrumentRow`, `PortfolioPositionRow`, and `OrdersTicketForm`.
- Long collections use FlashList. Charts use Skia/Victory Native with shared chart theming.
- Error, empty, loading, and pull-to-refresh states are implemented per feature so failed API requests remain recoverable.

## API

The app uses:

- `GET https://dummy-api-topaz.vercel.app/instruments`
- `GET https://dummy-api-topaz.vercel.app/portfolio`
- `GET https://dummy-api-topaz.vercel.app/search?query=DYC`
- `POST https://dummy-api-topaz.vercel.app/orders`

The API base URL is configured in `src/config/api.config.ts`.
