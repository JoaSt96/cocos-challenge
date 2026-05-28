import {useQuery} from "@tanstack/react-query"

import {portfolioQueries} from "../queries/portfolioQueries"

export const usePortfolioPositionsQuery = () => {
  return useQuery(portfolioQueries.positions())
}
