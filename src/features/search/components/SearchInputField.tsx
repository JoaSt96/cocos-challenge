import {Input} from "@/components/ui/input"

type SearchInputFieldProps = {
  onChangeText: (value: string) => void
  value: string
}

export const SearchInputField = ({
  onChangeText,
  value,
}: SearchInputFieldProps) => {
  return (
    <Input
      accessibilityLabel="Buscar ticker"
      autoCapitalize="characters"
      autoCorrect={false}
      className="h-12 rounded-lg text-base"
      onChangeText={onChangeText}
      placeholder="Buscar ticker"
      returnKeyType="search"
      value={value}
    />
  )
}
