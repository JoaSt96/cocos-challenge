import React, {useRef} from "react"
import {
  ActivityIndicator,
  Alert,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  RefreshControl,
  View,
} from "react-native"

import {type Item} from "@altatienda/schemas"
import {LegendList as LegendListBase, type LegendListRef} from "@legendapp/list"
import {type Href, useRouter} from "expo-router"
import {Skeleton} from "moti/skeleton"
import {cssInterop} from "nativewind"
import {
  interpolate,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated"

import {ScrollToTopButton} from "@/components/carousel/ScrollToTopButton"
import {ItemCard} from "@/components/ui/item-card/ItemCard"
import {Text} from "@/components/ui/Text"
import {useRefreshing} from "@/hooks/useRefreshing"

import {HomeHeaderContainer} from "./header-container/HomeHeaderContainer"

import {useItemsByTabIdQuery} from "../hooks/useItemsByTabIdQuery"
import {useTabStore} from "../store/useTabStore"

const LegendList = cssInterop(LegendListBase<Item>, {
  ListHeaderComponentClassName: "ListHeaderComponentStyle",
  contentContainerClassName: "contentContainerStyle",
  columnWrapperClassName: "columnWrapperStyle",
})

function updateScrollTopButtonVisibility(
  showScrollTopButton: SharedValue<number>,
  scrollY: number
) {
  if (scrollY > 950) {
    showScrollTopButton.value = withTiming(1, {duration: 300})
  } else {
    showScrollTopButton.value = withTiming(0, {duration: 300})
  }
}

export const HomeScreen = () => {
  const ref = useRef<LegendListRef>(null)

  const tab = useTabStore(state => state.tab)
  const showScrollTopButton = useSharedValue(0)
  const pressed = useSharedValue(0)

  const router = useRouter()

  const itemsByCategoryQuery = useItemsByTabIdQuery(tab)

  const {isRefreshing, refresh} = useRefreshing(itemsByCategoryQuery.refetch)

  const scrollToTopAnimatedStyles = useAnimatedStyle(() => {
    return {
      opacity: interpolate(showScrollTopButton.value, [0, 0.5, 1], [0, 0.5, 1]),
      transform: [{scale: interpolate(pressed.value, [0, 1], [1, 1.1])}],
    }
  })

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    updateScrollTopButtonVisibility(
      showScrollTopButton,
      event.nativeEvent.contentOffset.y
    )
  }

  const renderItem = ({item}: {item: Item}) => {
    return (
      <ItemCard
        variant="vertical"
        id={`product-${item.id}`}
        title={item.title}
        mediaUrl={item.mediaUrl}
        previousPrice={10000}
        currentPrice={item.price}
        rating={4.7}
        amountOfReviews={100}
        skipAnimations={true}
        containerClassName="self-center"
        onFavoritePress={() => Alert.alert(`Favorite ${item.id}`)}
        onAddToCartPress={() => Alert.alert(`Add to cart ${item.id}`)}
        onItemPress={() => router.push(`/products/${item.id}` satisfies Href)}
      />
    )
  }

  const handleScrollToTop = () => {
    if (ref.current) {
      ref.current.scrollToIndex({animated: true, index: 4})
    }
  }

  const handleOnEndReachedProductsByCategory = () => {
    if (
      itemsByCategoryQuery.hasNextPage &&
      !itemsByCategoryQuery.isFetchingNextPage
    ) {
      itemsByCategoryQuery.fetchNextPage()
    }
  }

  const ListFooter = () =>
    itemsByCategoryQuery.isFetchingNextPage ||
    itemsByCategoryQuery.isLoading ? (
      <View className="pb-safe pt-4">
        <ActivityIndicator />
      </View>
    ) : null

  return (
    <>
      <LegendList
        ref={ref}
        data={
          itemsByCategoryQuery.data?.pages
            .flatMap(page => page.items)
            .filter((item): item is Item => item !== null) ?? []
        }
        keyExtractor={(_item, index) => {
          return `${index}`
        }}
        renderItem={renderItem}
        numColumns={2}
        recycleItems
        estimatedItemSize={300}
        decelerationRate="fast"
        drawDistance={700}
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={HomeHeaderContainer}
        ListHeaderComponentClassName="pb-sm"
        ListFooterComponent={ListFooter}
        columnWrapperClassName="gap-md"
        onScroll={handleScroll}
        extraData={tab}
        onEndReached={handleOnEndReachedProductsByCategory}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refresh} />
        }
        ListEmptyComponent={
          <Skeleton.Group show={itemsByCategoryQuery.isLoading}>
            <Skeleton colorMode="light">
              <Text>No products found</Text>
            </Skeleton>
          </Skeleton.Group>
        }
      />

      <ScrollToTopButton
        scrollToTop={handleScrollToTop}
        pressed={pressed}
        animatedStyles={scrollToTopAnimatedStyles}
      />
    </>
  )
}
