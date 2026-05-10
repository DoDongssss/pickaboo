-- ============================================
-- HELPER FUNCTIONS FOR RLS
-- Called inside policies — keeps them clean
-- ============================================

-- Returns the current user's UUID from auth
CREATE OR REPLACE FUNCTION public.auth_uid()
RETURNS UUID AS $$
  SELECT auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Returns true if the current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role = 'admin'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Returns true if the current user is in a specific match
CREATE OR REPLACE FUNCTION public.is_match_participant(match_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.match_players
    WHERE match_id = match_uuid
    AND user_id = auth.uid()
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;