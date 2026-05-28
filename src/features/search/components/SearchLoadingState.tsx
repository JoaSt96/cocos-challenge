import {View} from "react-native"

import {Skeleton} from "@/components/ui/skeleton"

const SEARCH_LOADING_ROWS = ["row-1", "row-2", "row-3", "row-4"]

export const SearchLoadingState = () => {
  return (
    <View className="border-border bg-card overflow-hidden rounded-lg border">
      {SEARCH_LOADING_ROWS.map(row => (
        <View
          className="border-border px-md py-md min-h-[72px] flex-row items-center justify-between border-b"
          key={row}
        >
          <View className="gap-sm min-w-0 flex-1">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-44" />
          </View>
          <Skeleton className="h-4 w-20" />
        </View>
      ))}
    </View>
  )
}
