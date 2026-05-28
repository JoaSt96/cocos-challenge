import {z} from "zod"

import {api} from "@/config/api.config"

import type {CreateOrderPayload, CreateOrderResponse} from "../types"

const createOrderBasePayloadSchema = z.object({
  instrument_id: z.number().int().positive(),
  quantity: z.number().int().positive(),
  side: z.enum(["BUY", "SELL"]),
})

const createOrderPayloadSchema = z.discriminatedUnion("type", [
  createOrderBasePayloadSchema
    .extend({
      type: z.literal("MARKET"),
    })
    .strict(),
  createOrderBasePayloadSchema
    .extend({
      price: z.number().positive(),
      type: z.literal("LIMIT"),
    })
    .strict(),
])

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
