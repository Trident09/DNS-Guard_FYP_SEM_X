"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search, Shield, Clock, X, Zap, Lock, Globe,
  AlertTriangle, FileText, Brain, Network, Eye, ChevronRight,
  CheckCircle, Activity, ExternalLink,
} from "lucide-react";
import LiveStats from "@/components/LiveStats";
import DangerousDomainsLeaderboard from "@/components/DangerousDomainsLeaderboard";
import ThreatFeedTicker from "@/components/ThreatFeedTicker";
import ThreatHeatmap from "@/components/ThreatHeatmap";
import DomainComparison from "@/components/DomainComparison";

const STORAGE_KEY = "dns_guard_recent";
const MAX_RECENT = 5;

const FEATURES = [
  { icon: Brain, title: "ML Threat Scoring", desc: "40-feature vector ensemble model gives a 0–100 risk score with SHAP-style explainability.", color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20" },
  { icon: Lock, title: "DNSSEC Validation", desc: "Validates DNSKEY, RRSIG, and DS records to detect unsigned or misconfigured zones.", color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
  { icon: Globe, title: "WHOIS & History", desc: "Registrar info, domain age, expiry flags, and change detection between scans.", color: "text-green-400", bg: "bg-green-400/10", border: "border-green-400/20" },
  { icon: Eye, title: "Typosquat Detection", desc: "Edit-distance matching against top global brands to catch impersonation domains.", color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20" },
  { icon: Network, title: "Passive DNS", desc: "Historical IP resolution data with fast-flux detection for evasive infrastructure.", color: "text-cyan-400", bg: "bg-cyan-400/10", border: "border-cyan-400/20" },
  { icon: AlertTriangle, title: "Threat Intelligence", desc: "Real-time Spamhaus DBL and PhishTank blocklist checks with cert transparency.", color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20" },
  { icon: FileText, title: "PDF Reports", desc: "Download a comprehensive, shareable PDF report for any domain scan.", color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/20" },
  { icon: Zap, title: "AI Chatbot", desc: "Context-aware DNS security assistant powered by Groq LLaMA 3.1 with rule-based fallback.", color: "text-pink-400", bg: "bg-pink-400/10", border: "border-pink-400/20" },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Enter a Domain", desc: "Type any domain name into the search bar and hit Analyze." },
  { step: "02", title: "Deep Scan", desc: "DNS, WHOIS, certificates, passive DNS, subdomains, and threat feeds queried in parallel." },
  { step: "03", title: "ML Scoring", desc: "A 40-feature vector is scored by an ensemble ML model with full explainability." },
  { step: "04", title: "Review & Export", desc: "Explore the dashboard, chat with the AI assistant, or download a PDF report." },
];

const CHECKLIST = [
  "DNS A, MX, NS, TXT record presence and anomalies",
  "DNSSEC chain validation (DNSKEY, RRSIG, DS)",
  "SPF, DKIM, DMARC email security configuration",
  "WHOIS registrar, creation date, expiry, and change diff",
  "Certificate Transparency log count and wildcard detection",
  "Passive DNS historical IP resolution and fast-flux detection",
  "Subdomain enumeration via brute-force and CT logs",
  "Reverse IP co-hosted domain density analysis",
  "Spamhaus DBL and PhishTank blocklist lookups",
  "IP geolocation mapping across all resolved IPs",
  "Typosquatting similarity against top 500 global brands",
  "ML ensemble threat score with feature importance (SHAP-style)",
];

const SIMILAR_TOOLS = [
  {
    name: "VirusTotal",
    url: "https://www.virustotal.com",
    badge: "Industry Standard",
    badgeColor: "text-green-400 bg-green-400/10 border-green-400/20",
    strengths: ["70+ AV engine scanning", "File & URL analysis", "Huge community dataset", "API access"],
    weaknesses: ["No ML threat scoring", "No WHOIS diff", "No AI chatbot", "Limited DNS deep-dive"],
    focus: "Malware & file scanning",
  },
  {
    name: "Shodan",
    url: "https://www.shodan.io",
    badge: "Infrastructure Intel",
    badgeColor: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    strengths: ["Internet-wide port scanning", "Banner grabbing", "CVE exposure detection", "IoT device discovery"],
    weaknesses: ["No DNSSEC analysis", "No typosquat detection", "No PDF reports", "Paid for full access"],
    focus: "Exposed services & ports",
  },
  {
    name: "MXToolbox",
    url: "https://mxtoolbox.com",
    badge: "Email Focused",
    badgeColor: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
    strengths: ["SPF/DKIM/DMARC checks", "Blacklist monitoring", "Email deliverability", "DNS lookup tools"],
    weaknesses: ["No ML scoring", "No passive DNS", "No typosquat detection", "No AI assistant"],
    focus: "Email & DNS health",
  },
  {
    name: "SecurityTrails",
    url: "https://securitytrails.com",
    badge: "Historical DNS",
    badgeColor: "text-purple-400 bg-purple-400/10 border-purple-400/20",
    strengths: ["Deep DNS history", "Subdomain enumeration", "WHOIS history", "API-first platform"],
    weaknesses: ["Mostly paid", "No threat scoring", "No AI chatbot", "No PDF export"],
    focus: "DNS history & recon",
  },
  {
    name: "URLScan.io",
    url: "https://urlscan.io",
    badge: "URL Analysis",
    badgeColor: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
    strengths: ["Visual page screenshots", "DOM analysis", "Phishing detection", "Free & open"],
    weaknesses: ["No DNSSEC", "No ML model", "No WHOIS diff", "No passive DNS"],
    focus: "URL & page scanning",
  },
  {
    name: "DNS Guard (This Tool)",
    url: "#",
    badge: "All-in-One",
    badgeColor: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    strengths: ["ML threat scoring + explainability", "DNSSEC + WHOIS diff", "AI chatbot assistant", "PDF reports + geo map"],
    weaknesses: ["Newer platform", "Smaller dataset vs VirusTotal", "No file scanning"],
    focus: "DNS-focused threat intelligence",
    highlight: true,
  },
];

const EXAMPLE_DOMAINS = ["google.com", "paypa1.com", "cloudflare.com", "phishing-test.com"];

const TABS = ["Features", "How It Works", "What We Check", "Compare Tools"];

export default function Home() {
  const [domain, setDomain] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("Features");
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const router = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try { setRecent(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")); } catch {}
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setMouse({ x: e.clientX, y: e.clientY });
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

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
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Cursor glow */}
      <div
        className="pointer-events-none fixed inset-0 z-30"
        style={{
          background: `
            radial-gradient(400px circle at ${mouse.x}px ${mouse.y}px, rgba(99,102,241,0.18), transparent 50%),
            radial-gradient(700px circle at ${mouse.x}px ${mouse.y}px, rgba(59,130,246,0.10), transparent 60%),
            radial-gradient(1000px circle at ${mouse.x}px ${mouse.y}px, rgba(139,92,246,0.05), transparent 70%)
          `,
        }}
      />

      {/* Hero */}
      <section ref={heroRef} className="relative flex flex-col items-center justify-center min-h-screen px-4 pt-16 overflow-hidden">
        {/* Static background orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-600/8 rounded-full blur-3xl" />
          <div className="absolute top-2/3 left-1/4 w-[400px] h-[400px] bg-purple-600/6 rounded-full blur-3xl" />
          <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-cyan-600/5 rounded-full blur-3xl" />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }} />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center max-w-3xl">
          <div className="flex items-center gap-2 mb-6 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm">
            <Activity className="w-3.5 h-3.5" />
            Domain Threat Intelligence Platform
          </div>

          <div className="flex items-center gap-4 mb-6">
            <Shield className="w-14 h-14 text-blue-400 drop-shadow-[0_0_30px_rgba(96,165,250,0.6)]" />
            <h1 className="text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-blue-100 to-blue-400 bg-clip-text text-transparent">
              DNS Guard
            </h1>
          </div>

          <p className="text-xl text-gray-400 mb-3 leading-relaxed">
            Analyze any domain for <span className="text-white font-medium">DNS abuse</span>,{" "}
            <span className="text-white font-medium">misconfigurations</span>,{" "}
            <span className="text-white font-medium">phishing</span>, and{" "}
            <span className="text-white font-medium">typosquatting</span> — powered by ML.
          </p>
          <p className="text-sm text-gray-600 mb-10">
            Free · No account required · Results in under 30 seconds
          </p>

          {/* Search */}
          <form onSubmit={handleSubmit} className="flex w-full max-w-2xl gap-2 mb-4">
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="Enter a domain (e.g. example.com)"
              className="flex-1 px-5 py-4 rounded-xl bg-gray-800/80 border border-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-white placeholder-gray-500 text-lg transition-all"
            />
            <button
              type="submit"
              className="px-6 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl flex items-center gap-2 font-semibold transition-all hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] text-lg"
            >
              <Search className="w-5 h-5" />
              Analyze
            </button>
          </form>

          {/* Example domains */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            <span className="text-xs text-gray-600 uppercase tracking-widest">Try:</span>
            {EXAMPLE_DOMAINS.map((d) => (
              <button
                key={d}
                onClick={() => navigate(d)}
                className="px-3 py-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm text-gray-400 hover:text-white transition-colors"
              >
                {d}
              </button>
            ))}
          </div>

          {/* Recent searches */}
          {recent.length > 0 && (
            <div className="w-full max-w-2xl">
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Recent searches
              </p>
              <div className="flex flex-wrap gap-2">
                {recent.map((r) => (
                  <button
                    key={r}
                    onClick={() => navigate(r)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 transition-colors"
                  >
                    {r}
                    <X className="w-3 h-3 text-gray-500 hover:text-white" onClick={(e) => removeRecent(r, e)} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-gray-600 text-xs animate-bounce">
          <span>Scroll to explore</span>
          <ChevronRight className="w-4 h-4 rotate-90" />
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 border-y border-gray-800/50 bg-gray-900/30">
        <div className="max-w-4xl mx-auto">
          <LiveStats />
        </div>
      </section>

      {/* Live threat feed ticker */}
      <section className="py-8 px-4 bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <ThreatFeedTicker />
        </div>
      </section>

      {/* Dangerous domains + Threat heatmap */}
      <section className="py-16 px-4 bg-gray-950">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DangerousDomainsLeaderboard />
          <ThreatHeatmap />
        </div>
      </section>

      {/* Domain comparison */}
      <section className="py-16 px-4 bg-gray-950">
        <div className="max-w-4xl mx-auto">
          <DomainComparison />
        </div>
      </section>

      {/* Tabbed content */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Tab bar */}
          <div className="flex justify-center mb-12">
            <div className="flex gap-1 p-1 bg-gray-900 border border-gray-800 rounded-xl">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab
                      ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Features tab */}
          {activeTab === "Features" && (
            <div>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-3">Everything you need to assess a domain</h2>
                <p className="text-gray-400">17 analysis modules run in parallel for a complete threat picture.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {FEATURES.map(({ icon: Icon, title, desc, color, bg, border }) => (
                  <div key={title} className={`p-5 rounded-xl bg-gray-900 border ${border} hover:border-opacity-60 transition-all hover:-translate-y-0.5`}>
                    <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center mb-4`}>
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <h3 className="font-semibold mb-2">{title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* How it works tab */}
          {activeTab === "How It Works" && (
            <div>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-3">From domain to full threat report</h2>
                <p className="text-gray-400">Four steps, under 30 seconds.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {HOW_IT_WORKS.map(({ step, title, desc }, i) => (
                  <div key={step} className="relative flex flex-col items-center text-center">
                    {i < HOW_IT_WORKS.length - 1 && (
                      <div className="hidden md:block absolute top-6 left-[calc(50%+2rem)] right-0 h-px bg-gradient-to-r from-gray-700 to-transparent" />
                    )}
                    <div className="w-12 h-12 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm mb-4 relative z-10">
                      {step}
                    </div>
                    <h3 className="font-semibold mb-2">{title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
              {/* ML model detail */}
              <div className="mt-16 p-6 rounded-xl bg-gray-900 border border-gray-800">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><Brain className="w-5 h-5 text-purple-400" /> ML Model Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  {[
                    { label: "Lexical Features", count: "12", desc: "Entropy, length, digit ratio, brand keywords, phishing keywords, TLD risk" },
                    { label: "DNS Record Features", count: "14", desc: "A/MX/NS/TXT presence, SPF/DKIM/DMARC, fast-flux indicators" },
                    { label: "DNSSEC Features", count: "3", desc: "DNSKEY, RRSIG, DS record presence" },
                    { label: "Composite Features", count: "7+", desc: "No DNSSEC, MX without SPF/DMARC, high entropy, brand in subdomain" },
                  ].map(({ label, count, desc }) => (
                    <div key={label} className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                      <div className="text-2xl font-bold text-purple-400 mb-1">{count}</div>
                      <div className="font-medium mb-1">{label}</div>
                      <div className="text-gray-500 text-xs leading-relaxed">{desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* What we check tab */}
          {activeTab === "What We Check" && (
            <div>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-3">A comprehensive checklist</h2>
                <p className="text-gray-400">Every item below is run on every domain scan, automatically.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CHECKLIST.map((item) => (
                  <div key={item} className="flex items-start gap-3 p-4 rounded-lg bg-gray-900 border border-gray-800 hover:border-gray-700 transition-colors">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                    <span className="text-sm text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compare tools tab */}
          {activeTab === "Compare Tools" && (
            <div>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-3">How DNS Guard compares</h2>
                <p className="text-gray-400">Each tool has its strengths &mdash; here&apos;s where they shine and where they fall short.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {SIMILAR_TOOLS.map(({ name, url, badge, badgeColor, strengths, weaknesses, focus, highlight }) => (
                  <div
                    key={name}
                    className={`p-5 rounded-xl border transition-all ${
                      highlight
                        ? "bg-blue-950/30 border-blue-500/40 shadow-[0_0_20px_rgba(59,130,246,0.1)]"
                        : "bg-gray-900 border-gray-800 hover:border-gray-700"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-lg">{name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{focus}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${badgeColor}`}>{badge}</span>
                        {url !== "#" && (
                          <a href={url} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-400 transition-colors">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="mb-3">
                      <p className="text-xs text-green-400 uppercase tracking-widest mb-1.5">Strengths</p>
                      <ul className="space-y-1">
                        {strengths.map((s) => (
                          <li key={s} className="flex items-start gap-1.5 text-xs text-gray-300">
                            <span className="text-green-400 mt-0.5">+</span>{s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs text-red-400 uppercase tracking-widest mb-1.5">Limitations</p>
                      <ul className="space-y-1">
                        {weaknesses.map((w) => (
                          <li key={w} className="flex items-start gap-1.5 text-xs text-gray-500">
                            <span className="text-red-400/60 mt-0.5">−</span>{w}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 text-center border-t border-gray-800/50">
        <div className="max-w-2xl mx-auto">
          <Shield className="w-12 h-12 text-blue-400 mx-auto mb-6 drop-shadow-[0_0_20px_rgba(96,165,250,0.4)]" />
          <h2 className="text-3xl font-bold mb-4">Ready to analyze a domain?</h2>
          <p className="text-gray-400 mb-8">Free, fast, and comprehensive. No account required.</p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold text-lg transition-all hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] inline-flex items-center gap-2"
          >
            <Search className="w-5 h-5" />
            Start Analyzing
          </button>
        </div>
      </section>
    </div>
  );
}
