-- ============================================
-- ENABLE pg_cron EXTENSION
-- ============================================

CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Grant usage to postgres role
GRANT USAGE ON SCHEMA cron TO postgres;


-- ============================================
-- JOB 1: Auto-expire unpaid bookings
-- Runs every 5 minutes
-- Cancels bookings past expires_at that are
-- still in PENDING_PAYMENT
-- ============================================

SELECT cron.schedule(
  'expire-unpaid-bookings',   -- job name
  '*/5 * * * *',              -- every 5 minutes
  $$
    UPDATE public.bookings
    SET status = 'CANCELLED'
    WHERE status = 'PENDING_PAYMENT'
      AND expires_at < NOW();
  $$
);


-- ============================================
-- JOB 2: Clean up expired booking locks
-- Runs every 5 minutes
-- ============================================

SELECT cron.schedule(
  'cleanup-expired-locks',
  '*/5 * * * *',
  $$
    DELETE FROM public.booking_locks
    WHERE expires_at < NOW();
  $$
);


-- ============================================
-- JOB 3: Nightly stats integrity check
-- Runs at 2:00 AM daily
-- Recomputes player_stats from scratch to
-- fix any drift from trigger failures
-- ============================================

SELECT cron.schedule(
  'nightly-stats-reconcile',
  '0 2 * * *',    -- 2:00 AM every day
  $$
    UPDATE public.player_stats ps
    SET
      total_matches = agg.total,
      wins          = agg.wins,
      losses        = agg.losses,
      updated_at    = NOW()
    FROM (
      SELECT
        mp.user_id,
        COUNT(*)                                              AS total,
        COUNT(*) FILTER (
          WHERE m.status = 'FINISHED'
          AND (
            (mp.team = 'A' AND (
              SELECT COALESCE(SUM(team_a_score),0) FROM match_scores WHERE match_id = m.id
            ) > (
              SELECT COALESCE(SUM(team_b_score),0) FROM match_scores WHERE match_id = m.id
            ))
            OR
            (mp.team = 'B' AND (
              SELECT COALESCE(SUM(team_b_score),0) FROM match_scores WHERE match_id = m.id
            ) > (
              SELECT COALESCE(SUM(team_a_score),0) FROM match_scores WHERE match_id = m.id
            ))
          )
        )                                                     AS wins,
        COUNT(*) FILTER (
          WHERE m.status = 'FINISHED'
          AND (
            (mp.team = 'A' AND (
              SELECT COALESCE(SUM(team_a_score),0) FROM match_scores WHERE match_id = m.id
            ) < (
              SELECT COALESCE(SUM(team_b_score),0) FROM match_scores WHERE match_id = m.id
            ))
            OR
            (mp.team = 'B' AND (
              SELECT COALESCE(SUM(team_b_score),0) FROM match_scores WHERE match_id = m.id
            ) < (
              SELECT COALESCE(SUM(team_a_score),0) FROM match_scores WHERE match_id = m.id
            ))
          )
        )                                                     AS losses
      FROM public.match_players mp
      JOIN public.matches m ON m.id = mp.match_id
      GROUP BY mp.user_id
    ) agg
    WHERE ps.user_id = agg.user_id;
  $$
);