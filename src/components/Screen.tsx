import React, {Fragment} from "react"

import {SystemBars, type SystemBarStyle} from "react-native-edge-to-edge"

import {ScrollView, type ScrollViewProps} from "./ScrollView"
import {Container, type ContainerProps} from "./ui/Container"

export type ScreenProps = {
  container?: boolean
  containerProps?: ContainerProps
  systemBarsStyle?: SystemBarStyle
} & ScrollViewProps

export const Screen = ({
  children,
  container = true,
  containerProps,
  systemBarsStyle = "dark",
  ...props
}: ScreenProps) => {
  return (
    <ScrollView {...props}>
      <SystemBars style={systemBarsStyle} />
      {container ? (
        <Container expanded {...containerProps}>
          {children}
        </Container>
      ) : (
        <Fragment>{children}</Fragment>
      )}
    </ScrollView>
  )
}
