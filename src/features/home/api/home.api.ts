import {api} from "@/config/api.config"

export const getBanners = async () => {
  const response = await api.get("/home/banners")

  const parsed = homeBannersResponseSchema.safeParse(response.data)

  if (!parsed.success) {
    throw new Error("Invalid response")
  }

  return parsed.data
}

export const getFeaturedItems = async () => {
  const response = await api.get("/home/featured")

  const parsed = homeFeaturedItemsResponseSchema.safeParse(response.data)

  if (!parsed.success) {
    throw new Error("Invalid response")
  }

  return parsed.data
}

export const getProductsByCategory = async (tabId: HomeTabId, page: number) => {
  const response = await api.get(`/home/tabs/${tabId}`, {
    params: {
      page,
    },
  })

  const parsed = homeItemsByTabResponseSchema.safeParse(response.data)

  if (!parsed.success) {
    throw new Error("Invalid response")
  }

  return parsed.data
}
