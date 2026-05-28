import {type FC} from "react"
import {View} from "react-native"

import {Container} from "@/components/Container"
import {Image} from "@/components/Image"
import {Column} from "@/components/ui/Column"
import {Skeleton, SkeletonGroup} from "@/components/ui/Skeleton"
import {usePrefetchImages} from "@/hooks/usePrefetchImages"

import {useBannersQuery} from "../../hooks/useBannersQuery"
import {useFeaturedItemsQuery} from "../../hooks/useFeaturedItemsQuery"
import {HomeExampleBannersCarousel} from "../banners-carousel/HomeExampleBannersCarousel"
import {HomeExampleRecentlyViewedItemsCarousel} from "../recently-viewed-carousel/HomeExampleRecentlyViewedItemsCarousel"
import {HomeExampleTabsCarousel} from "../tabs-carousel/HomeExampleTabsCarousel"

export const HomeExampleHeaderContainer: FC = () => {
  const bannersQuery = useBannersQuery()
  const featuredItemsQuery = useFeaturedItemsQuery()

  const imageUrls = bannersQuery.isSuccess
    ? [
        ...(bannersQuery.data?.carousel.map(item => item.url) ?? []),
        bannersQuery.data?.single?.url ?? "",
        bannersQuery.data?.divider?.url ?? "",
      ]
    : []

  const {isImagesLoaded} = usePrefetchImages({
    urls: imageUrls,
  })

  return (
    <Column gap="l">
      <Skeleton show={!isImagesLoaded || !bannersQuery.isSuccess}>
        <HomeExampleBannersCarousel
          banners={bannersQuery.data?.carousel ?? []}
        />
      </Skeleton>
      <Skeleton show={!featuredItemsQuery.isSuccess}>
        <HomeExampleRecentlyViewedItemsCarousel
          items={featuredItemsQuery.data?.items ?? []}
        />
      </Skeleton>
      <Container>
        <Column gap="2xl">
          <SkeletonGroup show={!isImagesLoaded}>
            <Skeleton>
              <View className="p-md rounded-md bg-gray-200">
                <Image
                  name="section"
                  source={{uri: bannersQuery.data?.single?.url}}
                  className="h-[180px] w-full self-center rounded-md"
                  contentFit="cover"
                />
              </View>
            </Skeleton>
            <Skeleton>
              <Image
                source={{uri: bannersQuery.data?.divider?.url}}
                className="h-[32px] w-full self-center rounded-md"
                contentFit="cover"
              />
            </Skeleton>
          </SkeletonGroup>
        </Column>
      </Container>

      <HomeExampleTabsCarousel />
    </Column>
  )
}
