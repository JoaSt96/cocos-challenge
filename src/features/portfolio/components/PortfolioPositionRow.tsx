import {Pressable, View} from "react-native"

import {Text} from "@/components/ui/text"

import {PortfolioReturnBadge} from "./PortfolioReturnBadge"

import {
  formatPortfolioPeso,
  formatPortfolioQuantity,
} from "../portfolioFormatters"
import type {PortfolioPosition} from "../types"

type PortfolioPositionRowProps = {
  position: PortfolioPosition
  onPress: (position: PortfolioPosition) => void
}

export const PortfolioPositionRow = ({
  position,
  onPress,
}: PortfolioPositionRowProps) => {
  const marketValue = formatPortfolioPeso(position.marketValue)
  const gain = formatPortfolioPeso(position.gain)
  const quantity = formatPortfolioQuantity(position.quantity)
  const accessibilityLabel = `${position.ticker}, cantidad ${quantity}, valor de mercado ${marketValue}, ganancia ${gain}`

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      className="border-border bg-card gap-md px-street py-md min-h-[76px] flex-row items-center justify-between border-b active:opacity-70"
      onPress={() => onPress(position)}
    >
      <View className="gap-xs min-w-0 flex-1">
        <Text selectable className="text-foreground text-base font-semibold">
          {position.ticker}
        </Text>
        <Text
          selectable
          className="text-muted-foreground text-sm leading-5"
          numberOfLines={1}
        >
          {quantity} acciones
        </Text>
      </View>

      <View className="gap-xs items-end">
        <Text
          selectable
          className="text-foreground text-base font-semibold"
          style={{fontVariant: ["tabular-nums"]}}
        >
          {marketValue}
        </Text>
        <PortfolioReturnBadge
          direction={position.direction}
          gain={position.gain}
          returnRatio={position.returnRatio}
        />
      </View>
    </Pressable>
  )
}
