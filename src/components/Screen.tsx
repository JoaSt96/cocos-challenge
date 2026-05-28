import React, {Fragment} from "react"

import {StatusBar, type StatusBarStyle} from "expo-status-bar"

import {Container, type ContainerProps} from "./Container"
import {ScrollView, type ScrollViewProps} from "./ScrollView"

export type ScreenProps = {
  container?: boolean
  containerProps?: ContainerProps
  systemBarsStyle?: StatusBarStyle
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
      <StatusBar style={systemBarsStyle} />
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
