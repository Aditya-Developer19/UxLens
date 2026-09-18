export type Severity = 'critical' | 'high' | 'medium' | 'low'
export interface Issue {
  id: string; title: string; category: string;
  severity: Severity; evidence: string; suggestion: string;
}
export interface Scores {
  overall: number; visual: number; accessibility: number;
  navigation: number; content: number; mobile: number; interaction: number;
}
export interface AuditResponse {
  source: 'url' | 'screenshot'
  url?: string
  scores: Scores
  issues: Issue[]
  summary: string
  screenshots: Record<string, string>
}

const BASE = '/api'

export async function auditUrl(url: string): Promise<AuditResponse> {
  const r = await fetch(`${BASE}/audit/url`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  })
  if (!r.ok) throw new Error(await r.text())
  return r.json()
}

export async function auditScreenshot(file: File): Promise<AuditResponse> {
  const fd = new FormData()
  fd.append('file', file)
  const r = await fetch(`${BASE}/audit/screenshot`, { method: 'POST', body: fd })
  if (!r.ok) throw new Error(await r.text())
  return r.json()
}

export async function generateRedesign(issues: Issue[], context = ''): Promise<string> {
  const r = await fetch(`${BASE}/redesign`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ issues, context }),
  })
  if (!r.ok) throw new Error(await r.text())
  const j = await r.json()
  return j.html as string
}
