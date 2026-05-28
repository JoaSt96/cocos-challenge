import {Platform, View} from "react-native"

import {BottomSheetTextInput} from "@gorhom/bottom-sheet"

import {Text} from "@/components/ui/text"
import {cn} from "@/lib/utils"

import {OrdersFieldError} from "./OrdersFieldError"

type OrdersNumberInputProps = {
  disabled?: boolean
  error?: string
  label: string
  onChangeText: (value: string) => void
  placeholder: string
  value: string
}

export const OrdersNumberInput = ({
  disabled = false,
  error,
  label,
  onChangeText,
  placeholder,
  value,
}: OrdersNumberInputProps) => {
  return (
    <View className="gap-xs">
      <Text className="text-muted-foreground text-sm font-medium">{label}</Text>
      <BottomSheetTextInput
        accessibilityLabel={label}
        className={cn(
          "dark:bg-input/30 border-input bg-background text-foreground flex h-10 w-full min-w-0 flex-row items-center rounded-md border px-3 py-1 text-base leading-5 shadow-sm shadow-black/5 sm:h-9",
          disabled && "opacity-50",
          Platform.select({
            native: "placeholder:text-muted-foreground/50",
          })
        )}
        editable={!disabled}
        keyboardType="decimal-pad"
        onChangeText={onChangeText}
        placeholder={placeholder}
        value={value}
      />
      <OrdersFieldError message={error} />
    </View>
  )
}
