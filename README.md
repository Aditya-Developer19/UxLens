# UXLens

**AI-powered website UX auditor.** Accepts a URL or a screenshot, extracts measurable
usability features deterministically, and uses a single grounded LLM call to produce
an executive summary. Optional redesign generation.

- **URL mode** → Playwright captures desktop / tablet / mobile viewports and reads
  element boxes + computed styles directly from the DOM. No ML training.
- **Screenshot mode** → one Gemini 2.5 Flash multimodal call returns element boxes,
  labels, and text.
- **Analysis** → OpenCV / rule-based feature extraction (WCAG contrast, touch-target
  size, viewport overflow, CTA prominence, form length, nav complexity, heading
  hierarchy, font families) + `textstat` readability.
- **Reasoning** → one Groq call (`openai/gpt-oss-120b`) writes a summary grounded in
  the deterministic evidence. The rule engine is the source of truth.
- **Redesign** → optional second Groq call, sandboxed iframe preview.

Total LLM calls per audit: **1** (URL mode) or **2** (screenshot mode).
Plus **+1** if the user clicks "Generate redesign".

---

## Setup

### 1. Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate      # Windows
pip install -r requirements.txt
playwright install chromium
copy .env.example .env
```

Edit `.env` and fill in:

- `GROQ_API_KEY` — free at https://console.groq.com
- `GEMINI_API_KEY` — free at https://aistudio.google.com/apikey (only needed for screenshot mode)

Run:

```bash
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. The Vite dev server proxies `/api/*` to the FastAPI backend.

---

## Architecture

```
User URL / screenshot
        │
        ▼
┌──────────────────────┐
│  Data Acquisition    │  Playwright (URL) │ Gemini vision (screenshot)
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│  Feature Extraction  │  OpenCV + WCAG math + textstat  (deterministic)
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│    Rule Engine       │  Emits typed Issues + weighted scores  (deterministic)
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│  Grounded Reasoning  │  ONE Groq call — narrates evidence, does not invent
└──────────┬───────────┘
           ▼
     Dashboard  ──►  optional: redesign snippet in sandboxed iframe
```

## API

| Method | Path                | Body                          |
|--------|---------------------|-------------------------------|
| POST   | `/audit/url`        | `{ "url": "https://…" }`      |
| POST   | `/audit/screenshot` | `multipart/form-data` (`file`)|
| POST   | `/redesign`         | `{ "issues": [...], "context": "" }` |
| GET    | `/health`           |                               |

## Notes

- All Chromium browsing runs headless.
- If `GROQ_API_KEY` is missing, the summary falls back to a rule-based sentence — the
  audit still runs.
- Screenshot mode requires `GEMINI_API_KEY`; without it the endpoint returns 500.
