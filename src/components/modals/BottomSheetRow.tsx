import React, {type ComponentRef, forwardRef} from "react"
import {type View} from "react-native"

import {BottomSheetFlex, type BottomSheetFlexProps} from "./BottomSheetFlex"

export type RowProps = Omit<BottomSheetFlexProps, "direction">

export const BottomSheetRow = forwardRef<ComponentRef<typeof View>, RowProps>(
  ({children, ...props}, ref) => (
    <BottomSheetFlex direction="row" {...props} ref={ref}>
      {children}
    </BottomSheetFlex>
  )
)

BottomSheetRow.displayName = "BottomSheetRow"
