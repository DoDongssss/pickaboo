-- ============================================
-- TRIGGER: validate and enforce booking price
-- Fires BEFORE INSERT on bookings
-- Recomputes price server-side and overrides
-- any client-submitted value
-- ============================================

CREATE OR REPLACE FUNCTION public.fn_validate_booking_price()
RETURNS TRIGGER AS $$
DECLARE
  v_price_per_hour  NUMERIC;
  v_duration_hours  NUMERIC;
  v_addons_total    NUMERIC;
  v_total_price     NUMERIC;
BEGIN
  -- Resolve effective price (override or base)
  v_price_per_hour := public.resolve_court_price(
    NEW.court_id,
    NEW.booking_date
  );

  -- Compute duration from time fields
  v_duration_hours := EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)) / 3600;

  -- Validate time range
  IF v_duration_hours <= 0 THEN
    RAISE EXCEPTION 'end_time must be after start_time';
  END IF;

  -- Validate against court operating hours
  DECLARE
    v_open_time  TIME;
    v_close_time TIME;
  BEGIN
    SELECT open_time, close_time INTO v_open_time, v_close_time
    FROM public.courts
    WHERE id = NEW.court_id;

    IF NEW.start_time < v_open_time OR NEW.end_time > v_close_time THEN
      RAISE EXCEPTION 'Booking time is outside court operating hours (% – %)',
        v_open_time, v_close_time;
    END IF;
  END;

  -- Enforce server-computed values
  -- Frontend values are overridden here
  NEW.price_per_hour  := v_price_per_hour;
  NEW.duration_hours  := v_duration_hours;

  -- addons_total will be set after booking_addons insert
  -- so we trust the submitted value here but recheck via
  -- the booking_addons trigger below
  v_total_price := (v_duration_hours * v_price_per_hour) + COALESCE(NEW.addons_total, 0);
  NEW.total_price := v_total_price;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_validate_booking_price
  BEFORE INSERT ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_validate_booking_price();


-- ============================================
-- TRIGGER: recompute total when add-ons change
-- Fires AFTER INSERT on booking_addons
-- Updates bookings.addons_total + total_price
-- ============================================

CREATE OR REPLACE FUNCTION public.fn_sync_addons_total()
RETURNS TRIGGER AS $$
DECLARE
  v_addons_total   NUMERIC;
  v_duration       NUMERIC;
  v_price_per_hour NUMERIC;
BEGIN
  -- Sum all add-ons for this booking
  SELECT COALESCE(SUM(subtotal), 0) INTO v_addons_total
  FROM public.booking_addons
  WHERE booking_id = NEW.booking_id;

  -- Get booking base values
  SELECT duration_hours, price_per_hour
  INTO v_duration, v_price_per_hour
  FROM public.bookings
  WHERE id = NEW.booking_id;

  -- Update booking totals
  UPDATE public.bookings
  SET
    addons_total = v_addons_total,
    total_price  = (v_duration * v_price_per_hour) + v_addons_total
  WHERE id = NEW.booking_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_sync_addons_total
  AFTER INSERT ON public.booking_addons
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_sync_addons_total();