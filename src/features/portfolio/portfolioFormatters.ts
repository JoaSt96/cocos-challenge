const portfolioPesoFormatter = new Intl.NumberFormat("es-AR", {
  currency: "ARS",
  maximumFractionDigits: 2,
  style: "currency",
})

const portfolioQuantityFormatter = new Intl.NumberFormat("es-AR", {
  maximumFractionDigits: 0,
})

export const formatPortfolioPeso = (amount: number) =>
  portfolioPesoFormatter.format(amount)

export const formatPortfolioPercent = (ratio: number) =>
  `${ratio > 0 ? "+" : ""}${(ratio * 100).toFixed(2)}%`

export const formatPortfolioQuantity = (quantity: number) =>
  portfolioQuantityFormatter.format(quantity)
