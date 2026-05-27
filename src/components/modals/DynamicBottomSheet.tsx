import {forwardRef, type PropsWithChildren} from "react"

import {
  BottomSheetModal,
  type BottomSheetModalProps,
} from "@gorhom/bottom-sheet"

import {ModalBackdrop, type ModalBackdropProps} from "./ModalBackdrop"

export type DynamicBottomSheetModalProps = PropsWithChildren &
  Omit<
    BottomSheetModalProps,
    "backdropComponent" | "ref" | "index" | "handleComponent"
  > &
  Pick<ModalBackdropProps, "dismiss">

export const DynamicBottomSheetModal = forwardRef<
  BottomSheetModal,
  DynamicBottomSheetModalProps
>(({children, dismiss, ...props}, ref) => (
  <BottomSheetModal
    ref={ref}
    // by default, the bottom sheet will be dynamic
    index={0}
    enablePanDownToClose
    enableDismissOnClose
    backdropComponent={backdropProps => (
      <ModalBackdrop dismiss={dismiss} {...backdropProps} />
    )}
    {...props}
  >
    {children}
  </BottomSheetModal>
))

DynamicBottomSheetModal.displayName = "DynamicBottomSheetModal"
