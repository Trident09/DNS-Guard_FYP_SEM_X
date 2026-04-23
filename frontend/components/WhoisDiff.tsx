"use client";
import { useEffect, useState } from "react";
import { GitCompare } from "lucide-react";

interface WhoisData {
  registrar?: string;
  creation_date?: string;
  expiry_date?: string;
  age_days?: number;
  days_until_expiry?: number;
}

const FIELDS: { key: keyof WhoisData; label: string }[] = [
  { key: "registrar", label: "Registrar" },
  { key: "creation_date", label: "Registered" },
  { key: "expiry_date", label: "Expires" },
];

const fmt = (v?: string | number) => {
  if (v == null) return "—";
  if (typeof v === "string" && v.includes("T")) return new Date(v).toLocaleDateString();
  return String(v);
};

export default function WhoisDiff({ domain, current }: { domain: string; current: WhoisData }) {
  const [prev, setPrev] = useState<WhoisData | null>(null);
  const key = `whois_${domain}`;

  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) setPrev(JSON.parse(stored));
    } catch {}
    // Save current for next visit
    localStorage.setItem(key, JSON.stringify(current));
  }, [key, current]);

  const diffs = FIELDS.filter((f) => prev && fmt(prev[f.key]) !== fmt(current[f.key]));

  if (!prev || diffs.length === 0) return null;

  return (
    <div className="bg-gray-800 rounded-xl p-5">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <GitCompare className="w-5 h-5 text-yellow-400" />
        WHOIS Changes Detected
      </h2>
      <div className="space-y-3">
        {diffs.map(({ key: k, label }) => (
          <div key={k} className="text-sm">
            <p className="text-gray-400 mb-1">{label}</p>
            <div className="flex gap-3">
              <span className="px-2 py-1 bg-red-900/40 text-red-300 rounded font-mono text-xs line-through">
                {fmt(prev![k])}
              </span>
              <span className="text-gray-500">→</span>
              <span className="px-2 py-1 bg-green-900/40 text-green-300 rounded font-mono text-xs">
                {fmt(current[k])}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
