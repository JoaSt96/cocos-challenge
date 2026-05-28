import {View} from "react-native"

import {Text} from "@/components/ui/text"

import {formatOrdersPeso} from "../orderFormatters"
import type {OrdersInstrument} from "../types"

type OrdersInstrumentSummaryProps = {
  instrument: OrdersInstrument
}

export const OrdersInstrumentSummary = ({
  instrument,
}: OrdersInstrumentSummaryProps) => {
  return (
    <View className="border-border bg-card gap-xs p-lg rounded-lg border">
      <View className="gap-md flex-row items-start justify-between">
        <View className="min-w-0 flex-1">
          <Text selectable className="text-foreground text-xl font-semibold">
            {instrument.ticker}
          </Text>
          <Text
            selectable
            className="text-muted-foreground text-sm leading-5"
            numberOfLines={2}
          >
            {instrument.name}
          </Text>
        </View>

        <View className="items-end">
          <Text selectable className="text-foreground text-base font-semibold">
            {formatOrdersPeso(instrument.lastPrice)}
          </Text>
          <Text selectable className="text-muted-foreground text-xs uppercase">
            {instrument.type}
          </Text>
        </View>
      </View>
    </View>
  )
}
