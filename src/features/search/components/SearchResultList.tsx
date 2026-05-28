import {View} from "react-native"

import {FlashList} from "@shopify/flash-list"

import {SearchResultRow} from "./SearchResultRow"

import type {SearchResult} from "../types"

type SearchResultListProps = {
  onRefresh: () => void
  onResultPress: (result: SearchResult) => void
  refreshing: boolean
  results: SearchResult[]
}

const SearchResultListSeparator = () => {
  return <View className="bg-border h-px" />
}

export const SearchResultList = ({
  onRefresh,
  onResultPress,
  refreshing,
  results,
}: SearchResultListProps) => {
  return (
    <View className="border-border bg-card flex-1 overflow-hidden rounded-lg border">
      <FlashList
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="pb-safe"
        data={results}
        ItemSeparatorComponent={SearchResultListSeparator}
        keyExtractor={result => `${result.id}`}
        onRefresh={onRefresh}
        refreshing={refreshing}
        renderItem={({item}) => (
          <SearchResultRow onPress={onResultPress} result={item} />
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  )
}
