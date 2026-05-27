import {type FC} from "react"

import {
  BottomSheetBackdrop,
  useBottomSheetModal,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet"

export type ModalBackdropProps = BottomSheetBackdropProps & {
  dismiss?: "all" | "single"
}

export const ModalBackdrop: FC<ModalBackdropProps> = ({
  dismiss = "single",
  ...props
}) => {
  const {dismiss: dismissBottomSheet, dismissAll} = useBottomSheetModal()

  const handleDismiss = () => {
    if (dismiss === "all") {
      dismissAll()
    } else {
      dismissBottomSheet()
    }
  }

  return (
    <BottomSheetBackdrop
      onPress={handleDismiss}
      appearsOnIndex={1}
      disappearsOnIndex={-1}
      opacity={0.6}
      {...props}
    />
  )
}
