import {View} from "react-native"

import {FlashList} from "@shopify/flash-list"

import {Text} from "@/components/ui/text"

import {PortfolioEmptyState} from "./PortfolioEmptyState"
import {PortfolioPositionRow} from "./PortfolioPositionRow"
import {PortfolioSummaryCard} from "./PortfolioSummaryCard"

import type {PortfolioPosition, PortfolioSummary} from "../types"

type PortfolioPositionListProps = {
  onPositionPress: (position: PortfolioPosition) => void
  onRefresh: () => void
  positions: PortfolioPosition[]
  refreshing: boolean
  summary: PortfolioSummary
}

const PortfolioPositionListSeparator = () => {
  return <View className="bg-border h-px" />
}

const PortfolioPositionListHeader = ({
  summary,
}: Pick<PortfolioPositionListProps, "summary">) => {
  return (
    <View className="gap-lg pt-md">
      <View className="gap-xs px-street">
        <Text selectable className="text-muted-foreground text-base">
          Tenencias valorizadas en pesos
        </Text>
      </View>
      <PortfolioSummaryCard summary={summary} />
    </View>
  )
}

export const PortfolioPositionList = ({
  onPositionPress,
  onRefresh,
  positions,
  refreshing,
  summary,
}: PortfolioPositionListProps) => {
  return (
    <FlashList
      contentInsetAdjustmentBehavior="automatic"
      contentContainerClassName="pb-safe"
      data={positions}
      ItemSeparatorComponent={PortfolioPositionListSeparator}
      keyExtractor={position => position.positionId}
      ListEmptyComponent={<PortfolioEmptyState />}
      ListHeaderComponent={<PortfolioPositionListHeader summary={summary} />}
      onRefresh={onRefresh}
      refreshing={refreshing}
      renderItem={({item}) => (
        <PortfolioPositionRow onPress={onPositionPress} position={item} />
      )}
      showsVerticalScrollIndicator={false}
    />
  )
}
