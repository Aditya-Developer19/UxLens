import { useState } from 'react'
import InputCard from './components/InputCard'
import ScoreCard from './components/ScoreCard'
import IssueList from './components/IssueList'
import RedesignPanel from './components/RedesignPanel'
import { auditUrl, auditScreenshot, type AuditResponse } from './lib/api'

export default function App() {
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [res, setRes] = useState<AuditResponse | null>(null)
  const [tab, setTab] = useState<'desktop'|'tablet'|'mobile'|'uploaded'>('desktop')

  async function run<T>(fn: () => Promise<AuditResponse>) {
    setLoading(true); setErr(''); setRes(null)
    try {
      const r = await fn()
      setRes(r)
      setTab((r.screenshots?.desktop ? 'desktop' : (Object.keys(r.screenshots || {})[0] as any) || 'desktop'))
    } catch (e: any) { setErr(String(e?.message || e)) }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-full bg-animated">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-white/[0.04]"
        style={{ background: 'rgba(3, 7, 18, 0.8)', backdropFilter: 'blur(24px)' }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo mark */}
            <div className="relative w-9 h-9">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-500 opacity-90" />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 blur-md opacity-40" />
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                  <path d="M11 8v6M8 11h6"/>
                </svg>
              </div>
            </div>
            <div>
              <div className="font-bold text-lg tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                UX<span className="gradient-text-vivid">Lens</span>
              </div>
              <div className="text-[10px] text-slate-500 -mt-0.5 tracking-widest uppercase font-medium">AI UX Auditor</div>
            </div>
          </div>

          {/* Status badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 6px rgba(52, 211, 153, 0.8)' }} />
            <span className="text-[11px] text-emerald-400 font-medium">Powered by Gemini & Groq</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">

        {/* Hero section — only shown before results */}
        {!res && !loading && !err && (
          <div className="text-center py-8 fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/25 bg-violet-500/8 text-violet-300 text-xs font-medium mb-6 tracking-wide">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
              AI-Powered UX Analysis
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1.1 }}>
              Audit any website's<br />
              <span className="gradient-text">UX in seconds</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
              Paste a URL or upload a screenshot. Get scored across 6 dimensions with AI-powered issue detection and redesign suggestions.
            </p>
          </div>
        )}

        <InputCard
          onUrl={(u) => run(() => auditUrl(u))}
          onFile={(f) => run(() => auditScreenshot(f))}
          loading={loading} />

        {/* Error */}
        {err && (
          <div className="fade-in-up rounded-2xl border border-rose-500/20 bg-rose-500/5 p-5 flex gap-3 items-start">
            <div className="shrink-0 w-8 h-8 rounded-xl bg-rose-500/15 flex items-center justify-center mt-0.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgb(251,113,133)" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <div>
              <div className="text-rose-300 font-semibold text-sm mb-0.5">Analysis Failed</div>
              <div className="text-rose-400/80 text-sm">{err}</div>
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="glass-card rounded-3xl p-12 text-center fade-in-up">
            <div className="relative w-16 h-16 mx-auto mb-6">
              <svg className="spinner absolute inset-0 w-16 h-16" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="28" stroke="rgba(99,102,241,0.15)" strokeWidth="4"/>
                <path d="M32 4a28 28 0 0 1 28 28" stroke="url(#spinnerGrad)" strokeWidth="4" strokeLinecap="round"/>
                <defs>
                  <linearGradient id="spinnerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#818cf8"/>
                    <stop offset="100%" stopColor="#c084fc"/>
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(129,140,248,0.7)" strokeWidth="1.8" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
              </div>
            </div>
            <div className="text-slate-200 font-semibold text-lg mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Analyzing UX…
            </div>
            <div className="text-slate-500 text-sm max-w-xs mx-auto leading-relaxed">
              Extracting visual features, running heuristic rules, and reasoning with AI
            </div>
            {/* shimmer bars */}
            <div className="mt-8 space-y-3 max-w-xs mx-auto">
              {[70, 50, 85].map((w, i) => (
                <div key={i} className="h-2 rounded-full shimmer" style={{ width: `${w}%`, margin: '0 auto' }} />
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {res && (
          <>
            <div className="fade-in-up">
              <ScoreCard scores={res.scores} summary={res.summary} />
            </div>

            <div className="grid md:grid-cols-2 gap-6 fade-in-up-delay-1">
              {/* Screenshot viewer */}
              <div className="glass-card rounded-3xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Preview</div>
                  <div className="flex gap-1.5">
                    {Object.keys(res.screenshots || {}).map((k) => (
                      <button key={k}
                        onClick={() => setTab(k as any)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-150
                          ${tab===k
                            ? 'bg-gradient-to-r from-violet-600 to-indigo-500 text-white shadow-lg'
                            : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700/60 hover:text-slate-200'
                          }`}>
                        {k.charAt(0).toUpperCase() + k.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                {res.screenshots?.[tab] ? (
                  <div className="relative rounded-xl overflow-hidden ring-1 ring-white/[0.06]">
                    <img alt={tab}
                      src={`data:image/png;base64,${res.screenshots[tab]}`}
                      className="w-full" />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-40 text-slate-500 text-sm">
                    No screenshot available.
                  </div>
                )}
              </div>

              <IssueList issues={res.issues} />
            </div>

            <div className="fade-in-up-delay-2">
              <RedesignPanel issues={res.issues} context={res.url || ''} />
            </div>
          </>
        )}

        {/* Empty state */}
        {!res && !loading && !err && (
          <div className="fade-in-up-delay-1">
            <div className="grid sm:grid-cols-3 gap-4 mt-2">
              {[
                { icon: '📊', title: 'UX Scoring', desc: '6 dimensions — visual, accessibility, navigation, content, mobile, interaction' },
                { icon: '🔍', title: 'Issue Detection', desc: 'Critical to low severity issues with actionable fix suggestions' },
                { icon: '✨', title: 'AI Redesign', desc: 'Get improved hero, CTA, and nav snippets generated by AI' },
              ].map((item) => (
                <div key={item.title} className="glass-card rounded-2xl p-5 group hover:border-violet-500/20 transition-all duration-200">
                  <div className="text-2xl mb-3">{item.icon}</div>
                  <div className="font-semibold text-slate-200 mb-1.5 text-sm">{item.title}</div>
                  <div className="text-slate-500 text-xs leading-relaxed">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="max-w-6xl mx-auto px-6 py-8 border-t border-white/[0.03] mt-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-600">
            UXLens · deterministic feature extraction + Gemini vision + Groq reasoning
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-700">
            <span>© 2025 UXLens</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
