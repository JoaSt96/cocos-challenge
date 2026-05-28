import {View} from "react-native"

import {Container} from "@/components/Container"
import {Text} from "@/components/ui/text"

import {SearchEmptyState} from "./SearchEmptyState"
import {SearchErrorState} from "./SearchErrorState"
import {SearchInputField} from "./SearchInputField"
import {SearchLoadingState} from "./SearchLoadingState"
import {SearchResultList} from "./SearchResultList"

import type {SearchQueryState, SearchResult} from "../types"

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
    <Container expanded className="gap-md pt-md">
      <View className="gap-xs">
        <SearchInputField onChangeText={onQueryChange} value={query} />
        <Text selectable className="text-muted-foreground text-sm leading-5">
          Busca activos por ticker para preparar una orden.
        </Text>
      </View>

      {state === "idle" ? (
        <SearchEmptyState query={debouncedQuery} state="idle" />
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
