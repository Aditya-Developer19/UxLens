import { useState } from 'react'
import type { Issue } from '../lib/api'
import { generateRedesign } from '../lib/api'

export default function RedesignPanel({ issues, context }: { issues: Issue[], context: string }) {
  const [loading, setLoading] = useState(false)
  const [html, setHtml] = useState('')
  const [err, setErr] = useState('')

  async function go() {
    setLoading(true); setErr('')
    try { setHtml(await generateRedesign(issues, context)) }
    catch (e: any) { setErr(String(e?.message || e)) }
    finally { setLoading(false) }
  }

  return (
    <div className="glass-card rounded-3xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-800/50 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-fuchsia-600/30 to-violet-600/30 border border-fuchsia-500/20 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgb(192,132,252)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              AI Redesign Suggestions
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Generates improved hero, CTA & nav snippets addressing detected issues
            </p>
          </div>
        </div>

        <button
          id="generate-redesign-btn"
          disabled={loading || !issues.length}
          onClick={go}
          className={`btn-lift shrink-0 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2
            ${html
              ? 'bg-gradient-to-r from-fuchsia-600 to-violet-500'
              : 'bg-gradient-to-r from-violet-600 to-indigo-500'
            } text-white disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none`}>
          {loading ? (
            <>
              <svg className="spinner w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
              </svg>
              Generating…
            </>
          ) : html ? (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-.08-8.36"/>
              </svg>
              Regenerate
            </>
          ) : (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
              Generate
            </>
          )}
        </button>
      </div>

      {/* Body */}
      <div className="p-6">
        {err && (
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 flex items-start gap-2.5 mb-4">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgb(251,113,133)" strokeWidth="2" strokeLinecap="round" className="shrink-0 mt-0.5">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span className="text-rose-400 text-sm">{err}</span>
          </div>
        )}

        {!html && !loading && (
          <div className="py-8 text-center">
            <div className="text-4xl mb-3">✨</div>
            <div className="text-slate-400 text-sm">Click <span className="text-violet-300 font-medium">Generate</span> to get AI-powered redesign suggestions based on the detected issues.</div>
          </div>
        )}

        {html && (
          <div className="rounded-2xl overflow-hidden ring-1 ring-white/[0.06]">
            <div className="bg-slate-900/60 border-b border-slate-800/50 px-4 py-2 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500/70" />
                <div className="w-3 h-3 rounded-full bg-amber-500/70" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
              </div>
              <span className="text-[11px] text-slate-600 font-mono ml-2">AI Redesign Preview</span>
            </div>
            <iframe
              className="w-full h-[520px] bg-white"
              sandbox="allow-same-origin"
              srcDoc={html} />
          </div>
        )}
      </div>
    </div>
  )
}
