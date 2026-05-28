import {useMemo, useState} from "react"
import {View} from "react-native"

import {BottomSheetScrollView} from "@gorhom/bottom-sheet"

import {BottomSheetContainer} from "@/components/modals"
import {Text} from "@/components/ui/text"

import {OrdersInstrumentSummary} from "./OrdersInstrumentSummary"
import {OrdersNumberInput} from "./OrdersNumberInput"
import {OrdersQuantityModeSelector} from "./OrdersQuantityModeSelector"
import {OrdersSideSelector} from "./OrdersSideSelector"
import {OrdersStatusResult} from "./OrdersStatusResult"
import {OrdersSubmitButton} from "./OrdersSubmitButton"
import {OrdersTypeSelector} from "./OrdersTypeSelector"

import {useCreateOrderMutation} from "../hooks/useCreateOrderMutation"
import {formatOrdersPeso, formatOrdersQuantity} from "../orderFormatters"
import {
  DEFAULT_ORDERS_FORM_STATE,
  buildCreateOrderPayload,
  getOrdersComputedQuantity,
  parseOrdersNumber,
} from "../orderValidation"
import type {
  CreateOrderResponse,
  OrdersFieldErrors,
  OrdersFormState,
  OrdersInstrument,
} from "../types"

type OrdersTicketSheetProps = {
  dismiss?: () => Promise<void>
  instrument: OrdersInstrument
}

const getOrdersMutationErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message
  }

  return "Intentá nuevamente en unos segundos."
}

const getOrdersEstimatedTotal = ({
  computedQuantity,
  formState,
  instrument,
}: {
  computedQuantity: number
  formState: OrdersFormState
  instrument: OrdersInstrument
}) => {
  const price =
    formState.type === "LIMIT"
      ? parseOrdersNumber(formState.limitPriceText)
      : instrument.lastPrice

  if (!price || computedQuantity <= 0) {
    return null
  }

  const total = price * computedQuantity
  return Number.isFinite(total) ? total : null
}

export const OrdersTicketSheet = ({instrument}: OrdersTicketSheetProps) => {
  const [formState, setFormState] = useState<OrdersFormState>(
    DEFAULT_ORDERS_FORM_STATE
  )
  const [fieldErrors, setFieldErrors] = useState<OrdersFieldErrors>({})
  const [result, setResult] = useState<CreateOrderResponse | null>(null)
  const createOrderMutation = useCreateOrderMutation()

  const computedQuantity = useMemo(
    () => getOrdersComputedQuantity({formState, instrument}),
    [formState, instrument]
  )
  const estimatedTotal = getOrdersEstimatedTotal({
    computedQuantity,
    formState,
    instrument,
  })

  const updateFormState = (patch: Partial<OrdersFormState>) => {
    createOrderMutation.reset()
    setResult(null)
    setFieldErrors({})
    setFormState(current => ({
      ...current,
      ...patch,
    }))
  }

  const handleSubmit = () => {
    const nextPayload = buildCreateOrderPayload({formState, instrument})
    setResult(null)
    setFieldErrors(nextPayload.fieldErrors)

    if (!nextPayload.payload) {
      return
    }

    createOrderMutation.mutate(nextPayload.payload, {
      onSuccess: response => {
        setResult(response)
      },
    })
  }

  return (
    <BottomSheetContainer expanded insetBottom className="pt-md">
      <BottomSheetScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-lg pb-safe">
          <View className="gap-xs">
            <Text className="text-foreground text-xl font-semibold">
              Ticket de orden
            </Text>
            <Text
              selectable
              className="text-muted-foreground text-sm leading-5"
            >
              Definí la operación y enviá la orden al mercado.
            </Text>
          </View>

          <OrdersInstrumentSummary instrument={instrument} />

          <OrdersSideSelector
            onChange={side => updateFormState({side})}
            value={formState.side}
          />

          <OrdersTypeSelector
            onChange={type =>
              updateFormState({
                limitPriceText:
                  type === "MARKET" ? "" : formState.limitPriceText,
                type,
              })
            }
            value={formState.type}
          />

          <OrdersQuantityModeSelector
            onChange={quantityMode => updateFormState({quantityMode})}
            value={formState.quantityMode}
          />

          {formState.quantityMode === "SHARES" ? (
            <OrdersNumberInput
              error={fieldErrors.quantityText}
              label="Cantidad de acciones"
              onChangeText={quantityText => updateFormState({quantityText})}
              placeholder="123"
              value={formState.quantityText}
            />
          ) : (
            <OrdersNumberInput
              error={fieldErrors.amountText}
              label="Monto en pesos"
              onChangeText={amountText => updateFormState({amountText})}
              placeholder="10000"
              value={formState.amountText}
            />
          )}

          {formState.type === "LIMIT" ? (
            <OrdersNumberInput
              error={fieldErrors.limitPriceText}
              label="Precio límite"
              onChangeText={limitPriceText => updateFormState({limitPriceText})}
              placeholder="84,50"
              value={formState.limitPriceText}
            />
          ) : null}

          <View className="border-border bg-card gap-xs p-lg rounded-lg border">
            <Text className="text-muted-foreground text-sm">
              Acciones a enviar
            </Text>
            <Text selectable className="text-foreground text-lg font-semibold">
              {formatOrdersQuantity(computedQuantity)}
            </Text>
            {estimatedTotal ? (
              <Text selectable className="text-muted-foreground text-sm">
                Estimado {formatOrdersPeso(estimatedTotal)}
              </Text>
            ) : null}
          </View>

          <OrdersStatusResult
            errorMessage={
              createOrderMutation.isError
                ? getOrdersMutationErrorMessage(createOrderMutation.error)
                : null
            }
            result={result}
          />

          <OrdersSubmitButton
            disabled={createOrderMutation.isPending}
            hasResult={Boolean(result)}
            isPending={createOrderMutation.isPending}
            onPress={handleSubmit}
          />
        </View>
      </BottomSheetScrollView>
    </BottomSheetContainer>
  )
}
