"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, GitCompare, Shield, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import axios from "axios";

interface Report {
  threat_score: number;
  verdict: string;
  dns_records: Record<string, string[]>;
  dnssec: Record<string, boolean>;
  whois: { registrar?: string; age_days?: number; is_new_domain?: boolean };
  threat_intel: { any_listed?: boolean };
  typosquat: { is_typosquat?: boolean };
}

function CompareContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const d1 = searchParams.get("d1") || "";
  const d2 = searchParams.get("d2") || "";

  const [report1, setReport1] = useState<Report | null>(null);
  const [report2, setReport2] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!d1 || !d2) return;
    Promise.all([
      axios.post("/api/analyze", { domain: d1 }),
      axios.post("/api/analyze", { domain: d2 }),
    ])
      .then(([res1, res2]) => {
        setReport1(res1.data);
        setReport2(res2.data);
      })
      .finally(() => setLoading(false));
  }, [d1, d2]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        <p className="animate-pulse text-lg">Comparing domains...</p>
      </div>
    );
  }

  if (!report1 || !report2) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-red-400">
        Failed to load comparison data
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-red-400";
    if (score >= 60) return "text-orange-400";
    if (score >= 40) return "text-yellow-400";
    return "text-green-400";
  };

  const ComparisonRow = ({ label, val1, val2 }: { label: string; val1: React.ReactNode; val2: React.ReactNode }) => (
    <div className="grid grid-cols-3 gap-4 p-3 rounded-lg bg-gray-800/50 border border-gray-700">
      <div className="text-sm text-gray-400">{label}</div>
      <div className="text-sm text-white text-center">{val1}</div>
      <div className="text-sm text-white text-center">{val2}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <GitCompare className="w-6 h-6 text-blue-400" />
        <h1 className="text-2xl font-bold">Domain Comparison</h1>
      </div>

      {/* Header cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="p-6 rounded-xl bg-gray-900 border border-gray-800">
          <div className="text-sm text-gray-500 mb-2">Domain 1</div>
          <div className="text-xl font-bold mb-4 text-blue-400">{d1}</div>
          <div className="flex items-center gap-3">
            <div className={`text-4xl font-bold ${getScoreColor(report1.threat_score)}`}>
              {report1.threat_score}
            </div>
            <div>
              <div className="text-sm text-gray-400">Threat Score</div>
              <div className="text-xs text-gray-600">{report1.verdict}</div>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-gray-900 border border-gray-800">
          <div className="text-sm text-gray-500 mb-2">Domain 2</div>
          <div className="text-xl font-bold mb-4 text-purple-400">{d2}</div>
          <div className="flex items-center gap-3">
            <div className={`text-4xl font-bold ${getScoreColor(report2.threat_score)}`}>
              {report2.threat_score}
            </div>
            <div>
              <div className="text-sm text-gray-400">Threat Score</div>
              <div className="text-xs text-gray-600">{report2.verdict}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison table */}
      <div className="p-6 rounded-xl bg-gray-900 border border-gray-800">
        <h2 className="text-lg font-bold mb-4">Feature Comparison</h2>
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-4 p-3 font-semibold text-sm text-gray-400 border-b border-gray-700">
            <div>Feature</div>
            <div className="text-center text-blue-400">{d1}</div>
            <div className="text-center text-purple-400">{d2}</div>
          </div>

          <ComparisonRow
            label="Threat Score"
            val1={<span className={getScoreColor(report1.threat_score)}>{report1.threat_score}</span>}
            val2={<span className={getScoreColor(report2.threat_score)}>{report2.threat_score}</span>}
          />

          <ComparisonRow
            label="DNSSEC Enabled"
            val1={
              report1.dnssec.has_dnskey ? (
                <CheckCircle className="w-4 h-4 text-green-400 mx-auto" />
              ) : (
                <XCircle className="w-4 h-4 text-red-400 mx-auto" />
              )
            }
            val2={
              report2.dnssec.has_dnskey ? (
                <CheckCircle className="w-4 h-4 text-green-400 mx-auto" />
              ) : (
                <XCircle className="w-4 h-4 text-red-400 mx-auto" />
              )
            }
          />

          <ComparisonRow
            label="Domain Age"
            val1={report1.whois.age_days ? `${Math.floor(report1.whois.age_days / 365)} years` : "Unknown"}
            val2={report2.whois.age_days ? `${Math.floor(report2.whois.age_days / 365)} years` : "Unknown"}
          />

          <ComparisonRow
            label="New Domain"
            val1={
              report1.whois.is_new_domain ? (
                <AlertTriangle className="w-4 h-4 text-yellow-400 mx-auto" />
              ) : (
                <CheckCircle className="w-4 h-4 text-green-400 mx-auto" />
              )
            }
            val2={
              report2.whois.is_new_domain ? (
                <AlertTriangle className="w-4 h-4 text-yellow-400 mx-auto" />
              ) : (
                <CheckCircle className="w-4 h-4 text-green-400 mx-auto" />
              )
            }
          />

          <ComparisonRow
            label="Blocklisted"
            val1={
              report1.threat_intel.any_listed ? (
                <XCircle className="w-4 h-4 text-red-400 mx-auto" />
              ) : (
                <CheckCircle className="w-4 h-4 text-green-400 mx-auto" />
              )
            }
            val2={
              report2.threat_intel.any_listed ? (
                <XCircle className="w-4 h-4 text-red-400 mx-auto" />
              ) : (
                <CheckCircle className="w-4 h-4 text-green-400 mx-auto" />
              )
            }
          />

          <ComparisonRow
            label="Typosquat Detected"
            val1={
              report1.typosquat.is_typosquat ? (
                <AlertTriangle className="w-4 h-4 text-red-400 mx-auto" />
              ) : (
                <CheckCircle className="w-4 h-4 text-green-400 mx-auto" />
              )
            }
            val2={
              report2.typosquat.is_typosquat ? (
                <AlertTriangle className="w-4 h-4 text-red-400 mx-auto" />
              ) : (
                <CheckCircle className="w-4 h-4 text-green-400 mx-auto" />
              )
            }
          />

          <ComparisonRow
            label="DNS A Records"
            val1={report1.dns_records.A?.length || 0}
            val2={report2.dns_records.A?.length || 0}
          />

          <ComparisonRow
            label="DNS MX Records"
            val1={report1.dns_records.MX?.length || 0}
            val2={report2.dns_records.MX?.length || 0}
          />

          <ComparisonRow
            label="Registrar"
            val1={report1.whois.registrar || "Unknown"}
            val2={report2.whois.registrar || "Unknown"}
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <button
          onClick={() => router.push(`/analyze/${encodeURIComponent(d1)}`)}
          className="px-4 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <Shield className="w-4 h-4" />
          View Full Report for {d1}
        </button>
        <button
          onClick={() => router.push(`/analyze/${encodeURIComponent(d2)}`)}
          className="px-4 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <Shield className="w-4 h-4" />
          View Full Report for {d2}
        </button>
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">Loading...</div>}>
      <CompareContent />
    </Suspense>
  );
}
