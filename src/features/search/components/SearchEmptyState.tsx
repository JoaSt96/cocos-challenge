import {View} from "react-native"

import {Search} from "lucide-react-native"

import {Icon} from "@/components/ui/icon"
import {Text} from "@/components/ui/text"

type SearchEmptyStateProps = {
  query: string
  state: "idle" | "empty"
}

export const SearchEmptyState = ({query, state}: SearchEmptyStateProps) => {
  const title =
    state === "idle" ? "Busca por ticker" : `Sin resultados para ${query}`
  const description =
    state === "idle"
      ? "Escribe el simbolo del activo para buscarlo."
      : "Prueba con otro ticker del mercado."

  return (
    <View className="border-border bg-card p-lg rounded-lg border">
      <Icon as={Search} className="text-muted-foreground mb-sm size-5" />
      <Text selectable className="text-foreground text-lg font-semibold">
        {title}
      </Text>
      <Text
        selectable
        className="text-muted-foreground mt-sm text-sm leading-5"
      >
        {description}
      </Text>
    </View>
  )
}
