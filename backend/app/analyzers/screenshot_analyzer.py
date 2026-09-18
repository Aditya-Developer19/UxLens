import base64, io, json, re
from PIL import Image
from google import genai
from google.genai import types
from ..config import GEMINI_API_KEY, GEMINI_MODEL
from ..models import Viewport, Element

SYSTEM = """You are a UI parser. Given a website screenshot, return STRICT JSON:
{
 "width": int, "height": int,
 "elements": [
   {"tag":"button|link|input|nav|heading|image|card|form|icon|cta|paragraph|footer",
    "text":"visible text (<=140 chars)",
    "x":int,"y":int,"w":int,"h":int,
    "color":"#hex or rgb()","bg":"#hex or rgb()",
    "font_size":int}
 ]
}
Coordinates in pixels relative to the image top-left. Return at most 80 elements.
Focus on interactive elements and prominent content blocks. Output JSON ONLY, no prose."""

def _parse_json(txt: str) -> dict:
    m = re.search(r"\{[\s\S]*\}", txt)
    if not m: raise ValueError("no json in gemini response")
    return json.loads(m.group(0))

async def analyze_screenshot(image_bytes: bytes) -> tuple[list[Viewport], dict[str, str]]:
    if not GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY not set")
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    w, h = img.size
    client = genai.Client(api_key=GEMINI_API_KEY)
    resp = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=[
            types.Part.from_bytes(data=image_bytes, mime_type="image/png"),
            SYSTEM,
        ],
        config=types.GenerateContentConfig(
            temperature=0.1,
            response_mime_type="application/json",
        ),
    )
    try:
        data = json.loads(resp.text)
    except Exception:
        data = _parse_json(resp.text)
    elements = []
    for e in data.get("elements", [])[:120]:
        try:
            elements.append(Element(
                tag=str(e.get("tag","")).lower(),
                role=str(e.get("tag","")).lower(),
                text=str(e.get("text",""))[:140],
                x=float(e.get("x",0)), y=float(e.get("y",0)),
                w=float(e.get("w",0)), h=float(e.get("h",0)),
                color=str(e.get("color","")), bg=str(e.get("bg","")),
                font_size=float(e.get("font_size",0)) or 0.0,
                font_weight=400,
            ))
        except Exception:
            continue
    b64 = base64.b64encode(image_bytes).decode()
    vp = Viewport(
        name="uploaded", width=w, height=h,
        elements=elements, scroll_height=h,
    )
    return [vp], {"uploaded": b64}
