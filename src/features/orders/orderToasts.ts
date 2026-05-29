import {toast} from "sonner-native"

import type {CreateOrderResponse} from "./types"

const ORDERS_CREATE_ORDER_TOAST_ID = "orders-create-order-result"
const ORDERS_TOAST_DURATION_MS = 6000
const ORDERS_ERROR_FALLBACK_MESSAGE = "Intentá nuevamente en unos segundos."

type OrdersCreateOrderToastType = "error" | "success"

type OrdersCreateOrderToast = {
  description: string
  title: string
  type: OrdersCreateOrderToastType
}

export const getOrdersCreateOrderResultToast = (
  result: CreateOrderResponse
): OrdersCreateOrderToast => {
  if (result.status === "FILLED") {
    return {
      description: `Orden #${result.id}`,
      title: "Orden ejecutada",
      type: "success",
    }
  }

  if (result.status === "PENDING") {
    return {
      description: `Orden #${result.id} pendiente`,
      title: "Orden enviada",
      type: "success",
    }
  }

  return {
    description: `Orden #${result.id}`,
    title: "Orden rechazada",
    type: "error",
  }
}

export const getOrdersCreateOrderErrorToast = (
  error: unknown
): OrdersCreateOrderToast => ({
  description:
    error instanceof Error && error.message.trim().length > 0
      ? error.message
      : ORDERS_ERROR_FALLBACK_MESSAGE,
  title: "No pudimos enviar la orden",
  type: "error",
})

const showOrdersCreateOrderToast = ({
  description,
  title,
  type,
}: OrdersCreateOrderToast) => {
  const options = {
    description,
    duration: ORDERS_TOAST_DURATION_MS,
    id: ORDERS_CREATE_ORDER_TOAST_ID,
    important: true,
  }

  if (type === "success") {
    toast.success(title, options)
    return
  }

  toast.error(title, options)
}

export const showOrdersCreateOrderResultToast = (
  result: CreateOrderResponse
) => {
  showOrdersCreateOrderToast(getOrdersCreateOrderResultToast(result))
}

export const showOrdersCreateOrderErrorToast = (error: unknown) => {
  showOrdersCreateOrderToast(getOrdersCreateOrderErrorToast(error))
}
