import {View} from "react-native"

import {Text} from "@/components/ui/text"
import {cn} from "@/lib/utils"

import {
  formatPortfolioPercent,
  formatPortfolioPeso,
} from "../portfolioFormatters"
import type {PortfolioPositionDirection} from "../types"

type PortfolioReturnBadgeProps = {
  direction: PortfolioPositionDirection
  gain: number
  returnRatio: number
}

export const PortfolioReturnBadge = ({
  direction,
  gain,
  returnRatio,
}: PortfolioReturnBadgeProps) => {
  const valueClassName =
    direction === "up"
      ? "text-profit"
      : direction === "down"
        ? "text-loss"
        : "text-muted-foreground"

  return (
    <View className="gap-xs items-end">
      <Text
        selectable
        className={cn("text-sm font-semibold", valueClassName)}
        style={{fontVariant: ["tabular-nums"]}}
      >
        {formatPortfolioPeso(gain)}
      </Text>
      <Text
        selectable
        className={cn("text-xs font-medium", valueClassName)}
        style={{fontVariant: ["tabular-nums"]}}
      >
        {formatPortfolioPercent(returnRatio)}
      </Text>
    </View>
  )
}
