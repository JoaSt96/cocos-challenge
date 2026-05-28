import {Pressable, View} from "react-native"

import {cva} from "class-variance-authority"

import {Text} from "@/components/ui/text"

import type {OrderType} from "../types"

type OrdersTypeSelectorProps = {
  disabled?: boolean
  value: OrderType
  onChange: (value: OrderType) => void
}

const ordersTypeSegmentVariants = cva(
  "min-h-11 flex-1 items-center justify-center rounded-sm px-md",
  {
    variants: {
      selected: {
        false: "",
        true: "bg-card",
      },
    },
    defaultVariants: {
      selected: false,
    },
  }
)

const ordersTypeTextVariants = cva("text-sm font-semibold", {
  variants: {
    selected: {
      false: "text-muted-foreground",
      true: "text-foreground",
    },
  },
  defaultVariants: {
    selected: false,
  },
})

const ORDER_TYPE_OPTIONS: {label: string; value: OrderType}[] = [
  {label: "Market", value: "MARKET"},
  {label: "Limit", value: "LIMIT"},
]

export const OrdersTypeSelector = ({
  disabled = false,
  onChange,
  value,
}: OrdersTypeSelectorProps) => {
  return (
    <View className="gap-xs">
      <Text className="text-muted-foreground text-sm font-medium">Tipo</Text>
      <View className="bg-muted p-xs flex-row rounded-md">
        {ORDER_TYPE_OPTIONS.map(option => {
          const selected = option.value === value

          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{disabled, selected}}
              className={ordersTypeSegmentVariants({selected})}
              disabled={disabled}
              key={option.value}
              onPress={() => onChange(option.value)}
            >
              <Text className={ordersTypeTextVariants({selected})}>
                {option.label}
              </Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}
