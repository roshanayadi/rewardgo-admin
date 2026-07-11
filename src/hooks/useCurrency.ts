import { useQuery } from '@tanstack/react-query'
import { settingsApi } from '@/api/services'
import { formatCoins } from '@/lib/utils'

const DEFAULTS = { coinsPerUsd: 10000, usdToNpr: 133 }

/**
 * Loads the coin→USD→NPR conversion rates from public settings and exposes
 * conversion + formatting helpers. Falls back to sane defaults before load.
 */
export function useCurrency() {
  const { data } = useQuery({
    queryKey: ['public-settings'],
    queryFn: settingsApi.public,
    staleTime: 5 * 60_000,
  })

  const coinsPerUsd = Number(data?.coins_per_usd) || DEFAULTS.coinsPerUsd
  const usdToNpr = Number(data?.usd_to_npr) || DEFAULTS.usdToNpr

  const coinsToUsd = (coins: number | string) => (Number(coins) || 0) / coinsPerUsd
  const coinsToNpr = (coins: number | string) => coinsToUsd(coins) * usdToNpr

  const usd = (coins: number | string) =>
    coinsToUsd(coins).toLocaleString('en-US', { style: 'currency', currency: 'USD' })

  const npr = (coins: number | string) =>
    `रू ${coinsToNpr(coins).toLocaleString('en-US', { maximumFractionDigits: 2 })}`

  /** "$1.00 · रू 133" */
  const conversion = (coins: number | string) => `${usd(coins)} · ${npr(coins)}`

  return { coinsPerUsd, usdToNpr, coinsToUsd, coinsToNpr, formatCoins, usd, npr, conversion }
}
