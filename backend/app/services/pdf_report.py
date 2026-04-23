"""
PDF report generator using ReportLab.
Produces a downloadable report with all analysis findings.
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

RED = colors.HexColor("#ef4444")
YELLOW = colors.HexColor("#f59e0b")
GREEN = colors.HexColor("#22c55e")
DARK = colors.HexColor("#111827")
GRAY = colors.HexColor("#6b7280")
LIGHT = colors.HexColor("#f3f4f6")


def _score_color(score: int):
    if score >= 70:
        return RED
    if score >= 40:
        return YELLOW
    return GREEN


def _bool_cell(val: bool) -> str:
    return "YES" if val else "NO"


def _kv_table(rows: list[tuple[str, str]]) -> Table:
    data = [[Paragraph(f"<b>{k}</b>", STYLES["Normal"]), Paragraph(str(v or "—"), STYLES["Normal"])]
            for k, v in rows]
    t = Table(data, colWidths=[5 * cm, 11 * cm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), LIGHT),
        ("GRID", (0, 0), (-1, -1), 0.25, colors.lightgrey),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    return t


def _section(title: str) -> list:
    return [
        Spacer(1, 0.4 * cm),
        Paragraph(f"<b>{title}</b>", ParagraphStyle(
            "SectionHead", parent=STYLES["Normal"],
            fontSize=11, textColor=DARK, spaceAfter=4,
        )),
        HRFlowable(width="100%", thickness=0.5, color=colors.lightgrey),
        Spacer(1, 0.2 * cm),
    ]


def generate_pdf(report: dict) -> bytes:
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4,
                            leftMargin=2*cm, rightMargin=2*cm,
                            topMargin=2*cm, bottomMargin=2*cm)
    story = []

    # ── Header ──────────────────────────────────────────────
    story.append(Paragraph(
        "<b>DNS Guard — Domain Analysis Report</b>",
        ParagraphStyle("Title", parent=STYLES["Title"], fontSize=18, textColor=DARK),
    ))
    story.append(Spacer(1, 0.3 * cm))
    story.append(Paragraph(
        f"Domain: <b>{report.get('domain', '')}</b> &nbsp;|&nbsp; "
        f"Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}",
        ParagraphStyle("Sub", parent=STYLES["Normal"], fontSize=9, textColor=GRAY),
    ))
    story.append(Spacer(1, 0.5 * cm))

    # ── Threat Score ─────────────────────────────────────────
    score = report.get("threat_score", 0)
    verdict = report.get("verdict", "Unknown")
    score_color = _score_color(score)
    story.append(Paragraph(
        f'<font color="{score_color.hexval()}"><b>Threat Score: {score}/100 — {verdict}</b></font>',
        ParagraphStyle("Score", parent=STYLES["Normal"], fontSize=14),
    ))

    # ── Explanations ─────────────────────────────────────────
    explanations = report.get("explanations", [])
    if explanations:
        story += _section("Why this score?")
        for e in explanations:
            impact = e.get("impact", "low")
            c = RED if impact == "high" else YELLOW if impact == "medium" else GREEN
            story.append(Paragraph(
                f'<font color="{c.hexval()}"><b>[{impact.upper()}]</b></font> '
                f'{e.get("feature", "")} — {e.get("reason", "")}',
                ParagraphStyle("Expl", parent=STYLES["Normal"], fontSize=9, spaceAfter=3),
            ))

    # ── WHOIS ────────────────────────────────────────────────
    whois = report.get("whois", {})
    if whois and not whois.get("error"):
        story += _section("WHOIS")
        story.append(_kv_table([
            ("Registrar", whois.get("registrar")),
            ("Created", whois.get("creation_date", "")[:10] if whois.get("creation_date") else "—"),
            ("Expires", whois.get("expiry_date", "")[:10] if whois.get("expiry_date") else "—"),
            ("Domain age", f"{whois.get('age_days', '—')} days"),
            ("New domain (<30d)", _bool_cell(whois.get("is_new_domain", False))),
        ]))

    # ── DNS Records ──────────────────────────────────────────
    dns_records = report.get("dns_records", {})
    if dns_records:
        story += _section("DNS Records")
        rows = [(rtype, ", ".join(vals[:3])) for rtype, vals in dns_records.items()]
        story.append(_kv_table(rows))

    # ── DNSSEC ───────────────────────────────────────────────
    dnssec = report.get("dnssec", {})
    if dnssec:
        story += _section("DNSSEC")
        story.append(_kv_table([
            ("DNSKEY", _bool_cell(dnssec.get("dnskey", False))),
            ("RRSIG", _bool_cell(dnssec.get("rrsig", False))),
            ("DS", _bool_cell(dnssec.get("ds", False))),
        ]))

    # ── Cert Transparency ────────────────────────────────────
    certs = report.get("certs", {})
    if certs and not certs.get("error"):
        story += _section("Certificate Transparency")
        story.append(_kv_table([
            ("Total certs", certs.get("total_certs")),
            ("Wildcard certs", certs.get("wildcard_certs")),
            ("Certs last 30d", certs.get("certs_last_30d")),
            ("Cert spike", _bool_cell(certs.get("cert_spike", False))),
        ]))

    # ── Passive DNS ──────────────────────────────────────────
    pdns = report.get("passive_dns", {})
    if pdns and not pdns.get("error"):
        story += _section("Passive DNS")
        story.append(_kv_table([
            ("Unique IPs seen", pdns.get("unique_ip_count")),
            ("Fast-flux suspected", _bool_cell(pdns.get("fast_flux_suspected", False))),
        ]))

    # ── Typosquat ────────────────────────────────────────────
    typo = report.get("typosquat", {})
    if typo and not typo.get("error"):
        story += _section("Typosquat Detection")
        story.append(_kv_table([
            ("Is typosquat", _bool_cell(typo.get("is_typosquat", False))),
            ("Closest match", typo.get("matches", [{}])[0].get("target", "—") if typo.get("matches") else "—"),
            ("Edit distance", str(typo.get("matches", [{}])[0].get("distance", "—")) if typo.get("matches") else "—"),
        ]))

    # ── Threat Intel ─────────────────────────────────────────
    intel = report.get("threat_intel", {})
    if intel:
        story += _section("Threat Intelligence")
        spamhaus = intel.get("spamhaus_dbl", {})
        phishtank = intel.get("phishtank", {})
        story.append(_kv_table([
            ("Spamhaus DBL", spamhaus.get("reason") if spamhaus.get("listed") else "Clean"),
            ("PhishTank", f"Listed — {phishtank.get('target', '')}" if phishtank.get("listed") else "Clean"),
        ]))

    # ── Subdomains ───────────────────────────────────────────
    subs = report.get("subdomains", {})
    if subs:
        story += _section("Subdomains")
        story.append(_kv_table([
            ("Total found", subs.get("total_found")),
            ("Suspicious", subs.get("suspicious_count")),
            ("Suspicious list", ", ".join(subs.get("suspicious", [])[:5]) or "—"),
        ]))

    doc.build(story)
    return buf.getvalue()
