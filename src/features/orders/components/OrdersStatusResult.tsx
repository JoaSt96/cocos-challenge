import {View} from "react-native"

import {cva} from "class-variance-authority"

import {Text} from "@/components/ui/text"

import {getOrdersStatusLabel} from "../orderFormatters"
import type {CreateOrderResponse, OrderStatus} from "../types"

type OrdersStatusResultProps = {
  errorMessage: string | null
  result: CreateOrderResponse | null
}

const ordersStatusBadgeVariants = cva("rounded-sm px-sm py-xs", {
  variants: {
    status: {
      FILLED: "bg-success",
      PENDING: "bg-warning",
      REJECTED: "bg-destructive",
    },
  },
})

const ordersStatusTextVariants = cva("text-xs font-semibold uppercase", {
  variants: {
    status: {
      FILLED: "text-success-foreground",
      PENDING: "text-warning-foreground",
      REJECTED: "text-destructive-foreground",
    },
  },
})

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

  const status: OrderStatus = result.status

  return (
    <View className="border-border bg-card gap-sm p-lg rounded-lg border">
      <View className="gap-md flex-row items-center justify-between">
        <Text className="text-muted-foreground text-sm">Estado</Text>
        <View className={ordersStatusBadgeVariants({status})}>
          <Text className={ordersStatusTextVariants({status})}>
            {getOrdersStatusLabel(status)}
          </Text>
        </View>
      </View>

      <Text selectable className="text-foreground text-sm">
        Orden #{result.id}
      </Text>
    </View>
  )
}
