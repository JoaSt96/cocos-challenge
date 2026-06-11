import {type ConfigContext, type ExpoConfig} from "expo/config"

export default ({config}: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Cocos Challenge",
  slug: "cocos-challenge",
  scheme: "coquito-challenge",
  userInterfaceStyle: "dark",
  orientation: "default",
  buildCacheProvider: "eas",
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
  extra: {
    eas: {
      projectId: "e04dbfdf-7f7a-409b-83e9-31a539018547",
    },
  },
  owner: "joast96",
  experiments: {
    reactCompiler: true,
    typedRoutes: true,
  },
})
