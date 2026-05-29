import {NativeTabs} from "expo-router/unstable-native-tabs"

const tradingTabColors = {
  background: "#07111f",
  defaultIcon: "#64748b",
  defaultLabel: "#9aa7bd",
  indicator: "#22c55e",
  ripple: "#22c55e33",
  selected: "#2dd4bf",
  shadow: "#020617",
} as const

export default function TabLayout() {
  return (
    <NativeTabs
      backgroundColor={tradingTabColors.background}
      blurEffect="systemChromeMaterialDark"
      disableTransparentOnScrollEdge
      iconColor={{
        default: tradingTabColors.defaultIcon,
        selected: tradingTabColors.selected,
      }}
      indicatorColor={tradingTabColors.indicator}
      labelStyle={{
        default: {color: tradingTabColors.defaultLabel, fontSize: 12},
        selected: {
          color: tradingTabColors.selected,
          fontSize: 12,
          fontWeight: "700",
        },
      }}
      labelVisibilityMode="labeled"
      minimizeBehavior="onScrollDown"
      rippleColor={tradingTabColors.ripple}
      shadowColor={tradingTabColors.shadow}
      tintColor={tradingTabColors.selected}
    >
      <NativeTabs.Trigger name="(markets)">
        <NativeTabs.Trigger.Icon
          md="trending_up"
          sf={{
            default: "chart.line.uptrend.xyaxis",
            selected: "chart.line.uptrend.xyaxis",
          }}
        />
        <NativeTabs.Trigger.Label>Mercados</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="portfolio">
        <NativeTabs.Trigger.Icon
          md="account_balance_wallet"
          sf={{default: "briefcase", selected: "briefcase.fill"}}
        />
        <NativeTabs.Trigger.Label>Portafolio</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="search" role="search">
        <NativeTabs.Trigger.Icon
          md="search"
          sf={{default: "magnifyingglass", selected: "magnifyingglass"}}
        />
        <NativeTabs.Trigger.Label>Buscar</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  )
}
