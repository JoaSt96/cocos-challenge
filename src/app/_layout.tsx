import {QueryClientProvider} from "@tanstack/react-query"
import {Stack} from "expo-router/stack"
import {KeyboardProvider} from "react-native-keyboard-controller"

import "../global.css"

import {queryClient} from "@/config/query.config"

export default function Layout() {
  return (
    <QueryClientProvider client={queryClient}>
      <KeyboardProvider>
        <Stack
          screenOptions={{
            headerLargeTitle: false,
            headerShadowVisible: false,
          }}
        >
          <Stack.Screen name="index" options={{title: "Markets"}} />
          <Stack.Screen name="portfolio" options={{title: "Portfolio"}} />
          <Stack.Screen name="search" options={{title: "Search"}} />
        </Stack>
      </KeyboardProvider>
    </QueryClientProvider>
  )
}
