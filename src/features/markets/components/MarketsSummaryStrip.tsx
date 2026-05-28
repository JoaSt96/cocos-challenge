import {View} from "react-native"

import {Text} from "@/components/ui/text"

import type {MarketsSummary} from "../types"

type MarketsSummaryStripProps = {
  summary: MarketsSummary
}

export const MarketsSummaryStrip = ({summary}: MarketsSummaryStripProps) => {
  return (
    <View className="gap-sm px-street pb-md">
      <View className="border-border bg-card flex-row rounded-lg border">
        <View className="border-border gap-xs p-md flex-1 border-r">
          <Text className="text-muted-foreground text-xs font-medium">
            Total
          </Text>
          <Text selectable className="text-foreground text-xl font-bold">
            {summary.total}
          </Text>
        </View>

        <View className="border-border gap-xs p-md flex-1 border-r">
          <Text className="text-muted-foreground text-xs font-medium">
            Suben
          </Text>
          <Text selectable className="text-profit text-xl font-bold">
            {summary.up}
          </Text>
        </View>

        <View className="gap-xs p-md flex-1">
          <Text className="text-muted-foreground text-xs font-medium">
            Bajan
          </Text>
          <Text selectable className="text-loss text-xl font-bold">
            {summary.down}
          </Text>
        </View>
      </View>
    </View>
  )
}
