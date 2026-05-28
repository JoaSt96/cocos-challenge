import {useMutation, useQueryClient} from "@tanstack/react-query"

import {portfolioQueries} from "@/features/portfolio/queries/portfolioQueries"

import {createOrder} from "../api/orders.api"

export const useCreateOrderMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createOrder,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: portfolioQueries.positions().queryKey,
      })
    },
  })
}
