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
    <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-slate-100">AI Redesign (optional)</h3>
          <p className="text-xs text-slate-500">Generates an improved hero/CTA/nav snippet addressing detected issues.</p>
        </div>
        <button
          disabled={loading || !issues.length}
          onClick={go}
          className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400
                     disabled:opacity-40 text-sm font-medium">
          {loading ? 'Generating…' : html ? 'Regenerate' : 'Generate'}
        </button>
      </div>
      {err && <div className="text-rose-400 text-sm">{err}</div>}
      {html && (
        <iframe
          className="w-full h-[500px] bg-white rounded-lg border border-slate-800 mt-2"
          sandbox="allow-same-origin"
          srcDoc={html} />
      )}
    </div>
  )
}
