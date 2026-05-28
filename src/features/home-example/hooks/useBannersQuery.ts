import {useQuery} from "@tanstack/react-query"

import {homeQueries} from "../queries/homeQueries"

export const useBannersQuery = () => {
  return useQuery({
    ...homeQueries.banners(),
    staleTime: Infinity,
    gcTime: Infinity,
  })
}
