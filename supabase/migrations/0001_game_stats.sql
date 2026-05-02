-- =====================================================================
-- game_stats table for the Calendar Game
-- Run this in your Supabase SQL Editor:
--   https://supabase.com/dashboard/project/llyzmigaidfzthljriwl/sql/new
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.game_stats (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         text NOT NULL UNIQUE,
  games_played    int  NOT NULL DEFAULT 0,
  games_won       int  NOT NULL DEFAULT 0,
  best_time       int  NOT NULL DEFAULT 0,
  current_streak  int  NOT NULL DEFAULT 0,
  longest_streak  int  NOT NULL DEFAULT 0,
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS game_stats_user_id_idx
  ON public.game_stats(user_id);

-- Enable Row Level Security
ALTER TABLE public.game_stats ENABLE ROW LEVEL SECURITY;

-- Clean up any older versions of these policies
DROP POLICY IF EXISTS "anon read by user_id"   ON public.game_stats;
DROP POLICY IF EXISTS "anon insert by user_id" ON public.game_stats;
DROP POLICY IF EXISTS "anon update by user_id" ON public.game_stats;

-- Because this app has no Supabase Auth (we use a localStorage-generated
-- anonymous id), we cannot use auth.uid(). Instead, we require that any
-- row read/written has a non-empty user_id, and the client filters by
-- the locally stored anon id. This is essentially a public/shared bucket
-- keyed by an opaque random uuid — a reasonable trade-off for an
-- anonymous-only puzzle game.
CREATE POLICY "anon read by user_id"
  ON public.game_stats
  FOR SELECT
  TO anon, authenticated
  USING (user_id IS NOT NULL AND length(user_id) > 0);

CREATE POLICY "anon insert by user_id"
  ON public.game_stats
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (user_id IS NOT NULL AND length(user_id) > 0);

CREATE POLICY "anon update by user_id"
  ON public.game_stats
  FOR UPDATE
  TO anon, authenticated
  USING      (user_id IS NOT NULL AND length(user_id) > 0)
  WITH CHECK (user_id IS NOT NULL AND length(user_id) > 0);


-- ---------------------------------------------------------------------
-- IMPORTANT: RLS policies alone are NOT sufficient.
-- Postgres also requires base table-level GRANTs for the `anon` and
-- `authenticated` roles, otherwise PostgREST returns 401 with:
--   "permission denied for table game_stats" (code 42501)
-- This is the actual root cause of stats not syncing to the cloud.
-- ---------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.game_stats TO anon, authenticated;
