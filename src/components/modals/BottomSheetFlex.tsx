import React, {type ComponentProps, type ComponentRef, forwardRef} from "react"
import {View} from "react-native"

import {flexVariants, type FlexVariants} from "@/components/Flex"
import {cn} from "@/lib/utils"

export type BottomSheetFlexProps = ComponentProps<typeof View> & FlexVariants

export const BottomSheetFlex = forwardRef<
  ComponentRef<typeof View>,
  BottomSheetFlexProps
>(
  (
    {
      direction,
      expanded,
      className,
      center,
      gap,
      justify,
      items,
      insetTop,
      insetBottom,
      ...props
    },
    ref
  ) => (
    <View
      className={cn(
        flexVariants({
          direction,
          expanded,
          center,
          gap,
          justify,
          items,
          insetTop,
          insetBottom,
        }),
        className
      )}
      {...props}
      ref={ref}
    />
  )
)

BottomSheetFlex.displayName = "BottomSheetFlex"
