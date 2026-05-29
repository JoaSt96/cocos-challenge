import {useRef, useState} from "react"
import {Pressable, type TextInput, View} from "react-native"

import {Search, X} from "lucide-react-native"

import {Row} from "@/components/Row"
import {Icon} from "@/components/ui/icon"
import {Input} from "@/components/ui/input"
import {Text} from "@/components/ui/text"

type SearchInputFieldProps = {
  defaultValue?: string
  onChangeText: (value: string) => void
}

export const SearchInputField = ({
  defaultValue = "",
  onChangeText,
}: SearchInputFieldProps) => {
  const inputRef = useRef<TextInput>(null)
  const [inputValue, setInputValue] = useState(defaultValue)
  const showClearButton = inputValue.length > 0

  const handleChangeText = (value: string) => {
    setInputValue(value)
    onChangeText(value)
  }

  const handleClear = () => {
    inputRef.current?.clear()
    handleChangeText("")
  }

  return (
    <View className="gap-xs">
      <Text className="text-muted-foreground text-xs font-semibold uppercase">
        Ticker o empresa
      </Text>
      <Row className="border-input bg-panel gap-sm px-md h-14 min-h-[56px] items-center rounded-lg border">
        <Icon
          accessibilityElementsHidden
          as={Search}
          className="text-primary size-5 shrink-0"
        />
        <Input
          ref={inputRef}
          accessibilityLabel="Buscar ticker"
          autoCapitalize="characters"
          autoCorrect={false}
          className="h-14 min-h-14 flex-1 border-0 bg-transparent px-0 text-base"
          defaultValue={defaultValue}
          onChangeText={handleChangeText}
          placeholder="Ej. GGAL, AL30"
          returnKeyType="search"
        />
        {showClearButton ? (
          <Pressable
            accessibilityLabel="Borrar búsqueda"
            accessibilityRole="button"
            className="border-border bg-card active:bg-muted h-11 w-11 shrink-0 items-center justify-center rounded-lg border"
            hitSlop={8}
            onPress={handleClear}
          >
            <Icon as={X} className="text-muted-foreground size-5" />
          </Pressable>
        ) : null}
      </Row>
    </View>
  )
}
