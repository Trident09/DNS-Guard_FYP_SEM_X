"use client";

import { useState } from "react";
import { GitCompare, Search, X, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DomainComparison() {
  const [domain1, setDomain1] = useState("");
  const [domain2, setDomain2] = useState("");
  const router = useRouter();

  const handleCompare = () => {
    if (!domain1.trim() || !domain2.trim()) return;
    router.push(`/compare?d1=${encodeURIComponent(domain1.trim())}&d2=${encodeURIComponent(domain2.trim())}`);
  };

  return (
    <div className="p-6 rounded-xl bg-gradient-to-br from-blue-950/30 to-purple-950/30 border border-blue-900/30">
      <div className="flex items-center gap-2 mb-4">
        <GitCompare className="w-5 h-5 text-blue-400" />
        <h3 className="text-xl font-bold">Compare Domains</h3>
      </div>
      <p className="text-sm text-gray-400 mb-4">
        Analyze two domains side-by-side to compare threat scores, DNS records, and security features.
      </p>
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={domain1}
            onChange={(e) => setDomain1(e.target.value)}
            placeholder="First domain (e.g. google.com)"
            className="w-full px-4 py-3 rounded-lg bg-gray-800/80 border border-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-white placeholder-gray-500 text-sm"
          />
          {domain1 && (
            <button
              onClick={() => setDomain1("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex items-center justify-center">
          <ArrowRight className="w-5 h-5 text-gray-600 rotate-90 md:rotate-0" />
        </div>
        <div className="flex-1 relative">
          <input
            type="text"
            value={domain2}
            onChange={(e) => setDomain2(e.target.value)}
            placeholder="Second domain (e.g. goog1e.com)"
            className="w-full px-4 py-3 rounded-lg bg-gray-800/80 border border-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-white placeholder-gray-500 text-sm"
          />
          {domain2 && (
            <button
              onClick={() => setDomain2("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={handleCompare}
          disabled={!domain1.trim() || !domain2.trim()}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg flex items-center justify-center gap-2 font-semibold transition-all text-sm"
        >
          <Search className="w-4 h-4" />
          Compare
        </button>
      </div>
    </div>
  );
}
