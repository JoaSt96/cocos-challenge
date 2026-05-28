import {Pressable, View} from "react-native"

import {Text} from "@/components/ui/text"

import {formatSearchPeso} from "../searchFormatters"
import type {SearchResult} from "../types"

type SearchResultRowProps = {
  onPress: (result: SearchResult) => void
  result: SearchResult
}

export const SearchResultRow = ({onPress, result}: SearchResultRowProps) => {
  const price = formatSearchPeso(result.lastPrice)
  const accessibilityLabel = `${result.ticker}, ${result.name}, ${result.type}, ultimo precio ${price}`

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      className="border-border bg-card gap-md px-street py-md min-h-[72px] flex-row items-center justify-between border-b active:opacity-70"
      onPress={() => onPress(result)}
    >
      <View className="gap-xs min-w-0 flex-1">
        <Text selectable className="text-foreground text-base font-semibold">
          {result.ticker}
        </Text>
        <Text
          selectable
          className="text-muted-foreground text-sm leading-5"
          numberOfLines={1}
        >
          {result.name}
        </Text>
      </View>

      <View className="gap-xs items-end">
        <Text selectable className="text-foreground text-base font-semibold">
          {price}
        </Text>
        <Text selectable className="text-muted-foreground text-xs uppercase">
          {result.type}
        </Text>
      </View>
    </Pressable>
  )
}
