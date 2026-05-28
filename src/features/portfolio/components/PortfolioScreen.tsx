import {Alert as NativeAlert} from "react-native"

import {StatusBar} from "expo-status-bar"

import {Container} from "@/components/Container"

import {PortfolioErrorState} from "./PortfolioErrorState"
import {PortfolioLoadingState} from "./PortfolioLoadingState"
import {PortfolioPositionList} from "./PortfolioPositionList"

import {usePortfolioPositionsQuery} from "../hooks/usePortfolioPositionsQuery"
import {getPortfolioSummary} from "../portfolioMath"
import type {PortfolioPosition} from "../types"

const getPortfolioErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message
  }

  return "Intenta nuevamente en unos segundos."
}

export const PortfolioScreen = () => {
  const positionsQuery = usePortfolioPositionsQuery()
  const summary = getPortfolioSummary(positionsQuery.data ?? [])

  const handlePositionPress = (position: PortfolioPosition) => {
    NativeAlert.alert(
      position.ticker,
      "El detalle de posicion se puede ampliar en una feature futura."
    )
  }

  const handleRefresh = () => {
    void positionsQuery.refetch()
  }

  if (positionsQuery.isPending) {
    return (
      <>
        <StatusBar style="auto" />
        <PortfolioLoadingState />
      </>
    )
  }

  if (positionsQuery.isError) {
    return (
      <PortfolioErrorState
        message={getPortfolioErrorMessage(positionsQuery.error)}
        onRetry={handleRefresh}
      />
    )
  }

  return (
    <Container expanded>
      <StatusBar style="auto" />

      <PortfolioPositionList
        onPositionPress={handlePositionPress}
        onRefresh={handleRefresh}
        positions={positionsQuery.data}
        refreshing={positionsQuery.isRefetching}
        summary={summary}
      />
    </Container>
  )
}
