import {Text} from "@/components/ui/text"

type OrdersFieldErrorProps = {
  message: string | undefined
}

export const OrdersFieldError = ({message}: OrdersFieldErrorProps) => {
  if (!message) {
    return null
  }

  return (
    <Text selectable className="text-destructive text-sm leading-5">
      {message}
    </Text>
  )
}
