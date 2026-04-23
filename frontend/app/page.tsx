"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Shield } from "lucide-react";

export default function Home() {
  const [domain, setDomain] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim()) return;
    router.push(`/analyze/${encodeURIComponent(domain.trim())}`);
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
    </main>
  );
}
