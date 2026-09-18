import type { Scores } from '../lib/api'

function color(score: number) {
  if (score >= 80) return 'text-emerald-400'
  if (score >= 60) return 'text-amber-400'
  return 'text-rose-400'
}
function ringColor(score: number) {
  if (score >= 80) return 'stroke-emerald-400'
  if (score >= 60) return 'stroke-amber-400'
  return 'stroke-rose-400'
}

function Bar({ label, val }: { label: string, val: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-400 mb-1">
        <span>{label}</span><span className={color(val)}>{val}</span>
      </div>
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full ${val>=80?'bg-emerald-400':val>=60?'bg-amber-400':'bg-rose-400'}`}
             style={{ width: `${val}%` }} />
      </div>
    </div>
  )
}

export default function ScoreCard({ scores, summary }: { scores: Scores, summary: string }) {
  const r = 60, c = 2 * Math.PI * r
  const dash = c * (scores.overall / 100)
  return (
    <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6">
      <div className="flex gap-6 items-center">
        <div className="relative w-40 h-40 shrink-0">
          <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
            <circle cx="70" cy="70" r={r} className="stroke-slate-800" strokeWidth="12" fill="none" />
            <circle cx="70" cy="70" r={r} className={ringColor(scores.overall)}
              strokeWidth="12" fill="none" strokeLinecap="round"
              strokeDasharray={`${dash} ${c}`} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className={`text-4xl font-bold ${color(scores.overall)}`}>{scores.overall}</div>
            <div className="text-xs text-slate-500 uppercase tracking-wide">UX Score</div>
          </div>
        </div>
        <div className="flex-1 space-y-2.5">
          <Bar label="Visual"        val={scores.visual} />
          <Bar label="Accessibility" val={scores.accessibility} />
          <Bar label="Navigation"    val={scores.navigation} />
          <Bar label="Content"       val={scores.content} />
          <Bar label="Mobile"        val={scores.mobile} />
          <Bar label="Interaction"   val={scores.interaction} />
        </div>
      </div>
      {summary && (
        <p className="mt-5 text-sm text-slate-300 leading-relaxed border-t border-slate-800 pt-4">
          {summary}
        </p>
      )}
    </div>
  )
}
