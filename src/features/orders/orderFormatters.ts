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
