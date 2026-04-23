import { AlertTriangle, CheckCircle } from "lucide-react";

interface Report {
  threat_score: number;
  dnssec?: Record<string, boolean>;
  whois?: { is_new_domain?: boolean; expiring_soon?: boolean };
  certs?: { cert_spike?: boolean; has_wildcards?: boolean };
  passive_dns?: { fast_flux_suspected?: boolean };
  typosquat?: { is_typosquat?: boolean };
  threat_intel?: { any_listed?: boolean };
}

interface Rec { level: "critical" | "warning" | "info"; text: string }

function getRecommendations(report: Report): Rec[] {
  const recs: Rec[] = [];

  if (report.threat_intel?.any_listed)
    recs.push({ level: "critical", text: "Domain is on a blocklist — investigate immediately and contact your registrar." });
  if (report.passive_dns?.fast_flux_suspected)
    recs.push({ level: "critical", text: "Fast-flux DNS detected — IP addresses are rotating rapidly, a common botnet technique." });
  if (report.typosquat?.is_typosquat)
    recs.push({ level: "critical", text: "Domain resembles a known brand — may be used for phishing. Report to PhishTank." });

  const dnssecEnabled = Object.values(report.dnssec || {}).some(Boolean);
  if (!dnssecEnabled)
    recs.push({ level: "warning", text: "DNSSEC is not enabled — enable it at your registrar to prevent DNS spoofing." });
  if (report.whois?.is_new_domain)
    recs.push({ level: "warning", text: "Domain is newly registered (< 30 days) — treat with caution." });
  if (report.whois?.expiring_soon)
    recs.push({ level: "warning", text: "Domain expires soon — renew to prevent hijacking." });
  if (report.certs?.cert_spike)
    recs.push({ level: "warning", text: "Unusual spike in SSL certificates issued recently — check for unauthorized certs." });
  if (report.certs?.has_wildcards)
    recs.push({ level: "info", text: "Wildcard certificates found — ensure they are intentional and properly managed." });

  if (recs.length === 0)
    recs.push({ level: "info", text: "No critical issues found. Continue monitoring DNS records regularly." });

  return recs;
}

const styles = {
  critical: { icon: AlertTriangle, cls: "text-red-400 bg-red-900/30 border-red-800" },
  warning:  { icon: AlertTriangle, cls: "text-yellow-400 bg-yellow-900/30 border-yellow-800" },
  info:     { icon: CheckCircle,   cls: "text-blue-400 bg-blue-900/30 border-blue-800" },
};

export default function RiskSummary({ report }: { report: Report }) {
  const recs = getRecommendations(report);

  return (
    <div className="bg-gray-800 rounded-xl p-5">
      <h2 className="text-lg font-semibold mb-4">Risk Summary & Recommendations</h2>
      <div className="space-y-2">
        {recs.map((r, i) => {
          const { icon: Icon, cls } = styles[r.level];
          return (
            <div key={i} className={`flex items-start gap-3 px-4 py-3 rounded-lg border ${cls}`}>
              <Icon className="w-4 h-4 mt-0.5 shrink-0" />
              <p className="text-sm">{r.text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
