# Orders Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Orders feature for the Cocos challenge: open an order ticket from Markets and Search rows, submit `POST /orders`, validate request/response data, show returned `id` and `status`, and refresh Portfolio after successful submission.

**Architecture:** `src/features/orders/` owns order request validation, raw API calls, the UI-facing mutation hook, local formatting, and Orders-prefixed bottom-sheet components. Markets and Search remain the launch points and only import the Orders ticket plus a structural instrument adapter. `src/app/_layout.tsx` owns the modal provider setup because the existing bottom-sheet modal context is app-wide infrastructure.

**Tech Stack:** Expo SDK 56, Expo Router Stack, React Native, TypeScript, TanStack Query v5, Axios, Zod, Uniwind, @gorhom/bottom-sheet, Bun test, Argent native UI verification.

---

## References Used

- Expo SDK 56 docs: `https://docs.expo.dev/versions/v56.0.0/`
- Expo Router SDK 56 docs: `https://docs.expo.dev/versions/v56.0.0/sdk/router/`
- Expo Router Stack SDK 56 docs: `https://docs.expo.dev/versions/v56.0.0/sdk/router/stack/`
- Expo modal guidance: `https://docs.expo.dev/router/advanced/modals/`
- Local `AGENTS.md`: feature boundaries, TanStack Query factory rules, proxy component rules, Uniwind styling, post-edit formatting, and Argent verification.
- Existing Markets/Search placeholder behavior in `src/features/markets/components/MarketsScreen.tsx` and `src/features/search/components/SearchScreen.tsx`.
- Existing Portfolio query factory in `src/features/portfolio/queries/portfolioQueries.ts` for post-order invalidation.
- Existing bottom-sheet infrastructure in `src/components/modals/`.

## User-Facing Result

The app supports the remaining core endpoint flow from `CHALLENGE.md`:

- Tapping a Markets instrument opens an order ticket for that instrument.
- Tapping a Search result opens the same order ticket for that result.
- The ticket supports:
  - `BUY` and `SELL`.
  - `MARKET` and `LIMIT`.
  - quantity by exact shares.
  - quantity by ARS amount, converted to maximum whole shares with `Math.floor(amount / selectedInstrument.lastPrice)`.
  - limit price only when type is `LIMIT`.
- Submit sends:
  - `instrument_id`
  - `side`
  - `type`
  - `quantity`
  - `price` only for `LIMIT`
- Loading disables submit and keeps the sheet open.
- Validation errors appear next to the relevant input.
- Success/error response state stays visible in the sheet.
- Returned `id` and `status` are displayed.
- Portfolio positions are invalidated after a successful submission.

## File Map

Create:

- `src/features/orders/types.ts`
  - Order enums, selected instrument shape, form state, request payload, response shape, and field error types.
- `src/features/orders/orderValidation.ts`
  - Pure parsing, quantity calculation, validation, and request-building helpers.
- `src/features/orders/orderValidation.test.ts`
  - Unit coverage for share mode, ARS mode, MARKET/LIMIT request bodies, and invalid states.
- `src/features/orders/orderFormatters.ts`
  - Peso, quantity, and status label helpers local to Orders.
- `src/features/orders/api/orders.api.ts`
  - Raw `POST /orders`, Zod request/response validation, and response normalization.
- `src/features/orders/hooks/useCreateOrderMutation.ts`
  - The only Orders file that imports `useMutation`; invalidates Portfolio positions on success.
- `src/features/orders/components/OrdersTicketSheet.tsx`
  - Bottom-sheet feature container. Owns form state, mutation, validation, and result display.
- `src/features/orders/components/OrdersInstrumentSummary.tsx`
  - Selected instrument header.
- `src/features/orders/components/OrdersSideSelector.tsx`
  - Orders-prefixed BUY/SELL segmented control.
- `src/features/orders/components/OrdersTypeSelector.tsx`
  - Orders-prefixed MARKET/LIMIT segmented control.
- `src/features/orders/components/OrdersQuantityModeSelector.tsx`
  - Orders-prefixed shares/ARS segmented control.
- `src/features/orders/components/OrdersNumberInput.tsx`
  - Orders-prefixed numeric input proxy around shared `Input`.
- `src/features/orders/components/OrdersSubmitButton.tsx`
  - Orders-prefixed submit button proxy around shared `Button`.
- `src/features/orders/components/OrdersStatusResult.tsx`
  - Displays returned order id/status and mutation errors.
- `src/features/orders/components/OrdersFieldError.tsx`
  - Stable inline validation message component.

Modify:

- `src/app/_layout.tsx`
  - Add `GestureHandlerRootView`, `BottomSheetModalProvider`, and existing `ModalProvider`.
- `src/hooks/useModal.ts`
  - Allow modal launchers to pass per-open override props, which lets Markets/Search open the same ticket component with the tapped instrument.
- `src/features/markets/components/MarketsScreen.tsx`
  - Replace native alert placeholder with `OrdersTicketSheet` modal opening.
- `src/features/search/components/SearchScreen.tsx`
  - Replace native alert placeholder with `OrdersTicketSheet` modal opening.

Do not create:

- `src/app/orders.tsx`; the challenge asks for a modal launched from instruments, not a standalone Orders route.
- `src/features/orders/queries/`; there is no read query for order history.

## Data Contract

Selected instrument passed into Orders:

```ts
export type OrdersInstrument = {
  id: number
  ticker: string
  name: string
  type: string
  lastPrice: number
}
```

Request payload:

```ts
export type CreateOrderPayload = {
  instrument_id: number
  side: "BUY" | "SELL"
  type: "MARKET" | "LIMIT"
  quantity: number
  price?: number
}
```

Normalized response:

```ts
export type CreateOrderResponse = {
  id: string
  status: "PENDING" | "REJECTED" | "FILLED"
}
```

Validation rules:

```ts
MARKET orders omit price.
LIMIT orders require price > 0.
Share mode requires a whole share quantity >= 1.
ARS mode requires amount > 0 and computes Math.floor(amount / instrument.lastPrice).
Computed quantity must be >= 1 before submit.
```

## UX/UI Plan

Use a bottom sheet because this is a self-contained order task launched from existing list rows. The Expo modal docs distinguish standalone temporary interactions from navigation-system modal screens; the repo already has @gorhom bottom-sheet infrastructure for this interaction style.

Visual treatment:

- Compact instrument header: ticker, name, latest ARS price.
- Segmented controls for side, type, and quantity mode.
- BUY uses the app primary color, SELL uses destructive treatment.
- MARKET hides the limit price field.
- LIMIT shows a price input and includes price in the body.
- Submit button text changes between `Enviar orden`, `Enviando...`, and `Enviar otra orden` after a result.
- Returned status badge:
  - `FILLED`: success color.
  - `PENDING`: warning color.
  - `REJECTED`: destructive color.
- All text fits compact mobile widths. No dynamic Tailwind class construction.

## Task 1: Orders Types And Validation

**Files:**

- Create: `src/features/orders/types.ts`
- Create: `src/features/orders/orderValidation.ts`
- Create: `src/features/orders/orderValidation.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/features/orders/orderValidation.test.ts`:

```ts
import {describe, expect, it} from "bun:test"

import {
  DEFAULT_ORDERS_FORM_STATE,
  buildCreateOrderPayload,
  getOrdersComputedQuantity,
  parseOrdersNumber,
  toOrdersInstrument,
} from "./orderValidation"
import type {OrdersFormState, OrdersInstrument} from "./types"

const instrument: OrdersInstrument = {
  id: 1,
  lastPrice: 45.72,
  name: "Dycasa S.A.",
  ticker: "DYCA",
  type: "ACCIONES",
}

const makeState = (overrides: Partial<OrdersFormState>): OrdersFormState => ({
  ...DEFAULT_ORDERS_FORM_STATE,
  ...overrides,
})

describe("orderValidation", () => {
  it("parses positive numbers with dot or comma decimal separators", () => {
    expect(parseOrdersNumber("123")).toBe(123)
    expect(parseOrdersNumber("84,5")).toBe(84.5)
    expect(parseOrdersNumber(" 84.5 ")).toBe(84.5)
    expect(parseOrdersNumber("abc")).toBeNull()
  })

  it("builds a MARKET payload from exact whole shares and omits price", () => {
    const result = buildCreateOrderPayload({
      formState: makeState({
        quantityMode: "SHARES",
        quantityText: "12",
        side: "BUY",
        type: "MARKET",
      }),
      instrument,
    })

    expect(result).toEqual({
      fieldErrors: {},
      payload: {
        instrument_id: 1,
        quantity: 12,
        side: "BUY",
        type: "MARKET",
      },
    })
  })

  it("rejects fractional share quantities in exact share mode", () => {
    const result = buildCreateOrderPayload({
      formState: makeState({
        quantityMode: "SHARES",
        quantityText: "12.5",
      }),
      instrument,
    })

    expect(result.payload).toBeNull()
    expect(result.fieldErrors.quantityText).toBe(
      "Ingresá una cantidad entera de acciones."
    )
  })

  it("calculates maximum whole shares from an ARS amount", () => {
    const result = getOrdersComputedQuantity({
      formState: makeState({
        amountText: "1000",
        quantityMode: "ARS",
      }),
      instrument,
    })

    expect(result).toBe(21)
  })

  it("rejects an ARS amount that cannot buy one share", () => {
    const result = buildCreateOrderPayload({
      formState: makeState({
        amountText: "10",
        quantityMode: "ARS",
      }),
      instrument,
    })

    expect(result.payload).toBeNull()
    expect(result.fieldErrors.amountText).toBe(
      "El monto no alcanza para comprar una acción."
    )
  })

  it("builds a LIMIT payload with price", () => {
    const result = buildCreateOrderPayload({
      formState: makeState({
        limitPriceText: "84,5",
        quantityMode: "SHARES",
        quantityText: "123",
        side: "SELL",
        type: "LIMIT",
      }),
      instrument,
    })

    expect(result).toEqual({
      fieldErrors: {},
      payload: {
        instrument_id: 1,
        price: 84.5,
        quantity: 123,
        side: "SELL",
        type: "LIMIT",
      },
    })
  })

  it("requires limit price only for LIMIT orders", () => {
    const result = buildCreateOrderPayload({
      formState: makeState({
        limitPriceText: "",
        quantityText: "1",
        type: "LIMIT",
      }),
      instrument,
    })

    expect(result.payload).toBeNull()
    expect(result.fieldErrors.limitPriceText).toBe(
      "Ingresá un precio límite mayor a cero."
    )
  })

  it("creates an Orders instrument from any matching market/search result shape", () => {
    expect(
      toOrdersInstrument({
        id: 7,
        lastPrice: 101,
        name: "Banco",
        ticker: "BMA",
        type: "ACCIONES",
      })
    ).toEqual({
      id: 7,
      lastPrice: 101,
      name: "Banco",
      ticker: "BMA",
      type: "ACCIONES",
    })
  })
})
```

- [ ] **Step 2: Run the failing tests**

Run:

```bash
bun test src/features/orders/orderValidation.test.ts
```

Expected: FAIL because `src/features/orders/orderValidation.ts` and `src/features/orders/types.ts` do not exist.

- [ ] **Step 3: Add the Orders types**

Create `src/features/orders/types.ts`:

```ts
export type OrderSide = "BUY" | "SELL"

export type OrderType = "MARKET" | "LIMIT"

export type OrderQuantityMode = "SHARES" | "ARS"

export type OrderStatus = "PENDING" | "REJECTED" | "FILLED"

export type OrdersInstrument = {
  id: number
  ticker: string
  name: string
  type: string
  lastPrice: number
}

export type OrdersFormState = {
  side: OrderSide
  type: OrderType
  quantityMode: OrderQuantityMode
  quantityText: string
  amountText: string
  limitPriceText: string
}

export type OrdersFieldErrors = Partial<
  Record<"quantityText" | "amountText" | "limitPriceText", string>
>

export type CreateOrderPayload = {
  instrument_id: number
  side: OrderSide
  type: OrderType
  quantity: number
  price?: number
}

export type CreateOrderResponse = {
  id: string
  status: OrderStatus
}
```

- [ ] **Step 4: Add the validation helpers**

Create `src/features/orders/orderValidation.ts`:

```ts
import type {
  CreateOrderPayload,
  OrdersFieldErrors,
  OrdersFormState,
  OrdersInstrument,
} from "./types"

type OrdersInstrumentLike = {
  id: number
  ticker: string
  name: string
  type: string
  lastPrice: number
}

type BuildCreateOrderPayloadArgs = {
  formState: OrdersFormState
  instrument: OrdersInstrument
}

type BuildCreateOrderPayloadResult = {
  fieldErrors: OrdersFieldErrors
  payload: CreateOrderPayload | null
}

export const DEFAULT_ORDERS_FORM_STATE: OrdersFormState = {
  amountText: "",
  limitPriceText: "",
  quantityMode: "SHARES",
  quantityText: "",
  side: "BUY",
  type: "MARKET",
}

export const toOrdersInstrument = (
  instrument: OrdersInstrumentLike
): OrdersInstrument => ({
  id: instrument.id,
  lastPrice: instrument.lastPrice,
  name: instrument.name,
  ticker: instrument.ticker,
  type: instrument.type,
})

export const parseOrdersNumber = (value: string): number | null => {
  const normalized = value.trim().replace(",", ".")
  if (normalized.length === 0) {
    return null
  }

  const parsed = Number(normalized)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null
  }

  return parsed
}

export const getOrdersComputedQuantity = ({
  formState,
  instrument,
}: BuildCreateOrderPayloadArgs): number => {
  if (formState.quantityMode === "ARS") {
    const amount = parseOrdersNumber(formState.amountText)
    if (!amount || instrument.lastPrice <= 0) {
      return 0
    }

    return Math.floor(amount / instrument.lastPrice)
  }

  const quantity = parseOrdersNumber(formState.quantityText)
  if (!quantity || !Number.isInteger(quantity)) {
    return 0
  }

  return quantity
}

export const buildCreateOrderPayload = ({
  formState,
  instrument,
}: BuildCreateOrderPayloadArgs): BuildCreateOrderPayloadResult => {
  const fieldErrors: OrdersFieldErrors = {}
  const quantity = getOrdersComputedQuantity({formState, instrument})

  if (formState.quantityMode === "SHARES") {
    const parsedQuantity = parseOrdersNumber(formState.quantityText)
    if (!parsedQuantity) {
      fieldErrors.quantityText = "Ingresá una cantidad de acciones."
    } else if (!Number.isInteger(parsedQuantity)) {
      fieldErrors.quantityText = "Ingresá una cantidad entera de acciones."
    }
  }

  if (formState.quantityMode === "ARS") {
    const parsedAmount = parseOrdersNumber(formState.amountText)
    if (!parsedAmount) {
      fieldErrors.amountText = "Ingresá un monto en pesos mayor a cero."
    } else if (quantity < 1) {
      fieldErrors.amountText = "El monto no alcanza para comprar una acción."
    }
  }

  const limitPrice =
    formState.type === "LIMIT"
      ? parseOrdersNumber(formState.limitPriceText)
      : null

  if (formState.type === "LIMIT" && !limitPrice) {
    fieldErrors.limitPriceText = "Ingresá un precio límite mayor a cero."
  }

  if (quantity < 1 && Object.keys(fieldErrors).length === 0) {
    fieldErrors.quantityText = "La orden debe enviar al menos una acción."
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      fieldErrors,
      payload: null,
    }
  }

  return {
    fieldErrors,
    payload: {
      instrument_id: instrument.id,
      ...(formState.type === "LIMIT" ? {price: limitPrice ?? undefined} : {}),
      quantity,
      side: formState.side,
      type: formState.type,
    },
  }
}
```

- [ ] **Step 5: Run the tests**

Run:

```bash
bun test src/features/orders/orderValidation.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/features/orders/types.ts src/features/orders/orderValidation.ts src/features/orders/orderValidation.test.ts
git commit -m "feat: add order request validation"
```

## Task 2: Orders API And Mutation

**Files:**

- Create: `src/features/orders/api/orders.api.ts`
- Create: `src/features/orders/hooks/useCreateOrderMutation.ts`
- Create: `src/features/orders/orderFormatters.ts`

- [ ] **Step 1: Add local formatters**

Create `src/features/orders/orderFormatters.ts`:

```ts
import type {OrderStatus} from "./types"

const ordersPesoFormatter = new Intl.NumberFormat("es-AR", {
  currency: "ARS",
  maximumFractionDigits: 2,
  style: "currency",
})

const ordersQuantityFormatter = new Intl.NumberFormat("es-AR", {
  maximumFractionDigits: 0,
})

export const formatOrdersPeso = (amount: number) =>
  ordersPesoFormatter.format(amount)

export const formatOrdersQuantity = (quantity: number) =>
  ordersQuantityFormatter.format(quantity)

export const getOrdersStatusLabel = (status: OrderStatus) => {
  if (status === "FILLED") {
    return "Ejecutada"
  }

  if (status === "PENDING") {
    return "Pendiente"
  }

  return "Rechazada"
}
```

- [ ] **Step 2: Add the raw POST API**

Create `src/features/orders/api/orders.api.ts`:

```ts
import {z} from "zod"

import {api} from "@/config/api.config"

import type {CreateOrderPayload, CreateOrderResponse} from "../types"

const createOrderPayloadSchema = z.object({
  instrument_id: z.number(),
  price: z.number().optional(),
  quantity: z.number().int().positive(),
  side: z.enum(["BUY", "SELL"]),
  type: z.enum(["MARKET", "LIMIT"]),
})

const createOrderResponseSchema = z.object({
  id: z.union([z.string(), z.number()]),
  status: z.enum(["PENDING", "REJECTED", "FILLED"]),
})

export const createOrder = async (
  payload: CreateOrderPayload
): Promise<CreateOrderResponse> => {
  const parsedPayload = createOrderPayloadSchema.safeParse(payload)

  if (!parsedPayload.success) {
    throw new Error("Invalid order request")
  }

  const response = await api.post("/orders", parsedPayload.data)
  const parsedResponse = createOrderResponseSchema.safeParse(response.data)

  if (!parsedResponse.success) {
    throw new Error("Invalid order response")
  }

  return {
    id: String(parsedResponse.data.id),
    status: parsedResponse.data.status,
  }
}
```

- [ ] **Step 3: Add the mutation hook**

Create `src/features/orders/hooks/useCreateOrderMutation.ts`:

```ts
import {useMutation, useQueryClient} from "@tanstack/react-query"

import {portfolioQueries} from "@/features/portfolio/queries/portfolioQueries"

import {createOrder} from "../api/orders.api"

export const useCreateOrderMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createOrder,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: portfolioQueries.positions().queryKey,
      })
    },
  })
}
```

- [ ] **Step 4: Run focused verification**

Run:

```bash
bun test src/features/orders/orderValidation.test.ts
bunx tsc --noEmit
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/orders/api/orders.api.ts src/features/orders/hooks/useCreateOrderMutation.ts src/features/orders/orderFormatters.ts
git commit -m "feat: add order API mutation"
```

## Task 3: App-Wide Bottom Sheet Provider

**Files:**

- Modify: `src/app/_layout.tsx`

- [ ] **Step 1: Wrap the app with bottom-sheet providers**

Replace `src/app/_layout.tsx` with:

```tsx
import {QueryClientProvider} from "@tanstack/react-query"
import {BottomSheetModalProvider} from "@gorhom/bottom-sheet"
import {Stack} from "expo-router"
import {GestureHandlerRootView} from "react-native-gesture-handler"
import {KeyboardProvider} from "react-native-keyboard-controller"

import "../global.css"

import {ModalProvider} from "@/components/modals"
import {queryClient} from "@/config/query.config"

export default function Layout() {
  return (
    <GestureHandlerRootView className="flex-1">
      <QueryClientProvider client={queryClient}>
        <KeyboardProvider>
          <BottomSheetModalProvider>
            <ModalProvider>
              <Stack
                screenOptions={{
                  headerLargeTitle: false,
                  headerShadowVisible: false,
                }}
              >
                <Stack.Screen name="index" options={{title: "Markets"}} />
                <Stack.Screen name="portfolio" options={{title: "Portfolio"}} />
                <Stack.Screen name="search" options={{title: "Search"}} />
              </Stack>
            </ModalProvider>
          </BottomSheetModalProvider>
        </KeyboardProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  )
}
```

- [ ] **Step 2: Verify the layout compiles**

Run:

```bash
bunx tsc --noEmit
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/app/_layout.tsx
git commit -m "feat: enable app modal provider"
```

## Task 4: Orders Ticket Components

**Files:**

- Create: `src/features/orders/components/OrdersFieldError.tsx`
- Create: `src/features/orders/components/OrdersInstrumentSummary.tsx`
- Create: `src/features/orders/components/OrdersSideSelector.tsx`
- Create: `src/features/orders/components/OrdersTypeSelector.tsx`
- Create: `src/features/orders/components/OrdersQuantityModeSelector.tsx`
- Create: `src/features/orders/components/OrdersNumberInput.tsx`
- Create: `src/features/orders/components/OrdersSubmitButton.tsx`
- Create: `src/features/orders/components/OrdersStatusResult.tsx`
- Create: `src/features/orders/components/OrdersTicketSheet.tsx`

- [ ] **Step 1: Add field error and instrument summary components**

Create `src/features/orders/components/OrdersFieldError.tsx`:

```tsx
import {Text} from "@/components/ui/text"

type OrdersFieldErrorProps = {
  message: string | undefined
}

export const OrdersFieldError = ({message}: OrdersFieldErrorProps) => {
  if (!message) {
    return null
  }

  return (
    <Text selectable className="text-destructive text-sm leading-5">
      {message}
    </Text>
  )
}
```

Create `src/features/orders/components/OrdersInstrumentSummary.tsx`:

```tsx
import {View} from "react-native"

import {Text} from "@/components/ui/text"

import {formatOrdersPeso} from "../orderFormatters"
import type {OrdersInstrument} from "../types"

type OrdersInstrumentSummaryProps = {
  instrument: OrdersInstrument
}

export const OrdersInstrumentSummary = ({
  instrument,
}: OrdersInstrumentSummaryProps) => {
  return (
    <View className="border-border bg-card gap-xs p-lg rounded-lg border">
      <View className="gap-md flex-row items-start justify-between">
        <View className="min-w-0 flex-1">
          <Text selectable className="text-foreground text-xl font-semibold">
            {instrument.ticker}
          </Text>
          <Text
            selectable
            className="text-muted-foreground text-sm leading-5"
            numberOfLines={2}
          >
            {instrument.name}
          </Text>
        </View>
        <View className="items-end">
          <Text selectable className="text-foreground text-base font-semibold">
            {formatOrdersPeso(instrument.lastPrice)}
          </Text>
          <Text selectable className="text-muted-foreground text-xs uppercase">
            {instrument.type}
          </Text>
        </View>
      </View>
    </View>
  )
}
```

- [ ] **Step 2: Add segmented selector components**

Create `src/features/orders/components/OrdersSideSelector.tsx`:

```tsx
import {Pressable, View} from "react-native"

import {Text} from "@/components/ui/text"
import {cn} from "@/lib/utils"

import type {OrderSide} from "../types"

type OrdersSideSelectorProps = {
  value: OrderSide
  onChange: (value: OrderSide) => void
}

const ORDER_SIDE_OPTIONS: {label: string; value: OrderSide}[] = [
  {label: "Comprar", value: "BUY"},
  {label: "Vender", value: "SELL"},
]

export const OrdersSideSelector = ({
  onChange,
  value,
}: OrdersSideSelectorProps) => {
  return (
    <View className="gap-xs">
      <Text className="text-muted-foreground text-sm font-medium">Lado</Text>
      <View className="bg-muted p-xs flex-row rounded-md">
        {ORDER_SIDE_OPTIONS.map(option => {
          const isSelected = option.value === value
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{selected: isSelected}}
              className={cn(
                "px-md min-h-10 flex-1 items-center justify-center rounded-sm",
                isSelected && option.value === "BUY" && "bg-primary",
                isSelected && option.value === "SELL" && "bg-destructive"
              )}
              key={option.value}
              onPress={() => onChange(option.value)}
            >
              <Text
                className={cn(
                  "text-sm font-semibold",
                  isSelected
                    ? "text-primary-foreground"
                    : "text-muted-foreground"
                )}
              >
                {option.label}
              </Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}
```

Create `src/features/orders/components/OrdersTypeSelector.tsx`:

```tsx
import {Pressable, View} from "react-native"

import {Text} from "@/components/ui/text"
import {cn} from "@/lib/utils"

import type {OrderType} from "../types"

type OrdersTypeSelectorProps = {
  value: OrderType
  onChange: (value: OrderType) => void
}

const ORDER_TYPE_OPTIONS: {label: string; value: OrderType}[] = [
  {label: "Market", value: "MARKET"},
  {label: "Limit", value: "LIMIT"},
]

export const OrdersTypeSelector = ({
  onChange,
  value,
}: OrdersTypeSelectorProps) => {
  return (
    <View className="gap-xs">
      <Text className="text-muted-foreground text-sm font-medium">Tipo</Text>
      <View className="bg-muted p-xs flex-row rounded-md">
        {ORDER_TYPE_OPTIONS.map(option => {
          const isSelected = option.value === value
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{selected: isSelected}}
              className={cn(
                "px-md min-h-10 flex-1 items-center justify-center rounded-sm",
                isSelected && "bg-card"
              )}
              key={option.value}
              onPress={() => onChange(option.value)}
            >
              <Text
                className={cn(
                  "text-sm font-semibold",
                  isSelected ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {option.label}
              </Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}
```

Create `src/features/orders/components/OrdersQuantityModeSelector.tsx`:

```tsx
import {Pressable, View} from "react-native"

import {Text} from "@/components/ui/text"
import {cn} from "@/lib/utils"

import type {OrderQuantityMode} from "../types"

type OrdersQuantityModeSelectorProps = {
  value: OrderQuantityMode
  onChange: (value: OrderQuantityMode) => void
}

const ORDER_QUANTITY_MODE_OPTIONS: {label: string; value: OrderQuantityMode}[] =
  [
    {label: "Acciones", value: "SHARES"},
    {label: "Pesos", value: "ARS"},
  ]

export const OrdersQuantityModeSelector = ({
  onChange,
  value,
}: OrdersQuantityModeSelectorProps) => {
  return (
    <View className="gap-xs">
      <Text className="text-muted-foreground text-sm font-medium">
        Cantidad por
      </Text>
      <View className="bg-muted p-xs flex-row rounded-md">
        {ORDER_QUANTITY_MODE_OPTIONS.map(option => {
          const isSelected = option.value === value
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{selected: isSelected}}
              className={cn(
                "px-md min-h-10 flex-1 items-center justify-center rounded-sm",
                isSelected && "bg-card"
              )}
              key={option.value}
              onPress={() => onChange(option.value)}
            >
              <Text
                className={cn(
                  "text-sm font-semibold",
                  isSelected ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {option.label}
              </Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}
```

- [ ] **Step 3: Add input, submit, and result proxy components**

Create `src/features/orders/components/OrdersNumberInput.tsx`:

```tsx
import {View} from "react-native"

import {Input} from "@/components/ui/input"
import {Text} from "@/components/ui/text"

import {OrdersFieldError} from "./OrdersFieldError"

type OrdersNumberInputProps = {
  error?: string
  label: string
  onChangeText: (value: string) => void
  placeholder: string
  value: string
}

export const OrdersNumberInput = ({
  error,
  label,
  onChangeText,
  placeholder,
  value,
}: OrdersNumberInputProps) => {
  return (
    <View className="gap-xs">
      <Text className="text-muted-foreground text-sm font-medium">{label}</Text>
      <Input
        accessibilityLabel={label}
        keyboardType="decimal-pad"
        onChangeText={onChangeText}
        placeholder={placeholder}
        value={value}
      />
      <OrdersFieldError message={error} />
    </View>
  )
}
```

Create `src/features/orders/components/OrdersSubmitButton.tsx`:

```tsx
import {Button} from "@/components/ui/button"
import {Text} from "@/components/ui/text"

type OrdersSubmitButtonProps = {
  disabled: boolean
  isPending: boolean
  hasResult: boolean
  onPress: () => void
}

export const OrdersSubmitButton = ({
  disabled,
  hasResult,
  isPending,
  onPress,
}: OrdersSubmitButtonProps) => {
  const label = isPending
    ? "Enviando..."
    : hasResult
      ? "Enviar otra orden"
      : "Enviar orden"

  return (
    <Button
      accessibilityRole="button"
      className="min-h-11"
      disabled={disabled}
      onPress={onPress}
    >
      <Text>{label}</Text>
    </Button>
  )
}
```

Create `src/features/orders/components/OrdersStatusResult.tsx`:

```tsx
import {View} from "react-native"

import {Text} from "@/components/ui/text"
import {cn} from "@/lib/utils"

import {getOrdersStatusLabel} from "../orderFormatters"
import type {CreateOrderResponse} from "../types"

type OrdersStatusResultProps = {
  errorMessage: string | null
  result: CreateOrderResponse | null
}

export const OrdersStatusResult = ({
  errorMessage,
  result,
}: OrdersStatusResultProps) => {
  if (!result && !errorMessage) {
    return null
  }

  if (errorMessage) {
    return (
      <View className="border-destructive/30 bg-card gap-xs p-lg rounded-lg border">
        <Text className="text-destructive text-sm font-semibold">
          No pudimos enviar la orden
        </Text>
        <Text selectable className="text-muted-foreground text-sm leading-5">
          {errorMessage}
        </Text>
      </View>
    )
  }

  if (!result) {
    return null
  }

  return (
    <View className="border-border bg-card gap-sm p-lg rounded-lg border">
      <View className="gap-md flex-row items-center justify-between">
        <Text className="text-muted-foreground text-sm">Estado</Text>
        <View
          className={cn(
            "px-sm py-xs rounded-sm",
            result.status === "FILLED" && "bg-success",
            result.status === "PENDING" && "bg-warning",
            result.status === "REJECTED" && "bg-destructive"
          )}
        >
          <Text
            className={cn(
              "text-xs font-semibold uppercase",
              result.status === "FILLED" && "text-success-foreground",
              result.status === "PENDING" && "text-warning-foreground",
              result.status === "REJECTED" && "text-destructive-foreground"
            )}
          >
            {getOrdersStatusLabel(result.status)}
          </Text>
        </View>
      </View>
      <Text selectable className="text-foreground text-sm">
        Orden #{result.id}
      </Text>
    </View>
  )
}
```

- [ ] **Step 4: Add the ticket sheet container**

Create `src/features/orders/components/OrdersTicketSheet.tsx`:

```tsx
import {useMemo, useState} from "react"
import {View} from "react-native"

import {BottomSheetScrollView} from "@gorhom/bottom-sheet"

import {BottomSheetContainer} from "@/components/modals"
import {Text} from "@/components/ui/text"

import {OrdersInstrumentSummary} from "./OrdersInstrumentSummary"
import {OrdersNumberInput} from "./OrdersNumberInput"
import {OrdersQuantityModeSelector} from "./OrdersQuantityModeSelector"
import {OrdersSideSelector} from "./OrdersSideSelector"
import {OrdersStatusResult} from "./OrdersStatusResult"
import {OrdersSubmitButton} from "./OrdersSubmitButton"
import {OrdersTypeSelector} from "./OrdersTypeSelector"

import {useCreateOrderMutation} from "../hooks/useCreateOrderMutation"
import {formatOrdersPeso, formatOrdersQuantity} from "../orderFormatters"
import {
  DEFAULT_ORDERS_FORM_STATE,
  buildCreateOrderPayload,
  getOrdersComputedQuantity,
} from "../orderValidation"
import type {
  CreateOrderResponse,
  OrdersFieldErrors,
  OrdersFormState,
  OrdersInstrument,
} from "../types"

type OrdersTicketSheetProps = {
  dismiss?: () => Promise<void>
  instrument: OrdersInstrument
}

const getOrdersMutationErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message
  }

  return "Intentá nuevamente en unos segundos."
}

export const OrdersTicketSheet = ({instrument}: OrdersTicketSheetProps) => {
  const [formState, setFormState] = useState<OrdersFormState>(
    DEFAULT_ORDERS_FORM_STATE
  )
  const [fieldErrors, setFieldErrors] = useState<OrdersFieldErrors>({})
  const [result, setResult] = useState<CreateOrderResponse | null>(null)
  const createOrderMutation = useCreateOrderMutation()

  const computedQuantity = useMemo(
    () => getOrdersComputedQuantity({formState, instrument}),
    [formState, instrument]
  )
  const estimatedTotal =
    formState.type === "LIMIT"
      ? Number(formState.limitPriceText.replace(",", ".")) * computedQuantity
      : instrument.lastPrice * computedQuantity

  const updateFormState = (patch: Partial<OrdersFormState>) => {
    setResult(null)
    setFieldErrors({})
    setFormState(current => ({
      ...current,
      ...patch,
    }))
  }

  const handleSubmit = () => {
    const nextPayload = buildCreateOrderPayload({formState, instrument})
    setFieldErrors(nextPayload.fieldErrors)

    if (!nextPayload.payload) {
      return
    }

    createOrderMutation.mutate(nextPayload.payload, {
      onSuccess: response => {
        setResult(response)
      },
    })
  }

  return (
    <BottomSheetContainer expanded insetBottom className="pt-md">
      <BottomSheetScrollView
        contentContainerClassName="gap-lg pb-safe"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-xs">
          <Text className="text-foreground text-xl font-semibold">
            Ticket de orden
          </Text>
          <Text selectable className="text-muted-foreground text-sm leading-5">
            Definí la operación y enviá la orden al mercado.
          </Text>
        </View>

        <OrdersInstrumentSummary instrument={instrument} />

        <OrdersSideSelector
          onChange={side => updateFormState({side})}
          value={formState.side}
        />

        <OrdersTypeSelector
          onChange={type =>
            updateFormState({
              limitPriceText: type === "MARKET" ? "" : formState.limitPriceText,
              type,
            })
          }
          value={formState.type}
        />

        <OrdersQuantityModeSelector
          onChange={quantityMode => updateFormState({quantityMode})}
          value={formState.quantityMode}
        />

        {formState.quantityMode === "SHARES" ? (
          <OrdersNumberInput
            error={fieldErrors.quantityText}
            label="Cantidad de acciones"
            onChangeText={quantityText => updateFormState({quantityText})}
            placeholder="123"
            value={formState.quantityText}
          />
        ) : (
          <OrdersNumberInput
            error={fieldErrors.amountText}
            label="Monto en pesos"
            onChangeText={amountText => updateFormState({amountText})}
            placeholder="10000"
            value={formState.amountText}
          />
        )}

        {formState.type === "LIMIT" ? (
          <OrdersNumberInput
            error={fieldErrors.limitPriceText}
            label="Precio límite"
            onChangeText={limitPriceText => updateFormState({limitPriceText})}
            placeholder="84,50"
            value={formState.limitPriceText}
          />
        ) : null}

        <View className="border-border bg-card gap-xs p-lg rounded-lg border">
          <Text className="text-muted-foreground text-sm">
            Acciones a enviar
          </Text>
          <Text selectable className="text-foreground text-lg font-semibold">
            {formatOrdersQuantity(computedQuantity)}
          </Text>
          {computedQuantity > 0 && Number.isFinite(estimatedTotal) ? (
            <Text selectable className="text-muted-foreground text-sm">
              Estimado {formatOrdersPeso(estimatedTotal)}
            </Text>
          ) : null}
        </View>

        <OrdersStatusResult
          errorMessage={
            createOrderMutation.isError
              ? getOrdersMutationErrorMessage(createOrderMutation.error)
              : null
          }
          result={result}
        />

        <OrdersSubmitButton
          disabled={createOrderMutation.isPending}
          hasResult={Boolean(result)}
          isPending={createOrderMutation.isPending}
          onPress={handleSubmit}
        />
      </BottomSheetScrollView>
    </BottomSheetContainer>
  )
}
```

- [ ] **Step 5: Run typecheck and fix any import-order issues reported by ESLint**

Run:

```bash
bunx tsc --noEmit
bun run lint
```

Expected: PASS. If `BottomSheetScrollView` does not accept `contentContainerClassName`, replace it with `contentContainerStyle` only if lint permits, or wrap sheet content with a `View className="gap-lg pb-safe"` inside the scroll view.

- [ ] **Step 6: Commit**

```bash
git add src/features/orders/components
git commit -m "feat: add order ticket sheet"
```

## Task 5: Wire Markets And Search To Orders

**Files:**

- Modify: `src/hooks/useModal.ts`
- Modify: `src/features/markets/components/MarketsScreen.tsx`
- Modify: `src/features/search/components/SearchScreen.tsx`

- [ ] **Step 1: Allow per-open modal props**

Replace `src/hooks/useModal.ts` with:

```ts
import {type ComponentType} from "react"

import {useModalContext} from "@/components/modals/ModalContext"

export const useModal = <T extends object>(
  Component: ComponentType<T>,
  propsOrFactory?: ((dismiss: () => Promise<void>) => T) | Partial<T>
) => {
  const {showModal} = useModalContext()

  return (overrideProps?: Partial<T>) => {
    showModal(Component, dismiss => {
      const baseProps =
        typeof propsOrFactory === "function"
          ? propsOrFactory(dismiss)
          : ({
              ...(propsOrFactory ?? {}),
              dismiss,
            } as T)

      return {
        ...baseProps,
        ...(overrideProps ?? {}),
      }
    })
  }
}
```

- [ ] **Step 2: Replace the Markets alert placeholder**

In `src/features/markets/components/MarketsScreen.tsx`:

Remove:

```tsx
import {Alert as NativeAlert} from "react-native"
```

Add:

```tsx
import {useModal} from "@/hooks/useModal"
import {OrdersTicketSheet} from "@/features/orders/components/OrdersTicketSheet"
import {toOrdersInstrument} from "@/features/orders/orderValidation"
```

Inside `MarketsScreen`, before `handleInstrumentPress`, add:

```tsx
const showOrdersTicket = useModal(OrdersTicketSheet)

const handleInstrumentPress = (instrument: MarketsInstrument) => {
  showOrdersTicket({
    instrument: toOrdersInstrument(instrument),
  })
}
```

- [ ] **Step 3: Replace the Search alert placeholder**

In `src/features/search/components/SearchScreen.tsx`:

Remove:

```tsx
import {Alert as NativeAlert} from "react-native"
```

Add:

```tsx
import {useModal} from "@/hooks/useModal"
import {OrdersTicketSheet} from "@/features/orders/components/OrdersTicketSheet"
import {toOrdersInstrument} from "@/features/orders/orderValidation"
```

Inside `SearchScreen`, before `handleResultPress`, add:

```tsx
const showOrdersTicket = useModal(OrdersTicketSheet)
```

Replace `handleResultPress` with:

```tsx
const handleResultPress = (result: SearchResult) => {
  showOrdersTicket({
    instrument: toOrdersInstrument(result),
  })
}
```

- [ ] **Step 4: Run typecheck**

Run:

```bash
bunx tsc --noEmit
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/markets/components/MarketsScreen.tsx src/features/search/components/SearchScreen.tsx src/hooks/useModal.ts src/features/orders/components/OrdersTicketSheet.tsx
git commit -m "feat: open order ticket from instruments"
```

## Task 6: Formatting, Static Verification, And Unit Verification

**Files:**

- Verify all changed files.

- [ ] **Step 1: Run the shared formatter**

Run:

```bash
node scripts/format-after-edit.mjs
```

Expected: command completes and formats only edited files.

- [ ] **Step 2: Run formatting check**

Run:

```bash
bun run format:check
```

Expected: PASS.

- [ ] **Step 3: Run lint**

Run:

```bash
bun run lint
```

Expected: PASS.

- [ ] **Step 4: Run TypeScript**

Run:

```bash
bunx tsc --noEmit
```

Expected: PASS.

- [ ] **Step 5: Run unit tests**

Run:

```bash
bun test src/features/orders/orderValidation.test.ts src/features/portfolio/portfolioMath.test.ts src/features/search/searchText.test.ts
```

Expected: PASS.

## Task 7: Native UI Verification With Argent

**Files:**

- No planned edits unless verification finds a defect.

- [ ] **Step 1: Start Metro on the required port**

Run:

```bash
bun run start -- --port 8081
```

Expected: Metro starts on `8081`.

- [ ] **Step 2: Use Argent discovery before interaction**

Use the Argent MCP workflow:

```text
describe
debugger-component-tree
screenshot
```

Expected: app is visible and the Markets screen renders.

- [ ] **Step 3: Verify Markets launch path**

Actions:

- Tap one Markets instrument row.
- Confirm the Orders sheet opens.
- Confirm selected ticker/name/price match the tapped row.
- Select BUY, MARKET, shares mode.
- Enter `1`.
- Submit.

Expected:

- Submit shows loading while pending.
- Response area shows returned order id.
- Response status is one of `FILLED` or `REJECTED` for MARKET.
- Sheet remains usable after the response.

- [ ] **Step 4: Verify Search launch path**

Actions:

- Navigate to `/search`.
- Search `DYC`.
- Tap the result row.
- Confirm the Orders sheet opens with `DYCA`.
- Select SELL, LIMIT, ARS mode.
- Enter an ARS amount large enough for at least one share.
- Enter a limit price.
- Submit.

Expected:

- Response area shows returned order id.
- Response status is one of `PENDING` or `REJECTED` for LIMIT.
- Portfolio query invalidation does not crash the app.

- [ ] **Step 5: Verify validation states**

Actions:

- Open a ticket.
- Submit with blank quantity.
- Switch to ARS mode and enter an amount below the last price.
- Switch to LIMIT and leave limit price blank.

Expected:

- Blank quantity shows `Ingresá una cantidad de acciones.`
- Too-small ARS amount shows `El monto no alcanza para comprar una acción.`
- Missing limit price shows `Ingresá un precio límite mayor a cero.`
- No invalid request is sent while these errors are visible.

## Self-Review Checklist

- [x] Spec coverage: `POST /orders`, BUY/SELL, MARKET/LIMIT, shares/ARS quantity, LIMIT-only price, returned id/status, and Portfolio invalidation are all assigned to tasks.
- [x] Placeholder scan: no `TODO`, `TBD`, `implement later`, or unspecified file paths remain.
- [x] Type consistency: `OrdersInstrument`, `OrdersFormState`, `CreateOrderPayload`, and `CreateOrderResponse` names match across tasks.
- [x] Architecture compliance: only `useCreateOrderMutation.ts` imports `useMutation`; route files remain routing-only; Orders components use Orders prefixes.
- [x] Verification coverage: unit, format, lint, typecheck, and Argent native flow checks are included.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-28-orders-feature-implementation.md`. Two execution options:

1. **Subagent-Driven (recommended)** - dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** - execute tasks in this session using `superpowers:executing-plans`, batch execution with checkpoints.
