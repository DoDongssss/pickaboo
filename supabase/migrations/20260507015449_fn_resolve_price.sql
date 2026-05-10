-- ============================================
-- FUNCTION: resolve_court_price
-- Returns the effective price/hr for a court
-- on a given date. Checks overrides first,
-- falls back to courts.price_per_hour.
-- ============================================

CREATE OR REPLACE FUNCTION public.resolve_court_price(
  p_court_id    UUID,
  p_booking_date DATE
)
RETURNS NUMERIC AS $$
DECLARE
  v_override_price NUMERIC;
  v_base_price     NUMERIC;
BEGIN
  -- Check for a pricing override on this date
  SELECT price_per_hour INTO v_override_price
  FROM public.court_pricing_overrides
  WHERE court_id = p_court_id
    AND override_date = p_booking_date;

  IF FOUND THEN
    RETURN v_override_price;
  END IF;

  -- Fall back to base court price
  SELECT price_per_hour INTO v_base_price
  FROM public.courts
  WHERE id = p_court_id;

  RETURN COALESCE(v_base_price, 0);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;