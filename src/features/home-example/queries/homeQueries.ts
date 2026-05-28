import {infiniteQueryOptions, queryOptions} from "@tanstack/react-query"

import {
  getBanners,
  getFeaturedItems,
  getProductsByCategory,
} from "../api/home.api"

const FIRST_HOME_ITEMS_PAGE = 1

const HOME_BASE_QUERY = "home"

export const homeQueries = {
  banners: () =>
    queryOptions({
      queryKey: [HOME_BASE_QUERY, "banners"],
      queryFn: () => getBanners(),
    }),
  featuredItems: () =>
    queryOptions({
      queryKey: [HOME_BASE_QUERY, "featuredItems"],
      queryFn: () => getFeaturedItems(),
    }),
  itemsByTabId: (tabId: string) =>
    infiniteQueryOptions({
      queryKey: [HOME_BASE_QUERY, "itemsByTabId", tabId],
      queryFn: ({pageParam}) => getProductsByCategory(tabId, pageParam),
      initialPageParam: FIRST_HOME_ITEMS_PAGE,
      getNextPageParam: (lastPage, allPages) =>
        lastPage.items.length > 0 ? allPages.length + 1 : undefined,
    }),
} as const
