"""Rule engine: turns extracted features into deterministic issues + scores.
LLM is called ONCE at the end to phrase issues; rules here are the ground truth."""
from ..models import Viewport, Features, Issue, Scores
from . import visual_features as vf
from .content_features import collect_text, readability

def build_features(source: str, url: str | None, viewports: list[Viewport], fonts: list[str]) -> Features:
    primary = next((v for v in viewports if v.name in ("desktop","uploaded")), viewports[0])
    text = " ".join(collect_text(v) for v in viewports)
    cf, _ = vf.contrast_failures(primary)
    stt, _ = vf.small_touch_targets(primary)
    ovf_total = 0
    for v in viewports:
        n, _ = vf.overflow(v); ovf_total += n
    ffc = vf.form_field_counts(primary)
    nic = vf.nav_item_count(primary)
    cta_p, af = vf.cta_prominence(primary)
    hh = vf.heading_hierarchy_ok(primary)
    return Features(
        source=source, url=url, viewports=viewports,
        contrast_failures=cf, small_touch_targets=stt,
        overflow_elements=ovf_total,
        forms_field_counts=ffc, nav_item_count=nic,
        cta_prominence=cta_p, above_fold_cta=af,
        heading_hierarchy_ok=hh, font_families=len(fonts),
        readability_flesch=readability(text), text_length=len(text),
    )

def detect_issues(f: Features) -> list[Issue]:
    issues: list[Issue] = []
    primary = next((v for v in f.viewports if v.name in ("desktop","uploaded")), f.viewports[0])

    if f.contrast_failures > 0:
        _, ev = vf.contrast_failures(primary)
        issues.append(Issue(
            id="a11y.contrast", title="Low text contrast",
            category="accessibility",
            severity="critical" if f.contrast_failures >= 5 else "high",
            evidence=f"{f.contrast_failures} text elements below WCAG contrast. e.g. " + "; ".join(ev),
            suggestion="Raise foreground/background contrast to at least 4.5:1 (3:1 for large text).",
        ))
    if f.small_touch_targets > 0:
        _, ev = vf.small_touch_targets(primary)
        issues.append(Issue(
            id="a11y.touch", title="Interactive elements too small",
            category="accessibility",
            severity="high" if f.small_touch_targets >= 4 else "medium",
            evidence=f"{f.small_touch_targets} controls below 44x24px. e.g. " + "; ".join(ev),
            suggestion="Increase button/link hit areas to at least 44x44px per WCAG 2.5.5.",
        ))
    if f.overflow_elements > 0:
        issues.append(Issue(
            id="mobile.overflow", title="Elements overflow viewport",
            category="mobile",
            severity="critical" if f.overflow_elements >= 3 else "high",
            evidence=f"{f.overflow_elements} elements extend past a viewport edge (checked across viewports).",
            suggestion="Use responsive units (%, rem, fr) and test at 390px width.",
        ))
    if f.forms_field_counts:
        longest = max(f.forms_field_counts)
        if longest >= 7:
            issues.append(Issue(
                id="form.length", title="Form has many fields",
                category="interaction",
                severity="medium",
                evidence=f"Longest form has {longest} input fields.",
                suggestion="Split into steps, remove optional fields, or defer to post-signup.",
            ))
    if f.nav_item_count > 8:
        issues.append(Issue(
            id="nav.overload", title="Navigation overloaded",
            category="navigation",
            severity="medium",
            evidence=f"{f.nav_item_count} navigation links in primary nav.",
            suggestion="Group under 5-7 top-level items; move secondary links to footer or menu.",
        ))
    if f.cta_prominence < 45:
        issues.append(Issue(
            id="cta.prominence", title="Weak primary CTA",
            category="visual",
            severity="high" if f.cta_prominence < 30 else "medium",
            evidence=f"Top CTA prominence score {f.cta_prominence}/100 (size, contrast, position, wording).",
            suggestion="Make one CTA visually dominant: larger size, higher contrast, above the fold.",
        ))
    if not f.above_fold_cta and f.cta_prominence > 0:
        issues.append(Issue(
            id="cta.fold", title="Primary CTA below the fold",
            category="visual", severity="medium",
            evidence="Highest-scoring CTA sits below the initial viewport.",
            suggestion="Move a primary action into the first screen.",
        ))
    if not f.heading_hierarchy_ok:
        issues.append(Issue(
            id="content.hierarchy", title="Weak heading hierarchy",
            category="content", severity="medium",
            evidence="H1/H2/H3 font sizes do not decrease consistently.",
            suggestion="Set a clear type scale (e.g. 40/28/22/18) so heading levels are visually distinct.",
        ))
    if f.font_families > 3:
        issues.append(Issue(
            id="visual.fonts", title="Too many font families",
            category="visual", severity="low",
            evidence=f"{f.font_families} distinct font families detected.",
            suggestion="Limit to 2 families (heading + body) for a coherent identity.",
        ))
    if f.readability_flesch and f.readability_flesch < 50:
        issues.append(Issue(
            id="content.readability", title="Content is hard to read",
            category="content", severity="medium",
            evidence=f"Flesch reading ease {f.readability_flesch:.0f} (target 60+ for general web).",
            suggestion="Shorten sentences, cut jargon, prefer active voice.",
        ))
    return issues

def compute_scores(f: Features, issues: list[Issue]) -> Scores:
    def penalty(cat):
        p = 0
        for i in issues:
            if i.category != cat: continue
            p += {"critical":30,"high":18,"medium":10,"low":4}[i.severity]
        return min(p, 90)
    visual = 100 - penalty("visual")
    accessibility = 100 - penalty("accessibility")
    navigation = 100 - penalty("navigation")
    content = 100 - penalty("content")
    mobile = 100 - penalty("mobile")
    interaction = 100 - penalty("interaction")
    overall = round(0.25*visual + 0.20*accessibility + 0.15*navigation
                    + 0.15*content + 0.15*mobile + 0.10*interaction)
    return Scores(
        overall=max(0, overall),
        visual=max(0, visual), accessibility=max(0, accessibility),
        navigation=max(0, navigation), content=max(0, content),
        mobile=max(0, mobile), interaction=max(0, interaction),
    )
