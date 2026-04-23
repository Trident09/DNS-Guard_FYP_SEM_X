"use client";

import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import ThreatScoreCard from "@/components/ThreatScoreCard";
import DnsRecordsTable from "@/components/DnsRecordsTable";
import ExplainabilityPanel from "@/components/ExplainabilityPanel";
import WhoisCard from "@/components/WhoisCard";
import CertCard from "@/components/CertCard";
import PassiveDnsCard from "@/components/PassiveDnsCard";
import TyposquatCard from "@/components/TyposquatCard";
import SubdomainCard from "@/components/SubdomainCard";
import ReverseIpCard from "@/components/ReverseIpCard";
import ThreatIntelCard from "@/components/ThreatIntelCard";
import ChatBot from "@/components/ChatBot";

interface Report {
  threat_score: number;
  verdict: string;
  dns_records: Record<string, string[]>;
  dnssec: Record<string, boolean>;
  whois: {
    registrar?: string;
    creation_date?: string;
    expiry_date?: string;
    age_days?: number;
    days_until_expiry?: number;
    is_new_domain?: boolean;
    expiring_soon?: boolean;
    error?: string;
  };
  certs: {
    total_certs?: number;
    wildcard_certs?: number;
    certs_last_30d?: number;
    cert_spike?: boolean;
    has_wildcards?: boolean;
    recent_certs?: { id: number; issuer: string; name: string; not_before: string; not_after: string }[];
    error?: string;
  };
  passive_dns: {
    total_records?: number;
    unique_ip_count?: number;
    fast_flux_suspected?: boolean;
    top_ips?: { ip: string; count: number }[];
    error?: string;
  };
  typosquat: {
    is_typosquat?: boolean;
    match_count?: number;
    matches?: { target: string; distance: number; your_sld: string; target_sld: string }[];
    checked_against?: number;
    error?: string;
  };
  subdomains: {
    total_found?: number;
    subdomains?: string[];
    suspicious?: string[];
    suspicious_count?: number;
    sources?: { brute_force: number; cert_transparency: number };
  };
  reverse_ip: {
    ip?: string;
    shared_domains?: string[];
    shared_count?: number;
    high_density_hosting?: boolean;
    error?: string;
  };
  threat_intel: {
    any_listed?: boolean;
    spamhaus_dbl?: { listed: boolean; reason?: string | null };
    phishtank?: { listed: boolean; url?: string; target?: string };
  };
  explanations: { feature: string; reason: string; impact: "high" | "medium" | "low" }[];
}

export default function AnalyzePage() {
  const { domain } = useParams<{ domain: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .post("/api/analyze", { domain: decodeURIComponent(domain) })
      .then((res) => setReport(res.data))
      .catch(() => setError("Analysis failed. Please try again."))
      .finally(() => setLoading(false));
  }, [domain]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        <p className="animate-pulse text-lg">Analyzing {decodeURIComponent(domain)}…</p>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-red-400">
        {error}
      </div>
    );

  if (!report) return null;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          Report: <span className="text-blue-400">{decodeURIComponent(domain)}</span>
        </h1>
        <a
          href={`/api/report/${encodeURIComponent(decodeURIComponent(domain))}/pdf`}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors"
        >
          <Download className="w-4 h-4" />
          Download PDF
        </a>
      </div>

      {/* Threat score — full width */}
      <div className="mb-6">
        <ThreatScoreCard score={report.threat_score} verdict={report.verdict} />
      </div>

      {/* WHOIS + DNS records + Certs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <WhoisCard data={report.whois} />
        <DnsRecordsTable records={report.dns_records} />
      </div>
      {/* Cert + Passive DNS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <CertCard data={report.certs} />
        <PassiveDnsCard data={report.passive_dns} />
      </div>

      {/* Typosquat + Subdomains */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <TyposquatCard data={report.typosquat} />
        <SubdomainCard data={report.subdomains} />
      </div>

      {/* Reverse IP + Threat Intel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ReverseIpCard data={report.reverse_ip} />
        <ThreatIntelCard data={report.threat_intel} />
      </div>

      {/* Explainability */}
      <div className="mb-6">
        <ExplainabilityPanel explanations={report.explanations} />
      </div>

      {/* Chatbot */}
      <ChatBot domain={decodeURIComponent(domain)} />
    </div>
  );
}
