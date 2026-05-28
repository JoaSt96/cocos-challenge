import {View} from "react-native"

import {Text} from "@/components/ui/text"

export const PortfolioEmptyState = () => {
  return (
    <View className="mx-street mt-md border-border bg-card p-lg rounded-lg border">
      <Text selectable className="text-foreground text-lg font-semibold">
        No hay posiciones en el portfolio
      </Text>
      <Text
        selectable
        className="text-muted-foreground mt-sm text-sm leading-5"
      >
        Cuando la API devuelva tenencias, van a aparecer en esta lista.
      </Text>
    </View>
  )
}
