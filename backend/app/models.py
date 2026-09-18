from pydantic import BaseModel, Field
from typing import Literal, Optional

Severity = Literal["critical", "high", "medium", "low"]

class Element(BaseModel):
    tag: str
    role: str = ""
    text: str = ""
    x: float
    y: float
    w: float
    h: float
    color: str = ""
    bg: str = ""
    font_size: float = 0.0
    font_weight: int = 400
    z: int = 0

class Viewport(BaseModel):
    name: str
    width: int
    height: int
    elements: list[Element] = []
    scroll_height: int = 0

class Features(BaseModel):
    source: Literal["url", "screenshot"]
    url: Optional[str] = None
    viewports: list[Viewport] = []
    contrast_failures: int = 0
    small_touch_targets: int = 0
    overflow_elements: int = 0
    forms_field_counts: list[int] = []
    nav_item_count: int = 0
    cta_prominence: float = 0.0
    above_fold_cta: bool = False
    heading_hierarchy_ok: bool = True
    font_families: int = 0
    readability_flesch: float = 0.0
    text_length: int = 0
    detected_issues: list[dict] = []

class Issue(BaseModel):
    id: str
    title: str
    category: str
    severity: Severity
    evidence: str
    suggestion: str
    element_ref: Optional[str] = None

class Scores(BaseModel):
    overall: int
    visual: int
    accessibility: int
    navigation: int
    content: int
    mobile: int
    interaction: int

class AuditResponse(BaseModel):
    source: Literal["url", "screenshot"]
    url: Optional[str] = None
    scores: Scores
    issues: list[Issue]
    summary: str
    screenshots: dict[str, str] = Field(default_factory=dict)
    features_debug: Optional[dict] = None

class UrlAuditRequest(BaseModel):
    url: str

class RedesignRequest(BaseModel):
    issues: list[Issue]
    context: str = ""
