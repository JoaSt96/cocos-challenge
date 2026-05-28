import {View} from "react-native"

import {AlertCircle} from "lucide-react-native"

import {Button} from "@/components/ui/button"
import {Icon} from "@/components/ui/icon"
import {Text} from "@/components/ui/text"

type SearchErrorStateProps = {
  message: string
  onRetry: () => void
}

export const SearchErrorState = ({message, onRetry}: SearchErrorStateProps) => {
  return (
    <View className="border-destructive/30 bg-card p-lg overflow-hidden rounded-lg border">
      <Icon as={AlertCircle} className="mb-sm text-destructive size-5" />
      <Text selectable className="text-foreground text-lg font-semibold">
        No pudimos buscar activos
      </Text>
      <Text
        selectable
        className="text-muted-foreground mt-sm text-sm leading-5"
      >
        {message}
      </Text>
      <Button className="mt-md self-start" onPress={onRetry}>
        <Text>Reintentar</Text>
      </Button>
    </View>
  )
}
