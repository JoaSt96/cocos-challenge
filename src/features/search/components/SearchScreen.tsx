import {useEffect, useState} from "react"

import {StatusBar} from "expo-status-bar"

import {OrdersTicketSheet} from "@/features/orders/components/OrdersTicketSheet"
import {toOrdersInstrument} from "@/features/orders/orderValidation"
import {useModal} from "@/hooks/useModal"

import {SearchResultsView} from "./SearchResultsView"

import {useSearchResultsQuery} from "../hooks/useSearchResultsQuery"
import {normalizeSearchQuery} from "../searchText"
import type {SearchQueryState, SearchResult} from "../types"

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

export const SearchScreen = () => {
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedQuery(normalizeSearchQuery(query))
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [query])

  const resultsQuery = useSearchResultsQuery(debouncedQuery)
  const results = resultsQuery.data ?? []
  const showOrdersTicket = useModal(OrdersTicketSheet)
  const state = getSearchQueryState({
    debouncedQuery,
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
      <StatusBar style="auto" />
      <SearchResultsView
        debouncedQuery={debouncedQuery}
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
