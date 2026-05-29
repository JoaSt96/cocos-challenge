import {View} from "react-native"

import {Search} from "lucide-react-native"

import {Container} from "@/components/Container"
import {Row} from "@/components/Row"
import {Icon} from "@/components/ui/icon"
import {Text} from "@/components/ui/text"

import type {SearchQueryState, SearchResult} from "../../types"
import {SearchResultList} from "../result-list/SearchResultList"
import {SearchInputField} from "../search-input/SearchInputField"
import {SearchEmptyState} from "../states/SearchEmptyState"
import {SearchErrorState} from "../states/SearchErrorState"
import {SearchLoadingState} from "../states/SearchLoadingState"

type SearchResultsViewProps = {
  debouncedQuery: string
  errorMessage: string | null
  onQueryChange: (value: string) => void
  onRefresh: () => void
  onResultPress: (result: SearchResult) => void
  query: string
  refreshing: boolean
  results: SearchResult[]
  state: SearchQueryState
}

export const SearchResultsView = ({
  debouncedQuery,
  errorMessage,
  onQueryChange,
  onRefresh,
  onResultPress,
  query,
  refreshing,
  results,
  state,
}: SearchResultsViewProps) => {
  return (
    <Container expanded className="gap-lg pt-safe">
      <View className="gap-lg pt-lg">
        <Row className="gap-lg items-start justify-between">
          <View className="gap-xs min-w-0 flex-1">
            <Text className="text-muted-foreground text-xs font-semibold uppercase">
              Centro de órdenes
            </Text>
            <Text className="text-foreground text-3xl font-bold">
              Buscar activos
            </Text>
            <Text className="text-muted-foreground text-sm leading-5">
              Encontrá tickers y abrí un ticket de compra o venta.
            </Text>
          </View>

          <View className="border-primary/20 bg-primary/10 h-12 w-12 items-center justify-center rounded-lg border">
            <Icon as={Search} className="text-primary size-6" />
          </View>
        </Row>
      </View>

      <SearchInputField defaultValue={query} onChangeText={onQueryChange} />

      {state === "idle" ? (
        <SearchEmptyState
          onSuggestionPress={onQueryChange}
          query={debouncedQuery}
          state="idle"
        />
      ) : null}

      {state === "loading" ? <SearchLoadingState /> : null}

      {state === "error" ? (
        <SearchErrorState
          message={errorMessage ?? "Intenta nuevamente en unos segundos."}
          onRetry={onRefresh}
        />
      ) : null}

      {state === "empty" ? (
        <SearchEmptyState query={debouncedQuery} state="empty" />
      ) : null}

      {state === "results" ? (
        <SearchResultList
          onRefresh={onRefresh}
          onResultPress={onResultPress}
          refreshing={refreshing}
          results={results}
        />
      ) : null}
    </Container>
  )
}
