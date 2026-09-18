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
    <div className="min-h-full">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500" />
          <div>
            <div className="font-bold text-lg tracking-tight">UXLens</div>
            <div className="text-xs text-slate-500 -mt-0.5">AI Website UX Auditor</div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <InputCard
          onUrl={(u) => run(() => auditUrl(u))}
          onFile={(f) => run(() => auditScreenshot(f))}
          loading={loading} />

        {err && (
          <div className="rounded-xl bg-rose-950/40 border border-rose-800 p-4 text-rose-300 text-sm">
            {err}
          </div>
        )}

        {loading && (
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-10 text-center text-slate-400">
            Extracting features, running rules, and reasoning…
          </div>
        )}

        {res && (
          <>
            <ScoreCard scores={res.scores} summary={res.summary} />

            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4">
                <div className="flex gap-2 mb-3">
                  {Object.keys(res.screenshots || {}).map((k) => (
                    <button key={k}
                      onClick={() => setTab(k as any)}
                      className={`px-2.5 py-1 rounded text-xs
                        ${tab===k?'bg-indigo-500 text-white':'bg-slate-800 text-slate-300'}`}>
                      {k}
                    </button>
                  ))}
                </div>
                {res.screenshots?.[tab] ? (
                  <img alt={tab}
                    src={`data:image/png;base64,${res.screenshots[tab]}`}
                    className="w-full rounded-lg border border-slate-800" />
                ) : <div className="text-slate-500 text-sm">No screenshot.</div>}
              </div>

              <IssueList issues={res.issues} />
            </div>

            <RedesignPanel issues={res.issues} context={res.url || ''} />
          </>
        )}

        {!res && !loading && !err && (
          <div className="rounded-2xl border border-dashed border-slate-800 p-10 text-center text-slate-500">
            Enter a URL or upload a screenshot to get a UX audit.
          </div>
        )}
      </main>

      <footer className="max-w-6xl mx-auto px-6 py-8 text-xs text-slate-600">
        UXLens · deterministic feature extraction + Gemini vision (screenshots) + Groq reasoning
      </footer>
    </div>
  )
}
