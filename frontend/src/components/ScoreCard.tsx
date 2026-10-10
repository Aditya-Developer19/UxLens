import { useEffect, useRef } from 'react'
import type { Scores } from '../lib/api'

function scoreColor(score: number) {
  if (score >= 80) return { text: 'text-emerald-400', ring: '#34d399', bar: 'from-emerald-500 to-emerald-400', bg: 'bg-emerald-400/10' }
  if (score >= 60) return { text: 'text-amber-400', ring: '#fbbf24', bar: 'from-amber-500 to-amber-400', bg: 'bg-amber-400/10' }
  return { text: 'text-rose-400', ring: '#f87171', bar: 'from-rose-500 to-rose-400', bg: 'bg-rose-400/10' }
}

function ScoreLabel(score: number) {
  if (score >= 80) return 'Excellent'
  if (score >= 60) return 'Good'
  if (score >= 40) return 'Fair'
  return 'Needs Work'
}

function Bar({ label, val, delay = 0 }: { label: string, val: number, delay?: number }) {
  const c = scoreColor(val)
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs font-medium text-slate-400">{label}</span>
        <span className={`text-xs font-bold ${c.text}`}>{val}</span>
      </div>
      <div className="h-1.5 bg-slate-800/80 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${c.bar} bar-animate`}
          style={{ width: `${val}%`, animationDelay: `${delay}ms` }} />
      </div>
    </div>
  )
}

export default function ScoreCard({ scores, summary }: { scores: Scores, summary: string }) {
  const r = 56
  const circumference = 2 * Math.PI * r
  const dash = circumference * (scores.overall / 100)
  const c = scoreColor(scores.overall)

  const dimensions = [
    { label: 'Visual',        val: scores.visual },
    { label: 'Accessibility', val: scores.accessibility },
    { label: 'Navigation',    val: scores.navigation },
    { label: 'Content',       val: scores.content },
    { label: 'Mobile',        val: scores.mobile },
    { label: 'Interaction',   val: scores.interaction },
  ]

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8 glow-indigo">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-5 h-5 rounded-md bg-indigo-500/20 flex items-center justify-center">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" className="text-indigo-400">
            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
          </svg>
        </div>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">UX Report</span>
      </div>

      <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center">
        {/* Circular score */}
        <div className="flex flex-col items-center shrink-0">
          <div className="relative w-36 h-36">
            <svg viewBox="0 0 128 128" className="w-full h-full -rotate-90">
              {/* Track */}
              <circle cx="64" cy="64" r={r} stroke="rgba(30,41,59,0.8)" strokeWidth="10" fill="none" />
              {/* Progress */}
              <circle cx="64" cy="64" r={r}
                stroke={c.ring}
                strokeWidth="10" fill="none" strokeLinecap="round"
                strokeDasharray={`${dash} ${circumference}`}
                style={{
                  filter: `drop-shadow(0 0 6px ${c.ring}60)`,
                  transition: 'stroke-dasharray 0.8s cubic-bezier(0.4,0,0.2,1)'
                }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className={`text-4xl font-black ${c.text}`} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {scores.overall}
              </div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">/ 100</div>
            </div>
          </div>
          <div className={`mt-2 text-sm font-semibold ${c.text}`}>{ScoreLabel(scores.overall)}</div>
          <div className="text-[11px] text-slate-600 mt-0.5">Overall UX Score</div>
        </div>

        {/* Bars */}
        <div className="flex-1 grid grid-cols-1 gap-3 w-full">
          {dimensions.map((d, i) => (
            <Bar key={d.label} label={d.label} val={d.val} delay={i * 80} />
          ))}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className="mt-6 pt-5 border-t border-slate-800/60">
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-7 h-7 rounded-lg bg-violet-500/15 flex items-center justify-center mt-0.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgb(167,139,250)" strokeWidth="2" strokeLinecap="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">{summary}</p>
          </div>
        </div>
      )}
    </div>
  )
}
