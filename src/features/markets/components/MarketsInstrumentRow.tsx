import {Pressable, View} from "react-native"

import {Text} from "@/components/ui/text"

import {MarketsInstrumentReturnBadge} from "./MarketsInstrumentReturnBadge"

import {formatMarketsPeso} from "../marketFormatters"
import type {MarketsInstrument} from "../types"

type MarketsInstrumentRowProps = {
  instrument: MarketsInstrument
  onPress: (instrument: MarketsInstrument) => void
}

export const MarketsInstrumentRow = ({
  instrument,
  onPress,
}: MarketsInstrumentRowProps) => {
  const price = formatMarketsPeso(instrument.lastPrice)
  const accessibilityLabel = `${instrument.ticker}, ${instrument.name}, ultimo precio ${price}, retorno diario ${instrument.dailyReturnPercent.toFixed(2)} por ciento`

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      className="border-border bg-card gap-md px-street py-md min-h-[72px] flex-row items-center justify-between border-b active:opacity-70"
      onPress={() => onPress(instrument)}
    >
      <View className="gap-xs min-w-0 flex-1">
        <Text selectable className="text-foreground text-base font-semibold">
          {instrument.ticker}
        </Text>
        <Text
          selectable
          className="text-muted-foreground text-sm leading-5"
          numberOfLines={1}
        >
          {instrument.name}
        </Text>
      </View>

      <View className="gap-xs items-end">
        <Text selectable className="text-foreground text-base font-semibold">
          {price}
        </Text>
        <MarketsInstrumentReturnBadge
          direction={instrument.direction}
          value={instrument.dailyReturnPercent}
        />
      </View>
    </Pressable>
  )
}
