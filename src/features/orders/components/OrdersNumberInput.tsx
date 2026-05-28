import {View} from "react-native"

import {Input} from "@/components/ui/input"
import {Text} from "@/components/ui/text"

import {OrdersFieldError} from "./OrdersFieldError"

type OrdersNumberInputProps = {
  error?: string
  label: string
  onChangeText: (value: string) => void
  placeholder: string
  value: string
}

export const OrdersNumberInput = ({
  error,
  label,
  onChangeText,
  placeholder,
  value,
}: OrdersNumberInputProps) => {
  return (
    <View className="gap-xs">
      <Text className="text-muted-foreground text-sm font-medium">{label}</Text>
      <Input
        accessibilityLabel={label}
        keyboardType="decimal-pad"
        onChangeText={onChangeText}
        placeholder={placeholder}
        value={value}
      />
      <OrdersFieldError message={error} />
    </View>
  )
}
