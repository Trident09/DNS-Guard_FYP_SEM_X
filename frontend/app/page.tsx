"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Shield, Clock, X } from "lucide-react";

const STORAGE_KEY = "dns_guard_recent";
const MAX_RECENT = 5;

export default function Home() {
  const [domain, setDomain] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    try {
      setRecent(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"));
    } catch {}
  }, []);

  const navigate = (d: string) => {
    const updated = [d, ...recent.filter((r) => r !== d)].slice(0, MAX_RECENT);
    setRecent(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    router.push(`/analyze/${encodeURIComponent(d)}`);
  };

  const removeRecent = (d: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recent.filter((r) => r !== d);
    setRecent(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim()) return;
    navigate(domain.trim());
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white px-4">
      <div className="flex items-center gap-3 mb-4">
        <Shield className="w-10 h-10 text-blue-400" />
        <h1 className="text-4xl font-bold">DNS Guard</h1>
      </div>
      <p className="text-gray-400 mb-10 text-center max-w-md">
        Analyze any domain for DNS abuse, misconfigurations, and security threats.
      </p>
      <form onSubmit={handleSubmit} className="flex w-full max-w-xl gap-2">
        <input
          type="text"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="Enter a domain (e.g. example.com)"
          className="flex-1 px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-blue-500 text-white"
        />
        <button
          type="submit"
          className="px-5 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg flex items-center gap-2 font-medium transition-colors"
        >
          <Search className="w-4 h-4" />
          Analyze
        </button>
      </form>

      {recent.length > 0 && (
        <div className="mt-8 w-full max-w-xl">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Recent searches
          </p>
          <div className="flex flex-wrap gap-2">
            {recent.map((r) => (
              <button
                key={r}
                onClick={() => navigate(r)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 transition-colors group"
              >
                {r}
                <X
                  className="w-3 h-3 text-gray-500 hover:text-white"
                  onClick={(e) => removeRecent(r, e)}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
