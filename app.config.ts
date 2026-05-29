import {type ConfigContext, type ExpoConfig} from "expo/config"

export default ({config}: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Cocos Challenge",
  slug: "cocos-challenge",
  scheme: "coquito-challenge",
  userInterfaceStyle: "dark",
  orientation: "default",
  web: {
    output: "static",
  },
  plugins: ["expo-router", "expo-status-bar", "expo-image"],
  android: {
    package: "com.joast96.coquitochallenge",
  },
  ios: {
    bundleIdentifier: "com.joast96.coquitochallenge",
  },
  experiments: {
    reactCompiler: true,
    typedRoutes: true,
  },
})
