import {Pressable, View} from "react-native"

import {cva} from "class-variance-authority"

import {Text} from "@/components/ui/text"

import type {OrderSide} from "../types"

type OrdersSideSelectorProps = {
  value: OrderSide
  onChange: (value: OrderSide) => void
}

type OrdersSideSegmentTone = "default" | "buy" | "sell"

const ordersSideSegmentVariants = cva(
  "min-h-10 flex-1 items-center justify-center rounded-sm px-md",
  {
    variants: {
      tone: {
        buy: "bg-primary",
        default: "",
        sell: "bg-destructive",
      },
    },
    defaultVariants: {
      tone: "default",
    },
  }
)

const ordersSideTextVariants = cva("text-sm font-semibold", {
  variants: {
    selected: {
      false: "text-muted-foreground",
      true: "text-primary-foreground",
    },
  },
  defaultVariants: {
    selected: false,
  },
})

const ORDER_SIDE_OPTIONS: {label: string; value: OrderSide}[] = [
  {label: "Comprar", value: "BUY"},
  {label: "Vender", value: "SELL"},
]

const getOrdersSideSegmentTone = (
  selected: boolean,
  value: OrderSide
): OrdersSideSegmentTone => {
  if (!selected) {
    return "default"
  }

  return value === "BUY" ? "buy" : "sell"
}

export const OrdersSideSelector = ({
  onChange,
  value,
}: OrdersSideSelectorProps) => {
  return (
    <View className="gap-xs">
      <Text className="text-muted-foreground text-sm font-medium">Lado</Text>
      <View className="bg-muted p-xs flex-row rounded-md">
        {ORDER_SIDE_OPTIONS.map(option => {
          const selected = option.value === value
          const tone = getOrdersSideSegmentTone(selected, option.value)

          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{selected}}
              className={ordersSideSegmentVariants({tone})}
              key={option.value}
              onPress={() => onChange(option.value)}
            >
              <Text className={ordersSideTextVariants({selected})}>
                {option.label}
              </Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}
