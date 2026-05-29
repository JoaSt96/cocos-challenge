import {Pressable} from "react-native"

import {Row} from "@/components/Row"
import {Text} from "@/components/ui/text"

import {SEARCH_QUICK_TICKERS} from "../../searchQuickTickers"

type SearchQuickTickerSuggestionsProps = {
  onSuggestionPress: (ticker: string) => void
}

export const SearchQuickTickerSuggestions = ({
  onSuggestionPress,
}: SearchQuickTickerSuggestionsProps) => {
  return (
    <Row className="gap-sm w-full flex-wrap">
      {SEARCH_QUICK_TICKERS.map(ticker => (
        <Pressable
          accessibilityLabel={`Buscar ${ticker}`}
          accessibilityRole="button"
          className="border-border bg-muted/40 px-lg py-sm active:border-primary/40 active:bg-primary/10 min-h-[44px] rounded-lg border"
          key={ticker}
          onPress={() => onSuggestionPress(ticker)}
        >
          <Text className="text-foreground text-sm font-semibold">
            {ticker}
          </Text>
        </Pressable>
      ))}
    </Row>
  )
}
