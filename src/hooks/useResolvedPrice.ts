import { useMemo } from 'react'
import { MOCK_PRICING_OVERRIDES, MOCK_COURTS } from '../data/mock'

export function useResolvedPrice(
  courtId?: string,
  date?: string | null
) {
  return useMemo(() => {
    // ✅ guard early (VERY important)
    if (!courtId || !date) {
      return {
        price: 0,
        isOverride: false,
        overrideLabel: null as string | null,
      }
    }

    const override = MOCK_PRICING_OVERRIDES.find(
      o => o.court_id === courtId && o.override_date === date
    )

    if (override) {
      return {
        price: override.price_per_hour,
        isOverride: true,
        overrideLabel: override.label,
      }
    }

    const base =
      MOCK_COURTS.find(c => c.id === courtId)?.price_per_hour ?? 0

    return {
      price: base,
      isOverride: false,
      overrideLabel: null,
    }
  }, [courtId, date])
}