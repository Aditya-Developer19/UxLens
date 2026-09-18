"""Deterministic visual feature extraction. No ML."""
import re, math
from ..models import Viewport, Element

HEX_RE = re.compile(r"#([0-9a-fA-F]{3,8})")
RGB_RE = re.compile(r"rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)")

def _to_rgb(s: str) -> tuple[int, int, int] | None:
    if not s: return None
    s = s.strip()
    m = HEX_RE.search(s)
    if m:
        h = m.group(1)
        if len(h) == 3: h = "".join(c*2 for c in h)
        if len(h) >= 6:
            return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
    m = RGB_RE.search(s)
    if m:
        return int(m.group(1)), int(m.group(2)), int(m.group(3))
    return None

def _rel_lum(rgb: tuple[int, int, int]) -> float:
    def ch(c):
        c /= 255.0
        return c/12.92 if c <= 0.03928 else ((c+0.055)/1.055) ** 2.4
    r, g, b = rgb
    return 0.2126*ch(r) + 0.7152*ch(g) + 0.0722*ch(b)

def contrast_ratio(fg: str, bg: str) -> float | None:
    a, b = _to_rgb(fg), _to_rgb(bg)
    if not a or not b: return None
    l1, l2 = _rel_lum(a), _rel_lum(b)
    hi, lo = max(l1, l2), min(l1, l2)
    return (hi + 0.05) / (lo + 0.05)

def is_interactive(e: Element) -> bool:
    t = e.tag.lower()
    r = (e.role or "").lower()
    return t in {"button","a","input","textarea","select","cta","link"} or r in {"button","link"}

def is_text(e: Element) -> bool:
    t = e.tag.lower()
    return t in {"p","h1","h2","h3","h4","h5","h6","li","label","paragraph","heading"} and bool(e.text)

def contrast_failures(vp: Viewport) -> tuple[int, list[str]]:
    fails, evidence = 0, []
    for e in vp.elements:
        if not is_text(e): continue
        cr = contrast_ratio(e.color, e.bg)
        if cr is None: continue
        threshold = 3.0 if e.font_size >= 18 or (e.font_size >= 14 and e.font_weight >= 700) else 4.5
        if cr < threshold:
            fails += 1
            if len(evidence) < 3:
                evidence.append(f'"{e.text[:40]}" contrast {cr:.1f}:1 (needs {threshold})')
    return fails, evidence

def small_touch_targets(vp: Viewport) -> tuple[int, list[str]]:
    n, ev = 0, []
    for e in vp.elements:
        if not is_interactive(e): continue
        if e.w < 44 or e.h < 24:
            n += 1
            if len(ev) < 3:
                ev.append(f'{e.tag} "{e.text[:30]}" is {int(e.w)}x{int(e.h)}px')
    return n, ev

def overflow(vp: Viewport) -> tuple[int, list[str]]:
    n, ev = 0, []
    for e in vp.elements:
        if e.x + e.w > vp.width + 4:
            n += 1
            if len(ev) < 3:
                ev.append(f'{e.tag} "{e.text[:30]}" extends {int(e.x+e.w-vp.width)}px past viewport')
    return n, ev

def form_field_counts(vp: Viewport) -> list[int]:
    forms = [e for e in vp.elements if e.tag in {"form"}]
    inputs = [e for e in vp.elements if e.tag in {"input","textarea","select"}]
    if not forms:
        return [len(inputs)] if inputs else []
    counts = []
    for f in forms:
        c = sum(1 for i in inputs if i.x >= f.x-2 and i.y >= f.y-2
                and i.x+i.w <= f.x+f.w+2 and i.y+i.h <= f.y+f.h+2)
        counts.append(c)
    return counts

def nav_item_count(vp: Viewport) -> int:
    navs = [e for e in vp.elements if e.tag == "nav"]
    if navs:
        top = navs[0]
        return sum(1 for e in vp.elements if e.tag in {"a","link"}
                   and e.x >= top.x and e.y >= top.y
                   and e.x+e.w <= top.x+top.w and e.y+e.h <= top.y+top.h)
    return sum(1 for e in vp.elements if e.tag in {"a","link"} and e.y < 120)

def cta_prominence(vp: Viewport) -> tuple[float, bool]:
    cands = [e for e in vp.elements if is_interactive(e) and e.text]
    if not cands: return 0.0, False
    def score(e):
        area = e.w * e.h
        area_score = min(area / (200*50), 1.0)
        cr = contrast_ratio(e.color, e.bg) or 1.0
        contrast_score = min(cr / 7.0, 1.0)
        pos_score = 1.0 - min(e.y / max(vp.height, 1), 1.0)
        text_score = 1.0 if any(k in e.text.lower() for k in
            ["get started","sign up","try","start","buy","subscribe","download","register","join"]) else 0.5
        return 0.30*area_score + 0.25*contrast_score + 0.25*pos_score + 0.20*text_score
    ranked = sorted(cands, key=score, reverse=True)
    scored = [(score(e), e) for e in ranked]
    top_score, top_el = scored[0]
    above_fold = top_el.y < vp.height
    return round(top_score * 100, 1), above_fold

def heading_hierarchy_ok(vp: Viewport) -> bool:
    sizes = {}
    for e in vp.elements:
        if e.tag in {"h1","h2","h3","h4","h5","h6"} and e.font_size:
            sizes.setdefault(e.tag, []).append(e.font_size)
    avg = {k: sum(v)/len(v) for k, v in sizes.items()}
    order = ["h1","h2","h3","h4","h5","h6"]
    seen = [avg[k] for k in order if k in avg]
    if len(seen) < 2: return True
    for a, b in zip(seen, seen[1:]):
        if b >= a - 0.5:
            return False
    return True
