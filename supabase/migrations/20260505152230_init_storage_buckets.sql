-- ============================================
-- STORAGE BUCKETS
-- ============================================

-- Payment proof images
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', false);

-- Court images (public so anyone can view court photos)
INSERT INTO storage.buckets (id, name, public)
VALUES ('court-images', 'court-images', true);