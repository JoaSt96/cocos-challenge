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
