# Expo Router and Uniwind

Use [Expo Router](https://docs.expo.dev/router/introduction/) with [Uniwind](https://docs.uniwind.dev/) styling.

## Launch your own

[![Launch with Expo](https://github.com/expo/examples/blob/master/.gh-assets/launch.svg?raw=true)](https://launch.expo.dev/?github=https://github.com/expo/examples/tree/master/with-router-uniwind)

## 🚀 How to use

```sh
bun install
npx expo start
```

## React Compiler

This project uses the [React Compiler](https://docs.expo.dev/guides/react-compiler/) for automatic component and hook memoization.

- Enabled via `experiments.reactCompiler: true` in [`app.config.ts`](app.config.ts)
- Requires `babel-plugin-react-compiler` (wired automatically by `babel-preset-expo` when the experiment is on)
- ESLint rules from `eslint-config-expo` enforce the Rules of React

After changing Babel or compiler-related config, restart Metro with a clean cache:

```sh
npx expo start --clear
```

To check compiler compatibility:

```sh
npx react-compiler-healthcheck@latest --src "src/**/*.{ts,tsx}"
```

Manual `useCallback`, `useMemo`, and `React.memo` are not needed — the compiler handles memoization automatically.

## Deploy

Deploy on all platforms with Expo Application Services (EAS).

- Deploy the website: `npx eas-cli deploy` — [Learn more](https://docs.expo.dev/eas/hosting/get-started/)
- Deploy on iOS and Android using: `npx eas-cli build` — [Learn more](https://expo.dev/eas)
