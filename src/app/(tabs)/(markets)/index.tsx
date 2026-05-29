import {StatusBar} from "expo-status-bar"

import {MarketsInstrumentList} from "@/features/markets/components/instrument-list/MarketsInstrumentList"
import {MarketsErrorState} from "@/features/markets/components/states/MarketsErrorState"
import {MarketsLoadingState} from "@/features/markets/components/states/MarketsLoadingState"
import {useMarketsInstrumentsQuery} from "@/features/markets/hooks/useMarketsInstrumentsQuery"
import {getMarketsSummary} from "@/features/markets/marketMath"
import type {MarketsInstrument} from "@/features/markets/types"
import {OrdersTicketSheet} from "@/features/orders/components/ticket/OrdersTicketSheet"
import {toOrdersInstrument} from "@/features/orders/orderValidation"
import {useModal} from "@/hooks/useModal"

const getMarketsErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message
  }

  return "Intentá nuevamente en unos segundos."
}

export default function MarketsRoute() {
  const instrumentsQuery = useMarketsInstrumentsQuery()
  const showOrdersTicket = useModal(OrdersTicketSheet)
  const summary = getMarketsSummary(instrumentsQuery.data ?? [])

  const handleInstrumentPress = (instrument: MarketsInstrument) => {
    showOrdersTicket({
      instrument: toOrdersInstrument(instrument),
    })
  }

  const handleRefresh = () => {
    void instrumentsQuery.refetch()
  }

  if (instrumentsQuery.isPending) {
    return (
      <>
        <StatusBar style="light" />
        <MarketsLoadingState />
      </>
    )
  }

  if (instrumentsQuery.isError) {
    return (
      <MarketsErrorState
        message={getMarketsErrorMessage(instrumentsQuery.error)}
        onRetry={handleRefresh}
      />
    )
  }

  return (
    <>
      <StatusBar style="light" />

      <MarketsInstrumentList
        instruments={instrumentsQuery.data}
        onInstrumentPress={handleInstrumentPress}
        onRefresh={handleRefresh}
        refreshing={instrumentsQuery.isRefetching}
        summary={summary}
      />
    </>
  )
}
