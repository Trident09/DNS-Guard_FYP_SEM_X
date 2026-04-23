"""
PDF report generator using ReportLab.
"""
import io
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)

W, H = A4
STYLES = getSampleStyleSheet()

# Palette
BLUE       = colors.HexColor("#3b82f6")
BLUE_DARK  = colors.HexColor("#1e3a5f")
BLUE_LIGHT = colors.HexColor("#dbeafe")
RED        = colors.HexColor("#ef4444")
RED_LIGHT  = colors.HexColor("#fee2e2")
YELLOW     = colors.HexColor("#f59e0b")
YELLOW_LIGHT = colors.HexColor("#fef3c7")
GREEN      = colors.HexColor("#22c55e")
GREEN_LIGHT  = colors.HexColor("#dcfce7")
DARK       = colors.HexColor("#0f172a")
GRAY       = colors.HexColor("#64748b")
LIGHT_BG   = colors.HexColor("#f8fafc")
WHITE      = colors.white
BORDER     = colors.HexColor("#e2e8f0")


def score_color(score: int):
    if score >= 70: return RED
    if score >= 40: return YELLOW
    return GREEN

def score_bg(score: int):
    if score >= 70: return RED_LIGHT
    if score >= 40: return YELLOW_LIGHT
    return GREEN_LIGHT

def bool_cell(val: bool) -> str:
    return "✓ Yes" if val else "✗ No"

def fmt_date(iso: str) -> str:
    if not iso: return "—"
    try: return iso[:10]
    except: return str(iso)


# ── Paragraph styles ────────────────────────────────────────
H1 = ParagraphStyle("H1", parent=STYLES["Normal"],
    fontSize=22, textColor=WHITE, fontName="Helvetica-Bold", spaceAfter=4)
H2 = ParagraphStyle("H2", parent=STYLES["Normal"],
    fontSize=12, textColor=DARK, fontName="Helvetica-Bold", spaceAfter=2)
BODY = ParagraphStyle("Body", parent=STYLES["Normal"],
    fontSize=9, textColor=DARK, leading=13)
MUTED = ParagraphStyle("Muted", parent=STYLES["Normal"],
    fontSize=8, textColor=GRAY, leading=12)
MONO = ParagraphStyle("Mono", parent=STYLES["Normal"],
    fontSize=8, fontName="Courier", textColor=DARK)


# ── Reusable builders ───────────────────────────────────────

def kv_table(rows: list[tuple], col_widths=(5*cm, 11*cm)) -> Table:
    data = [
        [Paragraph(f"<b>{k}</b>", MUTED), Paragraph(str(v or "—"), BODY)]
        for k, v in rows
    ]
    t = Table(data, colWidths=col_widths)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), LIGHT_BG),
        ("BACKGROUND", (1, 0), (1, -1), WHITE),
        ("GRID", (0, 0), (-1, -1), 0.3, BORDER),
        ("TOPPADDING",    (0,0), (-1,-1), 5),
        ("BOTTOMPADDING", (0,0), (-1,-1), 5),
        ("LEFTPADDING",   (0,0), (-1,-1), 8),
        ("VALIGN", (0,0), (-1,-1), "TOP"),
    ]))
    return t


def section(title: str, color=BLUE) -> list:
    return [
        Spacer(1, 0.5*cm),
        _section_table(title),
        Spacer(1, 0.15*cm),
    ]


def _section_table(title: str) -> Table:
    """Colored section header bar."""
    t = Table([[Paragraph(f"<b>{title}</b>",
        ParagraphStyle("SH", parent=STYLES["Normal"],
            fontSize=10, textColor=WHITE, fontName="Helvetica-Bold",
            leftIndent=4)
    )]], colWidths=[W - 4*cm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), BLUE_DARK),
        ("TOPPADDING",    (0,0), (-1,-1), 6),
        ("BOTTOMPADDING", (0,0), (-1,-1), 6),
        ("LEFTPADDING",   (0,0), (-1,-1), 10),
    ]))
    return t


def sec(title: str) -> list:
    return [Spacer(1, 0.5*cm), _section_table(title), Spacer(1, 0.2*cm)]


def cover_page(domain: str, score: int, verdict: str, generated: str) -> list:
    sc = score_color(score)
    sb = score_bg(score)

    # Header banner
    banner = Table([[
        Paragraph("<b>DNS Guard</b>", ParagraphStyle("BannerTitle",
            parent=STYLES["Normal"], fontSize=26, textColor=WHITE,
            fontName="Helvetica-Bold")),
        Paragraph("Domain Threat Intelligence Report", ParagraphStyle("BannerSub",
            parent=STYLES["Normal"], fontSize=11, textColor=BLUE_LIGHT)),
    ]], colWidths=[8*cm, 8*cm])
    banner.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), BLUE_DARK),
        ("TOPPADDING",    (0,0), (-1,-1), 24),
        ("BOTTOMPADDING", (0,0), (-1,-1), 24),
        ("LEFTPADDING",   (0,0), (-1,-1), 16),
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
    ]))

    # Score badge
    score_table = Table([[
        Paragraph(f'<font color="{sc.hexval()}"><b>{score}</b></font>',
            ParagraphStyle("ScoreNum", parent=STYLES["Normal"],
                fontSize=48, fontName="Helvetica-Bold")),
        Table([
            [Paragraph("/100", MUTED)],
            [Paragraph(f'<font color="{sc.hexval()}"><b>{verdict}</b></font>',
                ParagraphStyle("Verdict", parent=STYLES["Normal"],
                    fontSize=16, fontName="Helvetica-Bold"))],
        ], colWidths=[4*cm]),
    ]], colWidths=[4*cm, 12*cm])
    score_table.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), sb),
        ("TOPPADDING",    (0,0), (-1,-1), 16),
        ("BOTTOMPADDING", (0,0), (-1,-1), 16),
        ("LEFTPADDING",   (0,0), (-1,-1), 20),
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
        ("ROUNDEDCORNERS", [6]),
    ]))

    meta = Table([[
        Paragraph(f"<b>Domain:</b> {domain}", BODY),
        Paragraph(f"<b>Generated:</b> {generated}", BODY),
    ]], colWidths=[9*cm, 7*cm])
    meta.setStyle(TableStyle([
        ("TOPPADDING",    (0,0), (-1,-1), 8),
        ("BOTTOMPADDING", (0,0), (-1,-1), 8),
        ("LEFTPADDING",   (0,0), (-1,-1), 4),
    ]))

    return [banner, Spacer(1, 0.4*cm), score_table, Spacer(1, 0.2*cm), meta]


# ── Main generator ──────────────────────────────────────────

def generate_pdf(report: dict) -> bytes:
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4,
        leftMargin=2*cm, rightMargin=2*cm,
        topMargin=2*cm, bottomMargin=2*cm)
    story = []
    domain  = report.get("domain", "")
    score   = report.get("threat_score", 0)
    verdict = report.get("verdict", "Unknown")
    generated = datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")

    # ── Cover ────────────────────────────────────────────────
    story += cover_page(domain, score, verdict, generated)

    # ── Risk Summary ─────────────────────────────────────────
    explanations = report.get("explanations", [])
    if explanations:
        story += sec("Risk Summary & Key Findings")
        for e in explanations:
            impact = e.get("impact", "low")
            c  = RED   if impact == "high"   else YELLOW if impact == "medium" else GREEN
            bg = RED_LIGHT if impact == "high" else YELLOW_LIGHT if impact == "medium" else GREEN_LIGHT
            row = Table([[
                Paragraph(f"<b>{impact.upper()}</b>",
                    ParagraphStyle("ImpBadge", parent=STYLES["Normal"],
                        fontSize=7, textColor=c, fontName="Helvetica-Bold")),
                Paragraph(
                    f"<b>{e.get('feature','').replace('_',' ').title()}</b> — {e.get('reason','')}",
                    BODY),
            ]], colWidths=[1.5*cm, W - 5.5*cm])
            row.setStyle(TableStyle([
                ("BACKGROUND", (0,0), (0,0), bg),
                ("BACKGROUND", (1,0), (1,0), WHITE),
                ("GRID", (0,0), (-1,-1), 0.3, BORDER),
                ("TOPPADDING",    (0,0), (-1,-1), 5),
                ("BOTTOMPADDING", (0,0), (-1,-1), 5),
                ("LEFTPADDING",   (0,0), (-1,-1), 6),
                ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
            ]))
            story.append(row)
            story.append(Spacer(1, 0.1*cm))

    # ── Feature Importance ───────────────────────────────────
    fi = report.get("feature_importance", [])
    if fi:
        story += sec("Feature Importance (ML Model)")
        max_val = max((f["value"] for f in fi), default=1) or 1
        bar_rows = []
        for f in fi:
            pct = f["value"] / max_val
            c = RED if f["impact"] == "high" else YELLOW if f["impact"] == "medium" else GREEN
            bar_rows.append([
                Paragraph(f["feature"], MUTED),
                Paragraph(f'<font color="{c.hexval()}">{"█" * int(pct * 20)}</font>',
                    ParagraphStyle("Bar", parent=STYLES["Normal"],
                        fontSize=8, fontName="Courier")),
                Paragraph(str(f["value"]), MUTED),
            ])
        ft = Table(bar_rows, colWidths=[5*cm, 8*cm, 2*cm])
        ft.setStyle(TableStyle([
            ("GRID", (0,0), (-1,-1), 0.3, BORDER),
            ("TOPPADDING",    (0,0), (-1,-1), 4),
            ("BOTTOMPADDING", (0,0), (-1,-1), 4),
            ("LEFTPADDING",   (0,0), (-1,-1), 6),
            ("ROWBACKGROUNDS", (0,0), (-1,-1), [WHITE, LIGHT_BG]),
        ]))
        story.append(ft)

    # ── WHOIS ────────────────────────────────────────────────
    whois = report.get("whois", {})
    if whois and not whois.get("error"):
        story += sec("WHOIS Information")
        story.append(kv_table([
            ("Registrar",       whois.get("registrar", "—")),
            ("Created",         fmt_date(whois.get("creation_date", ""))),
            ("Expires",         fmt_date(whois.get("expiry_date", ""))),
            ("Domain age",      f"{whois.get('age_days', '—')} days"),
            ("Days to expiry",  f"{whois.get('days_until_expiry', '—')} days"),
            ("New domain",      bool_cell(whois.get("is_new_domain", False))),
            ("Expiring soon",   bool_cell(whois.get("expiring_soon", False))),
        ]))

    # ── DNS Records ──────────────────────────────────────────
    dns = report.get("dns_records", {})
    if dns:
        story += sec("DNS Records")
        rows = [(rtype, "\n".join(vals)) for rtype, vals in dns.items() if vals]
        story.append(kv_table(rows))

    # ── DNSSEC ───────────────────────────────────────────────
    dnssec = report.get("dnssec", {})
    if dnssec:
        story += sec("DNSSEC Status")
        enabled = any(dnssec.values())
        status_color = GREEN if enabled else RED
        story.append(Paragraph(
            f'<font color="{status_color.hexval()}"><b>{"✓ DNSSEC Enabled" if enabled else "✗ DNSSEC Not Configured"}</b></font>',
            ParagraphStyle("DS", parent=STYLES["Normal"], fontSize=10, spaceAfter=6)))
        story.append(kv_table([
            ("DNSKEY", bool_cell(dnssec.get("dnskey", False))),
            ("RRSIG",  bool_cell(dnssec.get("rrsig",  False))),
            ("DS",     bool_cell(dnssec.get("ds",     False))),
        ]))

    # ── Certificate Transparency ─────────────────────────────
    certs = report.get("certs", {})
    if certs and not certs.get("error"):
        story += sec("Certificate Transparency")
        story.append(kv_table([
            ("Total certificates",    certs.get("total_certs", "—")),
            ("Wildcard certificates", certs.get("wildcard_certs", "—")),
            ("Issued last 30 days",   certs.get("certs_last_30d", "—")),
            ("Certificate spike",     bool_cell(certs.get("cert_spike", False))),
            ("Has wildcards",         bool_cell(certs.get("has_wildcards", False))),
        ]))
        recent = certs.get("recent_certs", [])[:5]
        if recent:
            story.append(Spacer(1, 0.2*cm))
            story.append(Paragraph("<b>Recent Certificates</b>", MUTED))
            story.append(Spacer(1, 0.1*cm))
            cert_rows = [["Issuer", "Name", "Valid From", "Valid To"]] + [
                [c.get("issuer","")[:30], c.get("name","")[:30],
                 fmt_date(c.get("not_before","")), fmt_date(c.get("not_after",""))]
                for c in recent
            ]
            ct = Table(cert_rows, colWidths=[4*cm, 5*cm, 3*cm, 3*cm])
            ct.setStyle(TableStyle([
                ("BACKGROUND", (0,0), (-1,0), BLUE_DARK),
                ("TEXTCOLOR",  (0,0), (-1,0), WHITE),
                ("FONTNAME",   (0,0), (-1,0), "Helvetica-Bold"),
                ("FONTSIZE",   (0,0), (-1,-1), 8),
                ("GRID",       (0,0), (-1,-1), 0.3, BORDER),
                ("ROWBACKGROUNDS", (0,1), (-1,-1), [WHITE, LIGHT_BG]),
                ("TOPPADDING",    (0,0), (-1,-1), 4),
                ("BOTTOMPADDING", (0,0), (-1,-1), 4),
                ("LEFTPADDING",   (0,0), (-1,-1), 6),
            ]))
            story.append(ct)

    # ── Passive DNS ──────────────────────────────────────────
    pdns = report.get("passive_dns", {})
    if pdns and not pdns.get("error"):
        story += sec("Passive DNS")
        story.append(kv_table([
            ("Total records",      pdns.get("total_records", "—")),
            ("Unique IPs seen",    pdns.get("unique_ip_count", "—")),
            ("Fast-flux suspected",bool_cell(pdns.get("fast_flux_suspected", False))),
        ]))
        top_ips = pdns.get("top_ips", [])[:8]
        if top_ips:
            story.append(Spacer(1, 0.2*cm))
            ip_rows = [["IP Address", "Seen"]] + [[i["ip"], str(i["count"])] for i in top_ips]
            it = Table(ip_rows, colWidths=[8*cm, 7*cm])
            it.setStyle(TableStyle([
                ("BACKGROUND", (0,0), (-1,0), BLUE_DARK),
                ("TEXTCOLOR",  (0,0), (-1,0), WHITE),
                ("FONTNAME",   (0,0), (-1,0), "Helvetica-Bold"),
                ("FONTSIZE",   (0,0), (-1,-1), 8),
                ("GRID",       (0,0), (-1,-1), 0.3, BORDER),
                ("ROWBACKGROUNDS", (0,1), (-1,-1), [WHITE, LIGHT_BG]),
                ("TOPPADDING",    (0,0), (-1,-1), 4),
                ("BOTTOMPADDING", (0,0), (-1,-1), 4),
                ("LEFTPADDING",   (0,0), (-1,-1), 6),
            ]))
            story.append(it)

    # ── Geo IP ───────────────────────────────────────────────
    geo = report.get("geo", [])
    if geo:
        story += sec("IP Geolocation")
        geo_rows = [["IP Address", "City", "Country", "Organisation"]] + [
            [g.get("ip",""), g.get("city",""), g.get("country",""), (g.get("org","") or "")[:35]]
            for g in geo
        ]
        gt = Table(geo_rows, colWidths=[3.5*cm, 3.5*cm, 3.5*cm, 5.5*cm])
        gt.setStyle(TableStyle([
            ("BACKGROUND", (0,0), (-1,0), BLUE_DARK),
            ("TEXTCOLOR",  (0,0), (-1,0), WHITE),
            ("FONTNAME",   (0,0), (-1,0), "Helvetica-Bold"),
            ("FONTSIZE",   (0,0), (-1,-1), 8),
            ("GRID",       (0,0), (-1,-1), 0.3, BORDER),
            ("ROWBACKGROUNDS", (0,1), (-1,-1), [WHITE, LIGHT_BG]),
            ("TOPPADDING",    (0,0), (-1,-1), 4),
            ("BOTTOMPADDING", (0,0), (-1,-1), 4),
            ("LEFTPADDING",   (0,0), (-1,-1), 6),
        ]))
        story.append(gt)

    # ── Typosquat ────────────────────────────────────────────
    typo = report.get("typosquat", {})
    if typo and not typo.get("error"):
        story += sec("Typosquat Detection")
        is_typo = typo.get("is_typosquat", False)
        story.append(Paragraph(
            f'<font color="{(RED if is_typo else GREEN).hexval()}"><b>'
            f'{"⚠ Possible typosquat detected" if is_typo else "✓ No typosquat match found"}'
            f'</b></font>',
            ParagraphStyle("TY", parent=STYLES["Normal"], fontSize=10, spaceAfter=6)))
        matches = typo.get("matches", [])[:5]
        if matches:
            m_rows = [["Target Domain", "Edit Distance"]] + [
                [m.get("target",""), str(m.get("distance",""))] for m in matches
            ]
            mt = Table(m_rows, colWidths=[10*cm, 6*cm])
            mt.setStyle(TableStyle([
                ("BACKGROUND", (0,0), (-1,0), BLUE_DARK),
                ("TEXTCOLOR",  (0,0), (-1,0), WHITE),
                ("FONTNAME",   (0,0), (-1,0), "Helvetica-Bold"),
                ("FONTSIZE",   (0,0), (-1,-1), 8),
                ("GRID",       (0,0), (-1,-1), 0.3, BORDER),
                ("ROWBACKGROUNDS", (0,1), (-1,-1), [WHITE, LIGHT_BG]),
                ("TOPPADDING",    (0,0), (-1,-1), 4),
                ("BOTTOMPADDING", (0,0), (-1,-1), 4),
                ("LEFTPADDING",   (0,0), (-1,-1), 6),
            ]))
            story.append(mt)

    # ── Subdomains ───────────────────────────────────────────
    subs = report.get("subdomains", {})
    if subs:
        story += sec("Subdomain Enumeration")
        story.append(kv_table([
            ("Total found",    subs.get("total_found", "—")),
            ("Suspicious",     subs.get("suspicious_count", "—")),
        ]))
        suspicious = subs.get("suspicious", [])
        if suspicious:
            story.append(Spacer(1, 0.15*cm))
            story.append(Paragraph("<b>Suspicious subdomains:</b>", MUTED))
            for s in suspicious[:10]:
                story.append(Paragraph(f"• {s}", MONO))

    # ── Reverse IP ───────────────────────────────────────────
    rev = report.get("reverse_ip", {})
    if rev and not rev.get("error"):
        story += sec("Reverse IP Lookup")
        story.append(kv_table([
            ("Resolved IP",        rev.get("ip", "—")),
            ("Domains on same IP", rev.get("shared_count", "—")),
            ("High-density host",  bool_cell(rev.get("high_density_hosting", False))),
        ]))
        shared = rev.get("shared_domains", [])[:10]
        if shared:
            story.append(Spacer(1, 0.15*cm))
            story.append(Paragraph("<b>Co-hosted domains:</b>", MUTED))
            for d in shared:
                story.append(Paragraph(f"• {d}", MONO))

    # ── Threat Intelligence ──────────────────────────────────
    intel = report.get("threat_intel", {})
    if intel:
        story += sec("Threat Intelligence")
        any_listed = intel.get("any_listed", False)
        story.append(Paragraph(
            f'<font color="{(RED if any_listed else GREEN).hexval()}"><b>'
            f'{"⚠ Domain is listed on one or more blocklists" if any_listed else "✓ Not found on any blocklist"}'
            f'</b></font>',
            ParagraphStyle("TI", parent=STYLES["Normal"], fontSize=10, spaceAfter=6)))
        spamhaus  = intel.get("spamhaus_dbl", {})
        phishtank = intel.get("phishtank", {})
        story.append(kv_table([
            ("Spamhaus DBL",
             spamhaus.get("reason","Listed") if spamhaus.get("listed") else "Clean"),
            ("PhishTank",
             f"Listed — targeting {phishtank.get('target','')}" if phishtank.get("listed") else "Clean"),
        ]))

    # ── Footer note ──────────────────────────────────────────
    story.append(Spacer(1, 1*cm))
    story.append(HRFlowable(width="100%", thickness=0.5, color=BORDER))
    story.append(Spacer(1, 0.2*cm))
    story.append(Paragraph(
        f"Generated by DNS Guard · {generated} · For security research purposes only.",
        ParagraphStyle("Footer", parent=STYLES["Normal"],
            fontSize=7, textColor=GRAY, alignment=1)))

    doc.build(story)
    return buf.getvalue()
