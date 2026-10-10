import type { Issue } from '../lib/api'

const SEV = {
  critical: {
    dot: 'bg-rose-500',
    badge: 'bg-rose-500/15 text-rose-300 border-rose-500/20',
    label: 'Critical',
    icon: '🔴',
    border: 'border-l-rose-500',
  },
  high: {
    dot: 'bg-orange-500',
    badge: 'bg-orange-500/15 text-orange-300 border-orange-500/20',
    label: 'High',
    icon: '🟠',
    border: 'border-l-orange-500',
  },
  medium: {
    dot: 'bg-amber-500',
    badge: 'bg-amber-500/15 text-amber-300 border-amber-500/20',
    label: 'Medium',
    icon: '🟡',
    border: 'border-l-amber-500',
  },
  low: {
    dot: 'bg-sky-500',
    badge: 'bg-sky-500/15 text-sky-300 border-sky-500/20',
    label: 'Low',
    icon: '🔵',
    border: 'border-l-sky-500',
  },
} as const

export default function IssueList({ issues }: { issues: Issue[] }) {
  if (!issues.length) {
    return (
      <div className="glass-card rounded-3xl p-10 flex flex-col items-center justify-center text-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 flex items-center justify-center text-2xl mb-1">
          ✅
        </div>
        <div className="font-semibold text-emerald-300">No issues detected</div>
        <div className="text-slate-500 text-sm">This page has excellent UX standards. Nice work!</div>
      </div>
    )
  }

  const order = ['critical','high','medium','low'] as const
  const sorted = [...issues].sort((a, b) => order.indexOf(a.severity) - order.indexOf(b.severity))

  // Count by severity
  const counts = order.reduce((acc, s) => ({
    ...acc,
    [s]: sorted.filter(i => i.severity === s).length
  }), {} as Record<string, number>)

  return (
    <div className="glass-card rounded-3xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-slate-800/50">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 rounded-md bg-rose-500/20 flex items-center justify-center">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgb(251,113,133)" strokeWidth="2.5" strokeLinecap="round">
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Issues Found</span>
          <span className="ml-auto text-xs font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded-full">
            {issues.length}
          </span>
        </div>
        {/* severity summary pills */}
        <div className="flex flex-wrap gap-1.5">
          {order.filter(s => counts[s] > 0).map(s => {
            const cfg = SEV[s]
            return (
              <span key={s} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cfg.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                {counts[s]} {cfg.label}
              </span>
            )
          })}
        </div>
      </div>

      {/* Issue list */}
      <div className="overflow-y-auto max-h-[480px] divide-y divide-slate-800/40">
        {sorted.map((issue, idx) => {
          const s = SEV[issue.severity]
          return (
            <div key={issue.id}
              className={`px-5 py-4 border-l-2 ${s.border} hover:bg-slate-800/20 transition-colors duration-150`}
              style={{ animationDelay: `${idx * 50}ms` }}>
              {/* Badge row */}
              <div className="flex items-center gap-2 mb-2">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${s.badge}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                  {s.label.toUpperCase()}
                </span>
                <span className="text-[10px] text-slate-600 font-medium uppercase tracking-wide">{issue.category}</span>
              </div>
              {/* Title */}
              <div className="font-semibold text-slate-100 text-sm leading-snug">{issue.title}</div>
              {/* Evidence */}
              <div className="text-xs text-slate-500 mt-1.5 leading-relaxed">{issue.evidence}</div>
              {/* Fix */}
              <div className="mt-2.5 flex items-start gap-1.5 text-xs">
                <span className="shrink-0 mt-0.5">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(99,102,241,0.7)" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                  </svg>
                </span>
                <span className="text-indigo-300/80 leading-relaxed">{issue.suggestion}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
