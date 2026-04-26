"use client";

import { AlertTriangle, TrendingUp, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";

const DANGEROUS_DOMAINS = [
  { domain: "paypa1-secure.com", score: 94, category: "Phishing", trend: "+12" },
  { domain: "amaz0n-verify.net", score: 91, category: "Typosquat", trend: "+8" },
  { domain: "micros0ft-login.org", score: 89, category: "Credential Theft", trend: "+15" },
  { domain: "goog1e-auth.com", score: 87, category: "Phishing", trend: "+6" },
  { domain: "app1e-id-verify.net", score: 85, category: "Typosquat", trend: "+9" },
  { domain: "secure-bank-login.xyz", score: 83, category: "Banking Fraud", trend: "+11" },
  { domain: "crypto-wallet-verify.com", score: 81, category: "Crypto Scam", trend: "+7" },
  { domain: "netflix-payment.org", score: 78, category: "Phishing", trend: "+5" },
];

export default function DangerousDomainsLeaderboard() {
  const router = useRouter();

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-red-400 bg-red-400/10 border-red-400/20";
    if (score >= 60) return "text-orange-400 bg-orange-400/10 border-orange-400/20";
    return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
  };

  return (
    <div className="p-6 rounded-xl bg-gray-900 border border-gray-800">
      <div className="flex items-center gap-2 mb-6">
        <AlertTriangle className="w-5 h-5 text-red-400" />
        <h3 className="text-xl font-bold">Most Dangerous Domains</h3>
        <span className="text-xs text-gray-500 ml-auto">Last 24 hours</span>
      </div>
      <div className="space-y-2">
        {DANGEROUS_DOMAINS.map((item, idx) => (
          <div
            key={item.domain}
            onClick={() => router.push(`/analyze/${encodeURIComponent(item.domain)}`)}
            className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 hover:border-gray-600 transition-all cursor-pointer group"
          >
            <div className="text-lg font-bold text-gray-600 w-6">{idx + 1}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-sm text-white truncate">{item.domain}</span>
                <ExternalLink className="w-3 h-3 text-gray-600 group-hover:text-gray-400 transition-colors shrink-0" />
              </div>
              <div className="text-xs text-gray-500">{item.category}</div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${getScoreColor(item.score)} border`}>
                <TrendingUp className="w-3 h-3" />
                {item.trend}
              </div>
              <div className={`px-3 py-1 rounded-lg font-bold text-sm ${getScoreColor(item.score)} border`}>
                {item.score}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
