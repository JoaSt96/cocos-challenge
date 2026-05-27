import {QueryClientProvider} from "@tanstack/react-query"
import {Slot} from "expo-router"
import {KeyboardProvider} from "react-native-keyboard-controller"

import "../global.css"

import {queryClient} from "@/config/query.config"

export default function Layout() {
  return (
    <QueryClientProvider client={queryClient}>
      <KeyboardProvider>
        <Slot />
      </KeyboardProvider>
    </QueryClientProvider>
  )
}
