import {useState} from "react"

import {StatusBar} from "expo-status-bar"

import {OrdersTicketSheet} from "@/features/orders/components/ticket/OrdersTicketSheet"
import {toOrdersInstrument} from "@/features/orders/orderValidation"
import {SearchResultsView} from "@/features/search/components/results-view/SearchResultsView"
import {useSearchResultsQuery} from "@/features/search/hooks/useSearchResultsQuery"
import type {SearchQueryState, SearchResult} from "@/features/search/types"
import {useDebounce} from "@/hooks/useDebounce"
import {useModal} from "@/hooks/useModal"

const SEARCH_DEBOUNCE_MS = 350

const getSearchErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message
  }

  return "Intenta nuevamente en unos segundos."
}

const getSearchQueryState = ({
  debouncedQuery,
  isError,
  isFetching,
  results,
}: {
  debouncedQuery: string
  isError: boolean
  isFetching: boolean
  results: SearchResult[]
}): SearchQueryState => {
  if (debouncedQuery.length === 0) {
    return "idle"
  }

  if (isFetching && results.length === 0) {
    return "loading"
  }

  if (isError) {
    return "error"
  }

  if (results.length === 0) {
    return "empty"
  }

  return "results"
}

export default function SearchRoute() {
  const [query, setQuery] = useState("")
  const showOrdersTicket = useModal(OrdersTicketSheet)
  const debouncedValue = useDebounce(query, SEARCH_DEBOUNCE_MS)

  const resultsQuery = useSearchResultsQuery(debouncedValue)
  const results = resultsQuery.data ?? []
  const state = getSearchQueryState({
    debouncedQuery: debouncedValue,
    isError: resultsQuery.isError,
    isFetching: resultsQuery.isFetching,
    results,
  })

  const handleRefresh = () => {
    void resultsQuery.refetch()
  }

  const handleResultPress = (result: SearchResult) => {
    showOrdersTicket({
      instrument: toOrdersInstrument(result),
    })
  }

  return (
    <>
      <StatusBar style="light" />
      <SearchResultsView
        debouncedQuery={debouncedValue}
        errorMessage={
          resultsQuery.isError
            ? getSearchErrorMessage(resultsQuery.error)
            : null
        }
        onQueryChange={setQuery}
        onRefresh={handleRefresh}
        onResultPress={handleResultPress}
        query={query}
        refreshing={resultsQuery.isRefetching}
        results={results}
        state={state}
      />
    </>
  )
}
