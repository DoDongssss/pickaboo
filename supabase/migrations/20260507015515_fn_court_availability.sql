-- ============================================
-- FUNCTION: get_court_availability
-- Returns free time windows for a court/date
-- Usable via RPC from frontend:
--   supabase.rpc('get_court_availability', {...})
-- ============================================

CREATE OR REPLACE FUNCTION public.get_court_availability(
  p_court_id    UUID,
  p_date        DATE
)
RETURNS TABLE (
  window_start TIME,
  window_end   TIME
) AS $$
DECLARE
  v_open_time  TIME;
  v_close_time TIME;
BEGIN
  -- Get court operating hours
  SELECT open_time, close_time
  INTO v_open_time, v_close_time
  FROM public.courts
  WHERE id = p_court_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Court not found: %', p_court_id;
  END IF;

  -- Return free windows by subtracting occupied slots
  RETURN QUERY
  WITH occupied AS (
    -- Confirmed/pending bookings
    SELECT start_time AS slot_start, end_time AS slot_end
    FROM public.bookings
    WHERE court_id = p_court_id
      AND booking_date = p_date
      AND status != 'CANCELLED'

    UNION ALL

    -- Active locks
    SELECT start_time, end_time
    FROM public.booking_locks
    WHERE court_id = p_court_id
      AND booking_date = p_date
      AND expires_at > NOW()
  ),
  boundaries AS (
    -- Build a sorted list of all time boundaries
    SELECT DISTINCT boundary
    FROM (
      SELECT v_open_time AS boundary
      UNION ALL
      SELECT v_close_time
      UNION ALL
      SELECT slot_start FROM occupied
      UNION ALL
      SELECT slot_end   FROM occupied
    ) b
    WHERE boundary BETWEEN v_open_time AND v_close_time
    ORDER BY boundary
  ),
  windows AS (
    -- Pair each boundary with the next to form candidate windows
    SELECT
      boundary                                          AS w_start,
      LEAD(boundary) OVER (ORDER BY boundary)           AS w_end
    FROM boundaries
  )
  -- Keep only windows that are fully free
  SELECT w_start, w_end
  FROM windows
  WHERE w_end IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM occupied
      WHERE slot_start < w_end
        AND slot_end   > w_start
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;