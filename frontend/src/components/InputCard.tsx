import { useState } from 'react'

interface Props {
  onUrl: (url: string) => void
  onFile: (f: File) => void
  loading: boolean
}

export default function InputCard({ onUrl, onFile, loading }: Props) {
  const [url, setUrl] = useState('')
  const [tab, setTab] = useState<'url' | 'screenshot'>('url')
  return (
    <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 shadow-xl">
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab('url')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition
            ${tab==='url' ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
          URL
        </button>
        <button
          onClick={() => setTab('screenshot')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition
            ${tab==='screenshot' ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
          Screenshot
        </button>
      </div>
      {tab === 'url' ? (
        <div className="flex gap-2">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && url) onUrl(url) }}
            placeholder="https://example.com"
            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5
                       text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500" />
          <button
            disabled={!url || loading}
            onClick={() => onUrl(url)}
            className="px-5 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-400
                       disabled:opacity-40 disabled:cursor-not-allowed font-medium">
            {loading ? 'Analyzing…' : 'Analyze'}
          </button>
        </div>
      ) : (
        <label className="block cursor-pointer">
          <input
            type="file" accept="image/*"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f) }} />
          <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500
                          rounded-xl p-8 text-center transition">
            <div className="text-slate-300 font-medium">Drop a screenshot or click to upload</div>
            <div className="text-slate-500 text-sm mt-1">PNG, JPG · analyzed by Gemini vision</div>
          </div>
        </label>
      )}
    </div>
  )
}
