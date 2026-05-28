import {Button} from "@/components/ui/button"
import {Text} from "@/components/ui/text"

type OrdersSubmitButtonProps = {
  disabled: boolean
  isPending: boolean
  hasResult: boolean
  onPress: () => void
  onReset: () => void
}

export const OrdersSubmitButton = ({
  disabled,
  hasResult,
  isPending,
  onPress,
  onReset,
}: OrdersSubmitButtonProps) => {
  const label = isPending
    ? "Enviando..."
    : hasResult
      ? "Enviar otra orden"
      : "Enviar orden"

  return (
    <Button
      accessibilityRole="button"
      className="min-h-11"
      disabled={disabled}
      onPress={hasResult ? onReset : onPress}
    >
      <Text>{label}</Text>
    </Button>
  )
}
