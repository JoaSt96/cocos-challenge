import {View} from "react-native"

import {BadgeDollarSign} from "lucide-react-native"

import {Row} from "@/components/Row"
import {Card} from "@/components/ui/card"
import {Icon} from "@/components/ui/icon"
import {Text} from "@/components/ui/text"

import {OrdersInstrumentTickerAvatar} from "./OrdersInstrumentTickerAvatar"

import {formatOrdersPeso} from "../../orderFormatters"
import type {OrdersInstrument} from "../../types"

type OrdersInstrumentSummaryProps = {
  instrument: OrdersInstrument
}

export const OrdersInstrumentSummary = ({
  instrument,
}: OrdersInstrumentSummaryProps) => {
  return (
    <Card className="border-primary/20 bg-card/95 py-4">
      <Row className="gap-md items-center px-5">
        <OrdersInstrumentTickerAvatar ticker={instrument.ticker} />

        <View className="gap-xs min-w-0 flex-1">
          <Text selectable className="text-foreground text-lg font-bold">
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

        <View className="gap-xs items-end">
          <Icon as={BadgeDollarSign} className="text-primary size-4" />
          <Text
            selectable
            className="text-foreground text-lg font-semibold tabular-nums"
            style={{fontVariant: ["tabular-nums"]}}
          >
            {formatOrdersPeso(instrument.lastPrice)}
          </Text>
          <Text
            selectable
            className="text-muted-foreground text-[11px] font-medium uppercase"
          >
            {instrument.type}
          </Text>
        </View>
      </Row>
    </Card>
  )
}
