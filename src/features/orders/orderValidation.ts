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
