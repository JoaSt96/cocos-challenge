import {View} from "react-native"

import {cva, type VariantProps} from "class-variance-authority"
import {Minus, TrendingDown, TrendingUp} from "lucide-react-native"

import {Row} from "@/components/Row"
import {Icon} from "@/components/ui/icon"
import {Text} from "@/components/ui/text"
import {cn} from "@/lib/utils"

import {
  formatPortfolioPercent,
  formatPortfolioSignedPeso,
} from "../../portfolioFormatters"
import type {PortfolioPositionDirection} from "../../types"

const portfolioReturnBadgeVariants = cva(
  "min-w-[112px] rounded-lg border px-sm py-xs items-end gap-xs",
  {
    variants: {
      direction: {
        down: "border-destructive/25 bg-destructive/15",
        flat: "border-border bg-muted/40",
        up: "border-success/25 bg-success/15",
      },
    },
    defaultVariants: {
      direction: "flat",
    },
  }
)

const portfolioReturnTextVariants = cva("font-semibold tabular-nums", {
  variants: {
    direction: {
      down: "text-loss",
      flat: "text-muted-foreground",
      up: "text-profit",
    },
    size: {
      gain: "text-sm leading-5",
      ratio: "text-xs leading-4",
    },
  },
  defaultVariants: {
    direction: "flat",
    size: "gain",
  },
})

const portfolioReturnIconVariants = cva("size-3.5", {
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

type PortfolioReturnBadgeProps = {
  direction: PortfolioPositionDirection
  gain: number
  returnRatio: number
} & VariantProps<typeof portfolioReturnBadgeVariants>

export const PortfolioReturnBadge = ({
  direction,
  gain,
  returnRatio,
}: PortfolioReturnBadgeProps) => {
  const DirectionIcon =
    direction === "up"
      ? TrendingUp
      : direction === "down"
        ? TrendingDown
        : Minus

  return (
    <View className={portfolioReturnBadgeVariants({direction})}>
      <Row className="gap-xs items-center">
        <Icon
          accessibilityElementsHidden
          as={DirectionIcon}
          className={cn(portfolioReturnIconVariants({direction}))}
        />
        <Text
          selectable
          className={cn(portfolioReturnTextVariants({direction, size: "gain"}))}
          style={{fontVariant: ["tabular-nums"]}}
        >
          {formatPortfolioSignedPeso(gain)}
        </Text>
      </Row>
      <Text
        selectable
        className={cn(portfolioReturnTextVariants({direction, size: "ratio"}))}
        style={{fontVariant: ["tabular-nums"]}}
      >
        {formatPortfolioPercent(returnRatio)}
      </Text>
    </View>
  )
}
