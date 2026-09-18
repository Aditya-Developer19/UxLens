"""ONE Groq call adds narrative reasoning on top of deterministic rules.
Optional second call generates a redesign HTML snippet."""
import json
from groq import Groq
from ..config import GROQ_API_KEY, GROQ_MODEL
from ..models import Features, Issue, Scores

REASON_SYS = """You are a senior UX auditor. You receive DETERMINISTIC evidence
(measurements + rule-based issues). Write a concise 2-3 sentence executive summary
grounded ONLY in the evidence given. Do not invent issues that are not in the input.
Return JSON: {"summary": "..."}"""

def _evidence_payload(f: Features, scores: Scores, issues: list[Issue]) -> str:
    return json.dumps({
        "source": f.source, "url": f.url,
        "scores": scores.model_dump(),
        "measurements": {
            "contrast_failures": f.contrast_failures,
            "small_touch_targets": f.small_touch_targets,
            "overflow_elements": f.overflow_elements,
            "forms_field_counts": f.forms_field_counts,
            "nav_item_count": f.nav_item_count,
            "cta_prominence": f.cta_prominence,
            "above_fold_cta": f.above_fold_cta,
            "heading_hierarchy_ok": f.heading_hierarchy_ok,
            "font_families": f.font_families,
            "readability_flesch": f.readability_flesch,
        },
        "issues": [i.model_dump() for i in issues],
    }, ensure_ascii=False)

def summarize(f: Features, scores: Scores, issues: list[Issue]) -> str:
    if not GROQ_API_KEY:
        crit = sum(1 for i in issues if i.severity == "critical")
        high = sum(1 for i in issues if i.severity == "high")
        return (f"Overall UX score {scores.overall}/100. "
                f"{crit} critical, {high} high-severity issues detected across accessibility, layout, and content.")
    client = Groq(api_key=GROQ_API_KEY)
    payload = _evidence_payload(f, scores, issues)
    try:
        resp = client.chat.completions.create(
            model=GROQ_MODEL, temperature=0.2,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": REASON_SYS},
                {"role": "user", "content": payload},
            ],
        )
        data = json.loads(resp.choices[0].message.content)
        return data.get("summary", "").strip() or "Audit complete."
    except Exception as e:
        return f"Overall UX score {scores.overall}/100. {len(issues)} issues detected."

REDESIGN_SYS = """You are a UI designer. Given a list of UX issues, produce a single
self-contained HTML snippet (with inline <style>) that demonstrates a REDESIGNED
hero + primary CTA + navigation that fixes the listed issues. Use only inline CSS,
no external assets, no scripts. Keep it under 200 lines. Return JSON:
{"html": "<html-snippet>"}"""

def redesign(issues: list[Issue], context: str = "") -> str:
    if not GROQ_API_KEY:
        return "<div style='padding:2rem;font-family:system-ui'>Set GROQ_API_KEY to generate a redesign.</div>"
    client = Groq(api_key=GROQ_API_KEY)
    payload = json.dumps({
        "context": context,
        "issues": [i.model_dump() for i in issues],
    }, ensure_ascii=False)
    try:
        resp = client.chat.completions.create(
            model=GROQ_MODEL, temperature=0.4,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": REDESIGN_SYS},
                {"role": "user", "content": payload},
            ],
        )
        data = json.loads(resp.choices[0].message.content)
        return data.get("html", "")
    except Exception as e:
        return f"<div style='padding:2rem;color:#b91c1c'>Redesign failed: {e}</div>"
