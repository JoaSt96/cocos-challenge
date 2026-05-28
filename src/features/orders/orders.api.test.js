const {beforeAll, beforeEach, describe, expect, it, mock} = require("bun:test")

const post = mock(async () => ({
  data: {
    id: 123,
    status: "PENDING",
  },
}))

mock.module("@/config/api.config", () => ({
  api: {
    post,
  },
}))

let createOrder

describe("orders api", () => {
  beforeAll(async () => {
    createOrder = require("./api/orders.api").createOrder
  })

  beforeEach(() => {
    post.mockClear()
  })

  it("posts a valid market order without price", async () => {
    await expect(
      createOrder({
        instrument_id: 42,
        quantity: 10,
        side: "BUY",
        type: "MARKET",
      })
    ).resolves.toEqual({
      id: "123",
      status: "PENDING",
    })

    expect(post).toHaveBeenCalledWith("/orders", {
      instrument_id: 42,
      quantity: 10,
      side: "BUY",
      type: "MARKET",
    })
  })

  it("rejects invalid order requests before posting", async () => {
    const invalidPayloads = [
      {
        instrument_id: -1,
        quantity: 10,
        side: "BUY",
        type: "MARKET",
      },
      {
        instrument_id: 1.5,
        quantity: 10,
        side: "BUY",
        type: "MARKET",
      },
      {
        instrument_id: 42,
        price: 0,
        quantity: 10,
        side: "BUY",
        type: "LIMIT",
      },
      {
        instrument_id: 42,
        price: -1,
        quantity: 10,
        side: "BUY",
        type: "LIMIT",
      },
      {
        instrument_id: 42,
        quantity: 10,
        side: "BUY",
        type: "LIMIT",
      },
      {
        instrument_id: 42,
        quantity: 0,
        side: "BUY",
        type: "MARKET",
      },
      {
        instrument_id: 42,
        price: 100,
        quantity: 10,
        side: "BUY",
        type: "MARKET",
      },
      {
        instrument_id: 42,
        price: undefined,
        quantity: 10,
        side: "BUY",
        type: "MARKET",
      },
    ]

    for (const payload of invalidPayloads) {
      await expect(createOrder(payload)).rejects.toThrow(
        "Invalid order request"
      )
    }

    expect(post).not.toHaveBeenCalled()
  })
})
