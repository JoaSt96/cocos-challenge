import {Text, View} from "react-native"

import {StatusBar} from "expo-status-bar"

import {Container} from "@/components/Container"

export default function App() {
  return (
    <Container expanded insetBottom className="gap-lg justify-center">
      <View className="gap-sm">
        <Text className="text-foreground text-3xl font-bold">Brand colors</Text>
        <Text className="text-muted-foreground text-base leading-6">
          Coinbase-style brand blue, deep trust navy, and market amber.
        </Text>
      </View>

      <View className="gap-md border-border bg-card p-lg rounded-xl border">
        <View className="gap-xs bg-primary px-md py-sm rounded-lg">
          <Text className="text-primary-foreground text-center text-base font-semibold">
            Primary brand
          </Text>
          <Text className="text-primary-foreground text-center text-sm">
            #0052FF
          </Text>
        </View>

        <View className="gap-xs bg-secondary px-md py-sm rounded-lg">
          <Text className="text-secondary-foreground text-center text-base font-semibold">
            Secondary trust
          </Text>
          <Text className="text-secondary-foreground text-center text-sm">
            #1E3A8A
          </Text>
        </View>

        <View className="gap-xs bg-accent px-md py-sm rounded-lg">
          <Text className="text-accent-foreground text-center text-base font-semibold">
            Market accent
          </Text>
          <Text className="text-accent-foreground text-center text-sm">
            #F3BA2F
          </Text>
        </View>
      </View>

      <View className="gap-sm bg-muted p-lg rounded-xl">
        <Text className="text-foreground text-sm font-semibold">
          Market states
        </Text>

        <View className="flex-row justify-between">
          <Text className="text-muted-foreground text-sm">ALUA</Text>
          <Text className="text-profit text-sm font-semibold">+4.82%</Text>
        </View>

        <View className="flex-row justify-between">
          <Text className="text-muted-foreground text-sm">YPFD</Text>
          <Text className="text-loss text-sm font-semibold">-1.37%</Text>
        </View>
      </View>

      <View className="gap-sm flex-row">
        <View className="bg-success p-md flex-1 rounded-lg">
          <Text className="text-success-foreground text-center text-sm font-semibold">
            FILLED
          </Text>
        </View>

        <View className="bg-warning p-md flex-1 rounded-lg">
          <Text className="text-warning-foreground text-center text-sm font-semibold">
            PENDING
          </Text>
        </View>

        <View className="bg-destructive p-md flex-1 rounded-lg">
          <Text className="text-destructive-foreground text-center text-sm font-semibold">
            REJECTED
          </Text>
        </View>
      </View>

      <StatusBar style="auto" />
    </Container>
  )
}
