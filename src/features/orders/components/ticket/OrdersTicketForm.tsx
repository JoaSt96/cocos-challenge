import {useMemo} from "react"
import {View} from "react-native"

import {zodResolver} from "@hookform/resolvers/zod"
import {cva} from "class-variance-authority"
import {Calculator, FileCheck2} from "lucide-react-native"
import type {SubmitHandler} from "react-hook-form"
import {Controller, useForm, useWatch} from "react-hook-form"

import {Row} from "@/components/Row"
import {Card, CardContent} from "@/components/ui/card"
import {Icon} from "@/components/ui/icon"
import {Text} from "@/components/ui/text"

import {OrdersSubmitButton} from "./OrdersSubmitButton"

import {useCreateOrderMutation} from "../../hooks/useCreateOrderMutation"
import {formatOrdersPeso, formatOrdersQuantity} from "../../orderFormatters"
import {
  showOrdersCreateOrderErrorToast,
  showOrdersCreateOrderResultToast,
} from "../../orderToasts"
import {
  DEFAULT_ORDERS_FORM_STATE,
  createOrderPayloadFromFormValues,
  createOrdersFormSchema,
  getOrdersComputedQuantity,
  getOrdersEstimatedTotal,
  type OrdersFormValues,
} from "../../orderValidation"
import type {OrdersInstrument} from "../../types"
import {OrdersNumberInput} from "../form-fields/OrdersNumberInput"
import {OrdersInstrumentSummary} from "../instrument-summary/OrdersInstrumentSummary"
import {OrdersQuantityModeSelector} from "../selectors/OrdersQuantityModeSelector"
import {OrdersSideSelector} from "../selectors/OrdersSideSelector"
import {OrdersTypeSelector} from "../selectors/OrdersTypeSelector"

type OrdersTicketFormProps = {
  instrument: OrdersInstrument
  showHeader?: boolean
  showInstrumentSummary?: boolean
  useBottomSheetInputs?: boolean
}

const ordersEstimateCardVariants = cva("py-4", {
  variants: {
    side: {
      BUY: "border-success/20 bg-success/10",
      SELL: "border-destructive/20 bg-destructive/10",
    },
  },
})

const ordersEstimateValueVariants = cva(
  "text-foreground text-2xl font-bold tabular-nums",
  {
    variants: {
      side: {
        BUY: "text-profit",
        SELL: "text-loss",
      },
    },
  }
)

export const OrdersTicketForm = ({
  instrument,
  showHeader = true,
  showInstrumentSummary = true,
  useBottomSheetInputs = false,
}: OrdersTicketFormProps) => {
  const createOrderMutation = useCreateOrderMutation()
  const ordersFormSchema = useMemo(
    () => createOrdersFormSchema(instrument),
    [instrument]
  )
  const form = useForm<OrdersFormValues>({
    defaultValues: DEFAULT_ORDERS_FORM_STATE,
    mode: "onSubmit",
    resolver: zodResolver(ordersFormSchema),
  })
  const [amountText, limitPriceText, quantityMode, quantityText, side, type] =
    useWatch({
      control: form.control,
      name: [
        "amountText",
        "limitPriceText",
        "quantityMode",
        "quantityText",
        "side",
        "type",
      ],
    })
  const formValues: OrdersFormValues = useMemo(
    () => ({
      amountText: amountText ?? DEFAULT_ORDERS_FORM_STATE.amountText,
      limitPriceText:
        limitPriceText ?? DEFAULT_ORDERS_FORM_STATE.limitPriceText,
      quantityMode: quantityMode ?? DEFAULT_ORDERS_FORM_STATE.quantityMode,
      quantityText: quantityText ?? DEFAULT_ORDERS_FORM_STATE.quantityText,
      side: side ?? DEFAULT_ORDERS_FORM_STATE.side,
      type: type ?? DEFAULT_ORDERS_FORM_STATE.type,
    }),
    [amountText, limitPriceText, quantityMode, quantityText, side, type]
  )
  const {errors: fieldErrors, isSubmitting} = form.formState
  const result = createOrderMutation.data ?? null
  const isSubmitPending = isSubmitting || createOrderMutation.isPending

  const computedQuantity = useMemo(
    () => getOrdersComputedQuantity({formValues, instrument}),
    [formValues, instrument]
  )
  const estimatedTotal = getOrdersEstimatedTotal({
    computedQuantity,
    formValues,
    instrument,
  })

  const clearSubmitFeedback = () => {
    createOrderMutation.reset()
  }

  const handleReset = () => {
    if (isSubmitPending) {
      return
    }

    createOrderMutation.reset()
    form.reset(DEFAULT_ORDERS_FORM_STATE)
  }

  const handleValidSubmit: SubmitHandler<OrdersFormValues> = values => {
    const payload = createOrderPayloadFromFormValues({instrument, values})

    createOrderMutation.reset()
    createOrderMutation.mutate(payload, {
      onError: error => {
        showOrdersCreateOrderErrorToast(error)
      },
      onSuccess: result => {
        showOrdersCreateOrderResultToast(result)
      },
    })
  }

  const handleSubmit = () => {
    void form.handleSubmit(handleValidSubmit)()
  }

  return (
    <View className="gap-lg">
      {showHeader ? (
        <View className="border-border gap-lg pb-lg border-b">
          <Row className="gap-lg items-start justify-between">
            <View className="gap-xs min-w-0 flex-1">
              <Text className="text-muted-foreground text-xs font-semibold uppercase">
                Ticket de trading
              </Text>
              <Text className="text-foreground text-2xl font-bold">
                Nueva orden
              </Text>
              <Text
                selectable
                className="text-muted-foreground text-sm leading-5"
              >
                Definí lado, tipo y cantidad antes de enviar.
              </Text>
            </View>
            <View className="border-primary/20 bg-primary/10 h-12 w-12 items-center justify-center rounded-lg border">
              <Icon as={FileCheck2} className="text-primary size-6" />
            </View>
          </Row>
        </View>
      ) : null}

      {showInstrumentSummary ? (
        <OrdersInstrumentSummary instrument={instrument} />
      ) : null}

      <Controller
        control={form.control}
        name="side"
        render={({field}) => (
          <OrdersSideSelector
            disabled={isSubmitPending}
            onChange={side => {
              clearSubmitFeedback()
              field.onChange(side)
            }}
            value={field.value}
          />
        )}
      />

      <Controller
        control={form.control}
        name="type"
        render={({field}) => (
          <OrdersTypeSelector
            disabled={isSubmitPending}
            onChange={type => {
              clearSubmitFeedback()
              field.onChange(type)

              if (type === "MARKET") {
                form.setValue("limitPriceText", "", {
                  shouldDirty: true,
                  shouldTouch: true,
                })
                form.clearErrors("limitPriceText")
              }
            }}
            value={field.value}
          />
        )}
      />

      <Controller
        control={form.control}
        name="quantityMode"
        render={({field}) => (
          <OrdersQuantityModeSelector
            disabled={isSubmitPending}
            onChange={quantityMode => {
              clearSubmitFeedback()
              field.onChange(quantityMode)
              form.clearErrors(["amountText", "quantityText"])
            }}
            value={field.value}
          />
        )}
      />

      {formValues.quantityMode === "SHARES" ? (
        <Controller
          control={form.control}
          name="quantityText"
          render={({field}) => (
            <OrdersNumberInput
              disabled={isSubmitPending}
              error={fieldErrors.quantityText?.message}
              label="Cantidad de acciones"
              onChangeText={quantityText => {
                clearSubmitFeedback()
                field.onChange(quantityText)
                form.clearErrors("quantityText")
              }}
              placeholder="123"
              useBottomSheetInput={useBottomSheetInputs}
              value={field.value}
            />
          )}
        />
      ) : (
        <Controller
          control={form.control}
          name="amountText"
          render={({field}) => (
            <OrdersNumberInput
              disabled={isSubmitPending}
              error={fieldErrors.amountText?.message}
              label="Monto en pesos"
              onChangeText={amountText => {
                clearSubmitFeedback()
                field.onChange(amountText)
                form.clearErrors("amountText")
              }}
              placeholder="10000"
              useBottomSheetInput={useBottomSheetInputs}
              value={field.value}
            />
          )}
        />
      )}

      {formValues.type === "LIMIT" && (
        <Controller
          control={form.control}
          name="limitPriceText"
          render={({field}) => (
            <OrdersNumberInput
              disabled={isSubmitPending}
              error={fieldErrors.limitPriceText?.message}
              label="Precio límite"
              onChangeText={limitPriceText => {
                clearSubmitFeedback()
                field.onChange(limitPriceText)
                form.clearErrors("limitPriceText")
              }}
              placeholder="84,50"
              useBottomSheetInput={useBottomSheetInputs}
              value={field.value}
            />
          )}
        />
      )}

      <Card className={ordersEstimateCardVariants({side: formValues.side})}>
        <CardContent className="gap-xs">
          <Row className="gap-md items-center justify-between">
            <View className="gap-xs">
              <Text className="text-muted-foreground text-xs font-medium uppercase">
                Acciones a enviar
              </Text>
              <Text
                selectable
                className={ordersEstimateValueVariants({side: formValues.side})}
                style={{fontVariant: ["tabular-nums"]}}
              >
                {formatOrdersQuantity(computedQuantity)}
              </Text>
            </View>
            <View className="border-border/60 bg-card h-11 w-11 items-center justify-center rounded-lg border">
              <Icon as={Calculator} className="text-primary size-5" />
            </View>
          </Row>
          {estimatedTotal ? (
            <Text
              selectable
              className="text-muted-foreground text-sm tabular-nums"
              style={{fontVariant: ["tabular-nums"]}}
            >
              Estimado {formatOrdersPeso(estimatedTotal)}
            </Text>
          ) : null}
        </CardContent>
      </Card>

      <OrdersSubmitButton
        disabled={isSubmitPending}
        hasResult={Boolean(result)}
        isPending={isSubmitPending}
        onPress={handleSubmit}
        onReset={handleReset}
      />
    </View>
  )
}
