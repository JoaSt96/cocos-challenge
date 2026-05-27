import React, {type ComponentRef, forwardRef} from "react"
import {type View} from "react-native"

import {BottomSheetFlex, type BottomSheetFlexProps} from "./BottomSheetFlex"

export type BottomSheetColumnProps = Omit<BottomSheetFlexProps, "direction">

export const BottomSheetColumn = forwardRef<
  ComponentRef<typeof View>,
  BottomSheetColumnProps
>(({children, ...props}, ref) => (
  <BottomSheetFlex direction="column" {...props} ref={ref}>
    {children}
  </BottomSheetFlex>
))

BottomSheetColumn.displayName = "BottomSheetColumn"
