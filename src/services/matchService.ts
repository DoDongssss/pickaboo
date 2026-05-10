import { supabase } from '../lib/supabase'
import type {
  Match,
  MatchWithDetails,
  Team,
  PlayerRole,
} from '../types/database.types'
import type { MatchScore } from '../types'

// ── Create a new match ──

export function subscribeToMatchScores(
  matchId:  string,
  onUpdate: (score: MatchScore) => void
): () => void {
  const channel = supabase
    .channel(`match-scores-${matchId}`)
    .on(
      'postgres_changes',
      {
        event:  '*',
        schema: 'public',
        table:  'match_scores',
        filter: `match_id=eq.${matchId}`,
      },
      payload => onUpdate(payload.new as MatchScore)
    )
    .subscribe()

  return () => supabase.removeChannel(channel)
}

export async function createMatch(params: {
  type: 'COURT' | 'FREE'
  courtId?: string
  bookingId?: string
}): Promise<Match> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('matches')
    .insert({
      type: params.type,
      court_id: params.courtId ?? null,
      booking_id: params.bookingId ?? null,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) throw error
  return data as Match
}

// ── Add a player to a match ──

export async function addMatchPlayer(
  matchId: string,
  userId: string,
  team: Team,
  role: PlayerRole = 'player'
): Promise<void> {
  const { error } = await supabase
    .from('match_players')
    .insert({ match_id: matchId, user_id: userId, team, role })

  if (error) throw error
}

// ── Start a match ──

export async function startMatch(matchId: string): Promise<void> {
  const { error } = await supabase
    .from('matches')
    .update({ status: 'LIVE', started_at: new Date().toISOString() })
    .eq('id', matchId)

  if (error) throw error
}

// ── End a match ──

export async function endMatch(matchId: string): Promise<void> {
  const { error } = await supabase
    .from('matches')
    .update({ status: 'FINISHED', ended_at: new Date().toISOString() })
    .eq('id', matchId)

  if (error) throw error
}

// ── Upsert score for a set ──
// Insert if set doesn't exist, update if it does

export async function upsertScore(
  matchId: string,
  setNumber: number,
  teamAScore: number,
  teamBScore: number
): Promise<void> {
  const { error } = await supabase
    .from('match_scores')
    .upsert(
      {
        match_id: matchId,
        set_number: setNumber,
        team_a_score: teamAScore,
        team_b_score: teamBScore,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'match_id,set_number' }
    )

  if (error) throw error
}

// ── Fetch all matches ──

export async function getMatches(): Promise<MatchWithDetails[]> {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      match_players (
        *,
        user: users ( id, name, avatar_url, skill_level )
      ),
      match_scores ( * )
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as MatchWithDetails[]
}

// ── Fetch only LIVE matches (public scoreboard) ──

export async function getLiveMatches(): Promise<MatchWithDetails[]> {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      match_players (
        *,
        user: users ( id, name, avatar_url, skill_level )
      ),
      match_scores ( * )
    `)
    .eq('status', 'LIVE')
    .order('started_at', { ascending: false })

  if (error) throw error
  return data as MatchWithDetails[]
}

// ── Fetch single match ──

export async function getMatchById(matchId: string): Promise<MatchWithDetails> {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      match_players (
        *,
        user: users ( id, name, avatar_url, skill_level )
      ),
      match_scores ( * )
    `)
    .eq('id', matchId)
    .single()

  if (error) throw error
  return data as MatchWithDetails
}