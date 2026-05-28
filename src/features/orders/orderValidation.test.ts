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
