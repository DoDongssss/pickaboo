import { supabase } from '../lib/supabase'

export type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'alltime'

export interface LeaderboardEntry {
  user_id:       string
  name:          string
  avatar_url:    string | null
  skill_level:   string
  wins:          number
  total_matches: number
  losses:        number
  win_rate:      number   // 0–100
  rank:          number
}

// ── Get start date for each period ──────────────────

function getPeriodStart(period: TimePeriod): string | null {
  if (period === 'alltime') return null

  const now = new Date()

  if (period === 'daily') {
    // Start of today in local time
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    return start.toISOString()
  }

  if (period === 'weekly') {
    // Start of this week (Monday)
    const day   = now.getDay()             // 0 = Sun
    const diff  = day === 0 ? -6 : 1 - day // go back to Monday
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diff)
    return start.toISOString()
  }

  if (period === 'monthly') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    return start.toISOString()
  }

  return null
}

// ── All-time leaderboard — from player_stats ─────────

async function getAllTimeLeaderboard(): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('player_stats')
    .select(`
      user_id,
      wins,
      total_matches,
      losses,
      users ( name, avatar_url, skill_level )
    `)
    .gt('total_matches', 0)
    .order('wins', { ascending: false })

  if (error) throw error

  return (data ?? []).map((row: any, i: number) => ({
    user_id:       row.user_id,
    name:          row.users?.name       ?? 'Unknown',
    avatar_url:    row.users?.avatar_url ?? null,
    skill_level:   row.users?.skill_level ?? 'beginner',
    wins:          row.wins,
    total_matches: row.total_matches,
    losses:        row.losses,
    win_rate:      row.total_matches > 0
      ? Math.round((row.wins / row.total_matches) * 100)
      : 0,
    rank: i + 1,
  }))
}

// ── Period leaderboard — computed from match history ──

async function getPeriodLeaderboard(
  periodStart: string
): Promise<LeaderboardEntry[]> {
  // Fetch all FINISHED matches in the period with players + scores
  const { data: matches, error } = await supabase
    .from('matches')
    .select(`
      id,
      match_scores ( team_a_score, team_b_score ),
      match_players ( user_id, team,
        users ( name, avatar_url, skill_level )
      )
    `)
    .eq('status', 'FINISHED')
    .gte('ended_at', periodStart)

  if (error) throw error
  if (!matches || matches.length === 0) return []

  // Aggregate per user
  const map = new Map<string, {
    name:          string
    avatar_url:    string | null
    skill_level:   string
    wins:          number
    total_matches: number
    losses:        number
  }>()

  for (const match of matches as any[]) {
    // Determine winning team for this match
    const totalA = (match.match_scores ?? []).reduce(
      (s: number, sc: any) => s + (sc.team_a_score ?? 0), 0
    )
    const totalB = (match.match_scores ?? []).reduce(
      (s: number, sc: any) => s + (sc.team_b_score ?? 0), 0
    )

    let winningTeam: 'A' | 'B' | null = null
    if (totalA > totalB) winningTeam = 'A'
    else if (totalB > totalA) winningTeam = 'B'

    for (const player of match.match_players ?? []) {
      const uid  = player.user_id
      const name = player.users?.name       ?? 'Unknown'
      const av   = player.users?.avatar_url ?? null
      const sl   = player.users?.skill_level ?? 'beginner'

      if (!map.has(uid)) {
        map.set(uid, {
          name, avatar_url: av, skill_level: sl,
          wins: 0, total_matches: 0, losses: 0,
        })
      }

      const entry = map.get(uid)!
      entry.total_matches += 1

      if (winningTeam === null) {
        // Draw — no win or loss
      } else if (player.team === winningTeam) {
        entry.wins += 1
      } else {
        entry.losses += 1
      }
    }
  }

  // Convert to array, sort by wins desc then win_rate desc
  const entries: LeaderboardEntry[] = Array.from(map.entries())
    .map(([user_id, e]) => ({
      user_id,
      ...e,
      win_rate: e.total_matches > 0
        ? Math.round((e.wins / e.total_matches) * 100)
        : 0,
      rank: 0,
    }))
    .sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins
      return b.win_rate - a.win_rate
    })

  // Assign ranks
  entries.forEach((e, i) => { e.rank = i + 1 })

  return entries
}

// ── Main export ──────────────────────────────────────

export async function getLeaderboard(
  period: TimePeriod
): Promise<LeaderboardEntry[]> {
  if (period === 'alltime') {
    return getAllTimeLeaderboard()
  }
  const start = getPeriodStart(period)!
  return getPeriodLeaderboard(start)
}