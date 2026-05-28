import {queryOptions} from "@tanstack/react-query"

import {getPortfolioPositions} from "../api/portfolio.api"

const PORTFOLIO_BASE_QUERY_KEY = "portfolio"

export const portfolioQueries = {
  all: [PORTFOLIO_BASE_QUERY_KEY] as const,
  positions: () =>
    queryOptions({
      gcTime: 5 * 60_000,
      queryFn: getPortfolioPositions,
      queryKey: [PORTFOLIO_BASE_QUERY_KEY, "positions"] as const,
      staleTime: 30_000,
    }),
} as const
