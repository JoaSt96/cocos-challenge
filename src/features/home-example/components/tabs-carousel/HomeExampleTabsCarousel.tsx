import React, {useRef} from "react"
import {View} from "react-native"

import {LegendList as LegendListBase, type LegendListRef} from "@legendapp/list"
import {cssInterop} from "nativewind"
import {useShallow} from "zustand/react/shallow"

import {Tab} from "@/components/ui/Tab"

import {tabs, type TabType} from "../../constants/tabs"
import {useTabStore} from "../../store/useTabStore"

const LegendList = cssInterop(LegendListBase<TabType>, {
  className: "style",
  contentContainerClassName: "contentContainerStyle",
  ListHeaderComponentClassName: "ListHeaderComponentStyle",
  ListFooterComponentClassName: "ListFooterComponentStyle",
})

export const HomeExampleTabsCarousel = () => {
  const legendListRef = useRef<LegendListRef>(null)

  const [tab, setTab] = useTabStore(
    useShallow(state => [state.tab, state.setTab])
  )

  const renderItem = ({item, index}: {item: TabType; index: number}) => {
    return (
      <Tab
        title={item.title}
        icon={item.icon}
        onPress={() => {
          setTab(item.value)
          legendListRef.current?.scrollToIndex({
            index,
            animated: true,
            viewPosition: 0.1,
          })
        }}
        isFocused={tab === item.value}
      />
    )
  }

  const keyExtractor = (item: TabType) => item.value

  return (
    <LegendList
      ref={legendListRef}
      data={tabs}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      horizontal
      decelerationRate="fast"
      recycleItems
      showsHorizontalScrollIndicator={false}
      className="h-12"
      contentContainerClassName="px-street h-12"
      snapToAlignment="center"
      extraData={tab}
      estimatedItemSize={130}
      ItemSeparatorComponent={() => <View className="w-4" />}
    />
  )
}
