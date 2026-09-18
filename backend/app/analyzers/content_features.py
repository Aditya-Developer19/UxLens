import textstat
from ..models import Viewport

def collect_text(vp: Viewport) -> str:
    parts = []
    for e in vp.elements:
        if e.text and len(e.text) > 3:
            parts.append(e.text)
    return " ".join(parts)

def readability(text: str) -> float:
    if len(text.split()) < 20:
        return 70.0
    try:
        return float(textstat.flesch_reading_ease(text))
    except Exception:
        return 60.0
