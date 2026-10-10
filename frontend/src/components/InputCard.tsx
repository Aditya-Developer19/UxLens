import { useState, useRef } from 'react'

interface Props {
  onUrl: (url: string) => void
  onFile: (f: File) => void
  loading: boolean
}

export default function InputCard({ onUrl, onFile, loading }: Props) {
  const [url, setUrl] = useState('')
  const [tab, setTab] = useState<'url' | 'screenshot'>('url')
  const [dragging, setDragging] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFile(f: File) {
    setFileName(f.name)
    onFile(f)
  }

  return (
    <div className="glass-card-bright rounded-3xl p-6 glow-purple fade-in-up">
      {/* Tab switcher */}
      <div className="flex gap-1 mb-6 bg-slate-900/60 rounded-xl p-1 w-fit">
        {(['url', 'screenshot'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
              ${tab === t
                ? 'bg-gradient-to-r from-violet-600 to-indigo-500 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
              }`}>
            {t === 'url' ? (
              <span className="flex items-center gap-1.5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
                URL
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                Screenshot
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 'url' ? (
        <div className="flex gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(148,163,184,0.5)" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && url) onUrl(url) }}
              placeholder="https://example.com"
              className="input-ring w-full bg-slate-950/70 border border-slate-700/50 rounded-xl pl-10 pr-4 py-3
                         text-slate-100 placeholder-slate-600 text-sm focus:outline-none" />
          </div>
          <button
            id="analyze-btn"
            disabled={!url || loading}
            onClick={() => onUrl(url)}
            className="btn-lift px-6 py-3 rounded-xl font-semibold text-sm
                       bg-gradient-to-r from-violet-600 to-indigo-500
                       disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none
                       text-white whitespace-nowrap flex items-center gap-2">
            {loading ? (
              <>
                <svg className="spinner w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                </svg>
                Analyzing…
              </>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/>
                </svg>
                Analyze
              </>
            )}
          </button>
        </div>
      ) : (
        <label className="block cursor-pointer">
          <input
            ref={fileRef}
            type="file" accept="image/*"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault(); setDragging(false)
              const f = e.dataTransfer.files?.[0]
              if (f && f.type.startsWith('image/')) handleFile(f)
            }}
            className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-200
              ${dragging
                ? 'border-violet-400 bg-violet-500/8'
                : fileName
                  ? 'border-emerald-500/40 bg-emerald-500/5'
                  : 'border-slate-700/60 hover:border-violet-500/40 hover:bg-violet-500/4'
              }`}>
            <div className={`w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center
              ${fileName ? 'bg-emerald-500/15' : 'bg-slate-800'}`}>
              {fileName ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgb(52,211,153)" strokeWidth="2" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(148,163,184,0.6)" strokeWidth="1.8" strokeLinecap="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
              )}
            </div>
            {fileName ? (
              <>
                <div className="text-emerald-300 font-semibold text-sm">{fileName}</div>
                <div className="text-slate-500 text-xs mt-1">Click to change file</div>
              </>
            ) : (
              <>
                <div className="text-slate-200 font-semibold">Drop a screenshot or click to browse</div>
                <div className="text-slate-500 text-sm mt-1">PNG, JPG, WEBP · Analyzed by Gemini Vision</div>
              </>
            )}
          </div>
        </label>
      )}
    </div>
  )
}
