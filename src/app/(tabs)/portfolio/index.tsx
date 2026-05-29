import {useQueryClient} from "@tanstack/react-query"
import {type Href, useRouter} from "expo-router"
import {StatusBar} from "expo-status-bar"

import {PortfolioPositionList} from "@/features/portfolio/components/position-list/PortfolioPositionList"
import {PortfolioErrorState} from "@/features/portfolio/components/states/PortfolioErrorState"
import {PortfolioLoadingState} from "@/features/portfolio/components/states/PortfolioLoadingState"
import {usePortfolioPositionsQuery} from "@/features/portfolio/hooks/usePortfolioPositionsQuery"
import {getPortfolioSummary} from "@/features/portfolio/portfolioMath"
import {portfolioQueries} from "@/features/portfolio/queries/portfolioQueries"
import type {PortfolioPosition} from "@/features/portfolio/types"

const getPortfolioErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message
  }

  return "Intentá nuevamente en unos segundos."
}

export default function PortfolioRoute() {
  const router = useRouter()
  const positionsQuery = usePortfolioPositionsQuery()
  const queryClient = useQueryClient()
  const summary = getPortfolioSummary(positionsQuery.data ?? [])

  const handlePositionPress = (position: PortfolioPosition) => {
    queryClient.setQueryData(
      portfolioQueries.positionById(position.positionId).queryKey,
      (old: PortfolioPosition[] | undefined) => old ?? [position]
    )
    router.push({
      pathname: "/(tabs)/portfolio/[positionId]",
      params: {positionId: position.positionId},
    } satisfies Href)
  }

  const handleRefresh = () => {
    void positionsQuery.refetch()
  }

  if (positionsQuery.isPending) {
    return (
      <>
        <StatusBar style="light" />
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
    <>
      <StatusBar style="light" />
      <PortfolioPositionList
        onPositionPress={handlePositionPress}
        onRefresh={handleRefresh}
        positions={positionsQuery.data}
        refreshing={positionsQuery.isRefetching}
        summary={summary}
      />
    </>
  )
}
