import base64
import asyncio
from playwright.sync_api import sync_playwright
from ..models import Viewport, Element
from ..config import VIEWPORTS

EXTRACT_JS = r"""
() => {
  const SEL = 'a,button,input,textarea,select,img,h1,h2,h3,h4,h5,h6,p,li,label,form,nav,header,footer,main,section,article,[role]';
  const isVisible = (el) => {
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return false;
    const s = getComputedStyle(el);
    if (s.visibility === 'hidden' || s.display === 'none' || s.opacity === '0') return false;
    return true;
  };
  const nodes = Array.from(document.querySelectorAll(SEL)).filter(isVisible).slice(0, 400);
  const doc = { scrollHeight: document.documentElement.scrollHeight };
  const elems = nodes.map(el => {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return {
      tag: el.tagName.toLowerCase(),
      role: el.getAttribute('role') || '',
      text: (el.innerText || el.value || el.getAttribute('alt') || '').trim().slice(0, 140),
      x: r.left + window.scrollX, y: r.top + window.scrollY,
      w: r.width, h: r.height,
      color: s.color, bg: s.backgroundColor,
      font_size: parseFloat(s.fontSize) || 0,
      font_weight: parseInt(s.fontWeight) || 400,
      z: parseInt(s.zIndex) || 0,
      family: s.fontFamily,
    };
  });
  const fonts = new Set(elems.map(e => (e.family||'').split(',')[0].trim().toLowerCase()));
  return { doc, elems, fonts: Array.from(fonts).filter(Boolean) };
}
"""

def _analyze_url_sync(url: str) -> tuple[list[Viewport], dict[str, str], list[str]]:
    viewports: list[Viewport] = []
    screenshots: dict[str, str] = {}
    fonts_all: set[str] = set()
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        try:
            for name, (w, h) in VIEWPORTS.items():
                ctx = browser.new_context(viewport={"width": w, "height": h})
                page = ctx.new_page()
                try:
                    page.goto(url, wait_until="networkidle", timeout=45000)
                except Exception:
                    page.goto(url, wait_until="domcontentloaded", timeout=45000)
                page.wait_for_timeout(1200)
                data = page.evaluate(EXTRACT_JS)
                shot = page.screenshot(full_page=False, type="png")
                screenshots[name] = base64.b64encode(shot).decode()
                elements = [Element(
                    tag=e["tag"], role=e["role"], text=e["text"],
                    x=e["x"], y=e["y"], w=e["w"], h=e["h"],
                    color=e["color"], bg=e["bg"],
                    font_size=e["font_size"], font_weight=e["font_weight"], z=e["z"],
                ) for e in data["elems"]]
                fonts_all.update(data.get("fonts", []))
                viewports.append(Viewport(
                    name=name, width=w, height=h,
                    elements=elements,
                    scroll_height=int(data["doc"]["scrollHeight"]),
                ))
                ctx.close()
        finally:
            browser.close()
    return viewports, screenshots, sorted(fonts_all)

async def analyze_url(url: str) -> tuple[list[Viewport], dict[str, str], list[str]]:
    return await asyncio.to_thread(_analyze_url_sync, url)