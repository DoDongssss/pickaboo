import { useMatchStore } from '../../store'
import { matchStatusBadge } from '../../components/ui/Badge'

export function AdminMatches() {
  const { matches } = useMatchStore()

  const live     = matches.filter(m => m.status === 'LIVE')
  const waiting  = matches.filter(m => m.status === 'WAITING')
  const finished = matches.filter(m => m.status === 'FINISHED')

  return (
    <div className="animate-slide-up">
      <div className="mb-6">
        <h1 className="font-display text-2xl text-text-1 mb-1">Match Monitoring</h1>
        <p className="text-sm text-text-2">Track all matches in real-time.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Live',     value: live.length,     color: 'text-accent'         },
          { label: 'Waiting',  value: waiting.length,  color: 'text-status-warning' },
          { label: 'Finished', value: finished.length, color: 'text-text-2'         },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center">
            <p className={`font-display text-4xl ${s.color}`}>{s.value}</p>
            <p className="text-xs text-text-2 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Live matches highlighted */}
      {live.length > 0 && (
        <>
          <p className="section-label">Live now</p>
          <div className="flex flex-col gap-3 mb-8">
            {live.map(m => {
              const latest = m.scores.at(-1)
              const teamA  = m.players.filter(p => p.team === 'A').map(p => p.user?.name.split(' ')[0]).join(' & ')
              const teamB  = m.players.filter(p => p.team === 'B').map(p => p.user?.name.split(' ')[0]).join(' & ')
              return (
                <div key={m.id} className="card border-accent/30 bg-accent-soft/20 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold text-text-1">{m.court?.name ?? 'Free Match'}</p>
                      <p className="text-xs text-text-2">Set {m.scores.length} · {m.players.length} players</p>
                    </div>
                    {matchStatusBadge(m.status)}
                  </div>
                  <div className="flex items-center justify-center gap-8">
                    <div className="text-center">
                      <p className="text-xs text-text-2 mb-1">{teamA || 'Team A'}</p>
                      <span className="font-display text-4xl text-accent">{latest?.team_a_score ?? 0}</span>
                    </div>
                    <span className="text-border-strong text-xl">—</span>
                    <div className="text-center">
                      <p className="text-xs text-text-2 mb-1">{teamB || 'Team B'}</p>
                      <span className="font-display text-4xl text-text-1">{latest?.team_b_score ?? 0}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* All matches table */}
      <p className="section-label">All matches</p>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-bg-surface2 border-b border-border">
                {['Court / Type', 'Players', 'Score', 'Sets', 'Status', 'Started'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-text-3 uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matches.map(m => {
                const latest = m.scores.at(-1)
                return (
                  <tr key={m.id} className="border-b border-border last:border-0 hover:bg-bg-surface2 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-text-1">{m.court?.name ?? 'Free Match'}</p>
                      <span className="text-[10px] px-1.5 py-0.5 bg-bg-surface2 text-text-3 rounded-full">{m.type}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-2">{m.players.length} players</td>
                    <td className="px-4 py-3 text-sm font-medium text-text-1">
                      {latest ? `${latest.team_a_score} – ${latest.team_b_score}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-text-2">{m.scores.length}</td>
                    <td className="px-4 py-3">{matchStatusBadge(m.status)}</td>
                    <td className="px-4 py-3 text-xs text-text-2">
                      {m.started_at
                        ? new Date(m.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}