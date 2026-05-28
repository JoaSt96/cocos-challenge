import {View} from "react-native"

import {Text} from "@/components/ui/text"
import {cn} from "@/lib/utils"

import {
  formatPortfolioPercent,
  formatPortfolioPeso,
} from "../portfolioFormatters"
import type {PortfolioSummary} from "../types"

type PortfolioSummaryCardProps = {
  summary: PortfolioSummary
}

export const PortfolioSummaryCard = ({summary}: PortfolioSummaryCardProps) => {
  const performanceClassName =
    summary.totalGain > 0
      ? "text-profit"
      : summary.totalGain < 0
        ? "text-loss"
        : "text-muted-foreground"

  return (
    <View className="mx-street border-border bg-card p-lg rounded-lg border">
      <View className="gap-xs">
        <Text className="text-muted-foreground text-xs font-medium">
          Valor total
        </Text>
        <Text
          selectable
          className="text-foreground text-3xl font-bold"
          style={{fontVariant: ["tabular-nums"]}}
        >
          {formatPortfolioPeso(summary.totalMarketValue)}
        </Text>
      </View>

      <View className="mt-lg gap-sm flex-row">
        <View className="border-border pr-md flex-1 border-r">
          <Text className="text-muted-foreground text-xs font-medium">
            Ganancia
          </Text>
          <Text
            selectable
            className={cn("mt-xs text-lg font-semibold", performanceClassName)}
            style={{fontVariant: ["tabular-nums"]}}
          >
            {formatPortfolioPeso(summary.totalGain)}
          </Text>
        </View>

        <View className="border-border px-md flex-1 border-r">
          <Text className="text-muted-foreground text-xs font-medium">
            Retorno
          </Text>
          <Text
            selectable
            className={cn("mt-xs text-lg font-semibold", performanceClassName)}
            style={{fontVariant: ["tabular-nums"]}}
          >
            {formatPortfolioPercent(summary.totalReturnRatio)}
          </Text>
        </View>

        <View className="pl-md flex-1">
          <Text className="text-muted-foreground text-xs font-medium">
            Posiciones
          </Text>
          <Text
            selectable
            className="text-foreground mt-xs text-lg font-semibold"
          >
            {summary.positions}
          </Text>
        </View>
      </View>

      <Text
        selectable
        className="text-muted-foreground mt-md text-xs leading-4"
        style={{fontVariant: ["tabular-nums"]}}
      >
        Costo invertido: {formatPortfolioPeso(summary.totalCostBasis)}
      </Text>
    </View>
  )
}
