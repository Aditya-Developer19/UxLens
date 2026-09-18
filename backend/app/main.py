from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .models import UrlAuditRequest, AuditResponse, RedesignRequest
from .analyzers.url_analyzer import analyze_url
from .analyzers.screenshot_analyzer import analyze_screenshot
from .analyzers.rules import build_features, detect_issues, compute_scores
from .analyzers.llm import summarize, redesign

app = FastAPI(title="UXLens API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_methods=["*"], allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"ok": True}

@app.post("/audit/url", response_model=AuditResponse)
async def audit_url(req: UrlAuditRequest):
    url = req.url.strip()
    if not url.startswith(("http://","https://")):
        url = "https://" + url
    try:
        viewports, shots, fonts = await analyze_url(url)
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(500, f"URL crawl failed: {e!r}")
    features = build_features("url", url, viewports, fonts)
    issues = detect_issues(features)
    scores = compute_scores(features, issues)
    summary = summarize(features, scores, issues)
    return AuditResponse(
        source="url", url=url, scores=scores, issues=issues,
        summary=summary, screenshots=shots,
    )

@app.post("/audit/screenshot", response_model=AuditResponse)
async def audit_screenshot(file: UploadFile = File(...)):
    data = await file.read()
    if not data:
        raise HTTPException(400, "empty file")
    try:
        viewports, shots = await analyze_screenshot(data)
    except Exception as e:
        raise HTTPException(500, f"screenshot analysis failed: {e}")
    features = build_features("screenshot", None, viewports, [])
    issues = detect_issues(features)
    scores = compute_scores(features, issues)
    summary = summarize(features, scores, issues)
    return AuditResponse(
        source="screenshot", scores=scores, issues=issues,
        summary=summary, screenshots=shots,
    )

@app.post("/redesign")
def redesign_endpoint(req: RedesignRequest):
    html = redesign(req.issues, req.context)
    return {"html": html}

