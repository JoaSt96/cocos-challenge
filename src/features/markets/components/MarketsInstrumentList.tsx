import {View} from "react-native"

import {FlashList} from "@shopify/flash-list"

import {Text} from "@/components/ui/text"

import {MarketsEmptyState} from "./MarketsEmptyState"
import {MarketsInstrumentRow} from "./MarketsInstrumentRow"
import {MarketsSummaryStrip} from "./MarketsSummaryStrip"

import type {MarketsInstrument} from "../types"

type MarketsInstrumentListProps = {
  instruments: MarketsInstrument[]
  onInstrumentPress: (instrument: MarketsInstrument) => void
  onRefresh: () => void
  refreshing: boolean
  summary: {
    down: number
    total: number
    up: number
  }
}

const MarketsInstrumentListSeparator = () => {
  return <View className="bg-border h-px" />
}

const MarketsInstrumentListHeader = ({
  summary,
}: Pick<MarketsInstrumentListProps, "summary">) => {
  return (
    <View className="gap-lg pt-md">
      <View className="gap-xs px-street">
        <Text selectable className="text-muted-foreground text-base">
          Acciones argentinas en pesos
        </Text>
      </View>
      <MarketsSummaryStrip summary={summary} />
    </View>
  )
}

export const MarketsInstrumentList = ({
  instruments,
  onInstrumentPress,
  onRefresh,
  refreshing,
  summary,
}: MarketsInstrumentListProps) => {
  return (
    <FlashList
      contentInsetAdjustmentBehavior="automatic"
      contentContainerClassName="pb-safe"
      data={instruments}
      ListEmptyComponent={<MarketsEmptyState />}
      ItemSeparatorComponent={MarketsInstrumentListSeparator}
      keyExtractor={instrument => `${instrument.id}`}
      ListHeaderComponent={<MarketsInstrumentListHeader summary={summary} />}
      onRefresh={onRefresh}
      refreshing={refreshing}
      renderItem={({item}) => (
        <MarketsInstrumentRow instrument={item} onPress={onInstrumentPress} />
      )}
      showsVerticalScrollIndicator={false}
    />
  )
}
