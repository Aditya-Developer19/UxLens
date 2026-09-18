import type { Issue } from '../lib/api'

const SEV = {
  critical: { dot: 'bg-rose-500', label: 'CRITICAL', text: 'text-rose-400' },
  high:     { dot: 'bg-orange-500', label: 'HIGH',   text: 'text-orange-400' },
  medium:   { dot: 'bg-amber-500', label: 'MEDIUM', text: 'text-amber-400' },
  low:      { dot: 'bg-sky-500',   label: 'LOW',    text: 'text-sky-400' },
} as const

export default function IssueList({ issues }: { issues: Issue[] }) {
  if (!issues.length) {
    return (
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 text-center text-slate-400">
        No issues detected. Nice.
      </div>
    )
  }
  const order = ['critical','high','medium','low'] as const
  const sorted = [...issues].sort((a, b) => order.indexOf(a.severity) - order.indexOf(b.severity))
  return (
    <div className="rounded-2xl bg-slate-900/60 border border-slate-800 divide-y divide-slate-800">
      {sorted.map((i) => {
        const s = SEV[i.severity]
        return (
          <div key={i.id} className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-2 h-2 rounded-full ${s.dot}`} />
              <span className={`text-xs font-semibold tracking-wide ${s.text}`}>{s.label}</span>
              <span className="text-xs text-slate-500 uppercase">· {i.category}</span>
            </div>
            <div className="font-semibold text-slate-100">{i.title}</div>
            <div className="text-sm text-slate-400 mt-1">{i.evidence}</div>
            <div className="text-sm text-indigo-300 mt-2">
              <span className="text-slate-500">Fix: </span>{i.suggestion}
            </div>
          </div>
        )
      })}
    </div>
  )
}
