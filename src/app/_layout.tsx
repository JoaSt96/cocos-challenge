import {BottomSheetModalProvider} from "@gorhom/bottom-sheet"
import {QueryClientProvider} from "@tanstack/react-query"
import {Stack} from "expo-router"
import {GestureHandlerRootView} from "react-native-gesture-handler"
import {KeyboardProvider} from "react-native-keyboard-controller"

import "../global.css"

import {ModalProvider} from "@/components/modals"
import {queryClient} from "@/config/query.config"

export default function Layout() {
  return (
    <GestureHandlerRootView className="flex-1">
      <QueryClientProvider client={queryClient}>
        <KeyboardProvider>
          <BottomSheetModalProvider>
            <ModalProvider>
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
            </ModalProvider>
          </BottomSheetModalProvider>
        </KeyboardProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  )
}
