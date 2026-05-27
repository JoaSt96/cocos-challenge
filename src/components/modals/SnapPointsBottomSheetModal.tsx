import {forwardRef} from "react"

import {
  BottomSheetModal,
  type BottomSheetModalProps,
} from "@gorhom/bottom-sheet"

import {ModalBackdrop, type ModalBackdropProps} from "./ModalBackdrop"

type SnapPointsBottomSheetModalProps = BottomSheetModalProps &
  Pick<ModalBackdropProps, "dismiss">

export const SnapPointsBottomSheetModal = forwardRef<
  BottomSheetModal,
  SnapPointsBottomSheetModalProps
>(({children, snapPoints, dismiss, ...props}, ref) => (
  <BottomSheetModal
    ref={ref}
    index={0}
    snapPoints={snapPoints}
    enablePanDownToClose
    enableDismissOnClose
    enableDynamicSizing={false}
    backdropComponent={backdropProps => (
      <ModalBackdrop dismiss={dismiss} {...backdropProps} />
    )}
    {...props}
  >
    {children}
  </BottomSheetModal>
))

SnapPointsBottomSheetModal.displayName = "SnapPointsBottomSheetModal"
