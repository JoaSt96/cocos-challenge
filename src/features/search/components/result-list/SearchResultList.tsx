import {View} from "react-native"

import {FlashList} from "@shopify/flash-list"

import {Text} from "@/components/ui/text"

import {SearchResultRow} from "./SearchResultRow"

import type {SearchResult} from "../../types"

type SearchResultListProps = {
  onRefresh: () => void
  onResultPress: (result: SearchResult) => void
  refreshing: boolean
  results: SearchResult[]
}

const SearchResultListHeader = ({count}: {count: number}) => {
  const label = count === 1 ? "1 resultado" : `${count} resultados`

  return (
    <View className="gap-xs pb-sm">
      <Text className="text-foreground text-lg font-semibold">Resultados</Text>
      <Text className="text-muted-foreground text-sm">{label}</Text>
    </View>
  )
}

export const SearchResultList = ({
  onRefresh,
  onResultPress,
  refreshing,
  results,
}: SearchResultListProps) => {
  return (
    <FlashList
      contentInsetAdjustmentBehavior="automatic"
      contentContainerClassName="pb-safe"
      data={results}
      keyExtractor={result => `${result.id}`}
      ListHeaderComponent={<SearchResultListHeader count={results.length} />}
      onRefresh={onRefresh}
      refreshing={refreshing}
      renderItem={({item}) => (
        <SearchResultRow onPress={onResultPress} result={item} />
      )}
      showsVerticalScrollIndicator={false}
    />
  )
}
