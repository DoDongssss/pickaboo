-- ============================================
-- ADD-ONS CATALOG
-- Global, managed by admin
-- ============================================

CREATE TABLE public.addons (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  price       NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- BOOKING LOCKS
-- Holds a slot for 10-15 min during checkout
-- ============================================

CREATE TABLE public.booking_locks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  court_id     UUID NOT NULL REFERENCES public.courts(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  start_time   TIME NOT NULL,
  end_time     TIME NOT NULL,
  expires_at   TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '15 minutes')
);

-- ============================================
-- BOOKINGS
-- ============================================

CREATE TYPE public.booking_status AS ENUM (
  'PENDING_PAYMENT',
  'FOR_VERIFICATION',
  'CONFIRMED',
  'CANCELLED'
);

CREATE TABLE public.bookings (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  court_id            UUID NOT NULL REFERENCES public.courts(id) ON DELETE CASCADE,

  -- Schedule
  booking_date        DATE NOT NULL,
  start_time          TIME NOT NULL,
  end_time            TIME NOT NULL,
  duration_hours      NUMERIC(5, 2) NOT NULL,

  -- Pricing (all snapshotted at booking time)
  price_per_hour      NUMERIC(10, 2) NOT NULL,
  addons_total        NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  total_price         NUMERIC(10, 2) NOT NULL,

  -- Status
  status              public.booking_status NOT NULL DEFAULT 'PENDING_PAYMENT',

  -- Payment
  payment_proof_url   TEXT,
  payment_reference   TEXT,

  -- Expiry
  expires_at          TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '15 minutes'),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent double booking at DB level
  CONSTRAINT no_time_overlap EXCLUDE USING gist (
    court_id WITH =,
    booking_date WITH =,
    tsrange(
      (booking_date + start_time)::TIMESTAMP,
      (booking_date + end_time)::TIMESTAMP
    ) WITH &&
  ) WHERE (status != 'CANCELLED')
);

-- ============================================
-- BOOKING ADD-ONS
-- Line items per booking
-- ============================================

CREATE TABLE public.booking_addons (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  addon_id   UUID NOT NULL REFERENCES public.addons(id) ON DELETE RESTRICT,
  quantity   INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price NUMERIC(10, 2) NOT NULL,  -- snapshot at booking time
  subtotal   NUMERIC(10, 2) NOT NULL,  -- quantity × unit_price
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);