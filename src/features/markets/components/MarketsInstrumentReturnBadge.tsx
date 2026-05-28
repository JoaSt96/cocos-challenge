import {View} from "react-native"

import {cva, type VariantProps} from "class-variance-authority"

import {Text} from "@/components/ui/text"
import {cn} from "@/lib/utils"

import {formatMarketsPercent} from "../marketFormatters"

const marketsInstrumentReturnBadgeVariants = cva(
  "rounded-md px-sm py-xs self-end",
  {
    variants: {
      direction: {
        down: "bg-destructive/10",
        flat: "bg-muted",
        up: "bg-success/10",
      },
    },
    defaultVariants: {
      direction: "flat",
    },
  }
)

const marketsInstrumentReturnTextVariants = cva("text-xs font-semibold", {
  variants: {
    direction: {
      down: "text-loss",
      flat: "text-muted-foreground",
      up: "text-profit",
    },
  },
  defaultVariants: {
    direction: "flat",
  },
})

type MarketsInstrumentReturnBadgeProps = {
  value: number
} & VariantProps<typeof marketsInstrumentReturnBadgeVariants>

export const MarketsInstrumentReturnBadge = ({
  direction,
  value,
}: MarketsInstrumentReturnBadgeProps) => {
  return (
    <View className={marketsInstrumentReturnBadgeVariants({direction})}>
      <Text
        selectable
        className={cn(marketsInstrumentReturnTextVariants({direction}))}
      >
        {formatMarketsPercent(value)}
      </Text>
    </View>
  )
}
