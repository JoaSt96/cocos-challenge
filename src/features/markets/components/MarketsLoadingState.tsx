import {View} from "react-native"

import {Container} from "@/components/Container"
import {Skeleton} from "@/components/ui/skeleton"

const MARKETS_LOADING_ROWS = ["row-1", "row-2", "row-3", "row-4", "row-5"]

export const MarketsLoadingState = () => {
  return (
    <Container expanded className="gap-md pt-md">
      <Skeleton className="h-20 rounded-lg" />
      <View className="border-border bg-card overflow-hidden rounded-lg border">
        {MARKETS_LOADING_ROWS.map(row => (
          <View
            className="border-border px-md py-md min-h-[72px] flex-row items-center justify-between border-b"
            key={row}
          >
            <View className="gap-sm flex-1">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-40" />
            </View>
            <View className="gap-sm items-end">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-16" />
            </View>
          </View>
        ))}
      </View>
    </Container>
  )
}
