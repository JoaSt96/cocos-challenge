import React, {useEffect, type FC} from "react"

import {type HomeBanner} from "@altatienda/schemas"
import {Image as ExpoImage} from "expo-image"
import {useSharedValue} from "react-native-reanimated"

import {HorizontalCarousel} from "@/components/carousel/HorizontalCarousel"
import {Pagination} from "@/components/carousel/Pagination"
import {Image} from "@/components/Image"
import {Column} from "@/components/ui/Column"
import {vh, vw} from "@/helpers/viewport"

type Props = {
  banners: HomeBanner[]
}

export const HomeExampleBannersCarousel: FC<Props> = ({banners}) => {
  const progress = useSharedValue(0)

  useEffect(() => {
    void ExpoImage.prefetch(banners?.map(item => item.url) ?? [])
  }, [banners])

  return (
    <Column gap="m">
      <HorizontalCarousel
        data={banners}
        renderItem={({item}) => (
          <Image
            source={{uri: item.url}}
            className="w-full flex-1 rounded-md"
            contentFit="cover"
          />
        )}
        height={vh(25)}
        width={vw(100)}
        progress={progress}
      />
      <Pagination progress={progress} length={banners?.length} />
    </Column>
  )
}
