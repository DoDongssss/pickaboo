-- ============================================
-- COURTS
-- ============================================

CREATE TABLE public.courts (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  description    TEXT,
  is_active      BOOLEAN NOT NULL DEFAULT true,

  -- Location
  latitude       DECIMAL(9, 6),
  longitude      DECIMAL(9, 6),
  address        TEXT,

  -- Pricing
  price_per_hour NUMERIC(10, 2) NOT NULL DEFAULT 0.00,

  -- Operating Hours
  open_time      TIME NOT NULL DEFAULT '06:00',
  close_time     TIME NOT NULL DEFAULT '22:00',

  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- COURT IMAGES
-- Max 3 per court enforced at app level
-- ============================================

CREATE TABLE public.court_images (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  court_id      UUID NOT NULL REFERENCES public.courts(id) ON DELETE CASCADE,
  image_url     TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 1 CHECK (display_order BETWEEN 1 AND 3),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- COURT AMENITIES
-- ============================================

CREATE TABLE public.court_amenities (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  court_id     UUID NOT NULL REFERENCES public.courts(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  icon         TEXT,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- COURT PRICING OVERRIDES
-- Admin sets special rates for specific dates
-- ============================================

CREATE TABLE public.court_pricing_overrides (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  court_id       UUID NOT NULL REFERENCES public.courts(id) ON DELETE CASCADE,
  override_date  DATE NOT NULL,
  price_per_hour NUMERIC(10, 2) NOT NULL,
  label          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One override per court per date
  UNIQUE (court_id, override_date)
);

