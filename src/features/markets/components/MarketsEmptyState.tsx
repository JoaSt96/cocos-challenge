import {View} from "react-native"

import {Text} from "@/components/ui/text"

export const MarketsEmptyState = () => {
  return (
    <View className="mx-street mt-md border-border bg-card p-lg rounded-lg border">
      <Text selectable className="text-foreground text-lg font-semibold">
        No hay instrumentos disponibles
      </Text>
      <Text
        selectable
        className="text-muted-foreground mt-sm text-sm leading-5"
      >
        Cuando la API devuelva activos, van a aparecer en esta lista.
      </Text>
    </View>
  )
}
