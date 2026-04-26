"use client";

import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";

const THREAT_FEEDS = [
  { domain: "secure-login-verify.xyz", type: "Phishing", time: "2m ago" },
  { domain: "bank-security-alert.com", type: "Banking Fraud", time: "5m ago" },
  { domain: "crypto-wallet-restore.net", type: "Crypto Scam", time: "8m ago" },
  { domain: "paypa1-dispute.org", type: "Typosquat", time: "12m ago" },
  { domain: "microsoft-support-team.com", type: "Tech Support Scam", time: "15m ago" },
  { domain: "amazon-prize-winner.net", type: "Phishing", time: "18m ago" },
  { domain: "apple-icloud-locked.com", type: "Credential Theft", time: "22m ago" },
  { domain: "netflix-billing-update.org", type: "Phishing", time: "25m ago" },
];

export default function ThreatFeedTicker() {
  const [feeds, setFeeds] = useState(THREAT_FEEDS);

  useEffect(() => {
    const interval = setInterval(() => {
      setFeeds((prev) => [...prev.slice(1), prev[0]]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden bg-red-950/20 border border-red-900/30 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <AlertCircle className="w-4 h-4 text-red-400 animate-pulse" />
        <span className="text-sm font-semibold text-red-400 uppercase tracking-wider">Live Threat Feed</span>
      </div>
      <div className="relative h-6 overflow-hidden">
        <div className="absolute inset-0 flex flex-col transition-transform duration-500" style={{ transform: `translateY(-${0 * 24}px)` }}>
          {feeds.map((feed, idx) => (
            <div key={idx} className="flex items-center gap-3 h-6 text-sm">
              <span className="font-mono text-gray-300">{feed.domain}</span>
              <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs">{feed.type}</span>
              <span className="text-gray-600 text-xs ml-auto">{feed.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
