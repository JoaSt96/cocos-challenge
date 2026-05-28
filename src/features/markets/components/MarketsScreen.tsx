import {StatusBar} from "expo-status-bar"

import {Container} from "@/components/Container"
import {OrdersTicketSheet} from "@/features/orders/components/OrdersTicketSheet"
import {toOrdersInstrument} from "@/features/orders/orderValidation"
import {useModal} from "@/hooks/useModal"

import {MarketsErrorState} from "./MarketsErrorState"
import {MarketsInstrumentList} from "./MarketsInstrumentList"
import {MarketsLoadingState} from "./MarketsLoadingState"

import {useMarketsInstrumentsQuery} from "../hooks/useMarketsInstrumentsQuery"
import {getMarketsSummary} from "../marketMath"
import type {MarketsInstrument} from "../types"

const getMarketsErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message
  }

  return "Intentá nuevamente en unos segundos."
}

export const MarketsScreen = () => {
  const instrumentsQuery = useMarketsInstrumentsQuery()
  const summary = getMarketsSummary(instrumentsQuery.data ?? [])
  const showOrdersTicket = useModal(OrdersTicketSheet)

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
        <StatusBar style="auto" />
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
    <Container expanded>
      <StatusBar style="auto" />

      <MarketsInstrumentList
        instruments={instrumentsQuery.data}
        onInstrumentPress={handleInstrumentPress}
        onRefresh={handleRefresh}
        refreshing={instrumentsQuery.isRefetching}
        summary={summary}
      />
    </Container>
  )
}
