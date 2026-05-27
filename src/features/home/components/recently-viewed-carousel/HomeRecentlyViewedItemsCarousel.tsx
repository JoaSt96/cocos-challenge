import {type FC} from "react"
import {FlatList, View} from "react-native"

import {type Item} from "@altatienda/schemas"
import {cva} from "class-variance-authority"

import {Container} from "@/components/Container"
import {Column} from "@/components/ui/Column"
import {Text} from "@/components/ui/Text"

import {MinifiedItemCard} from "./MinifiedItemCard"

type Props = {
  items: Item[]
}

const contentContainerVariants = cva("", {
  variants: {
    isFirstItem: {
      true: "ml-street flex-1",
    },
    isLastItem: {
      true: "mr-street flex-1",
    },
  },
})

export const HomeRecentlyViewedItemsCarousel: FC<Props> = ({items}) => {
  const renderItem = ({item, index}: {item: Item; index: number}) => {
    const isFirstItem = index === 0
    const isLastItem = index === items.length - 1

    return (
      <MinifiedItemCard
        key={item.id}
        price={item.price}
        previousPrice={item.price}
        image={item.mediaUrl}
        contentContainerClassName={contentContainerVariants({
          isFirstItem,
          isLastItem,
        })}
      />
    )
  }

  return (
    <Column gap="s" className="py-2xl bg-gray-50">
      <Container>
        <Text selectable variant="title" weight="semi-bold" align="left">
          Más vendidos
        </Text>
      </Container>

      <FlatList
        data={items}
        renderItem={renderItem}
        horizontal
        decelerationRate="fast"
        ItemSeparatorComponent={() => <View className="px-xs" />}
        showsHorizontalScrollIndicator={false}
      />
    </Column>
  )
}
