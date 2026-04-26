"use client";

import { useEffect, useState } from "react";
import { Activity, Shield, AlertTriangle, Globe } from "lucide-react";

export default function LiveStats() {
  const [stats, setStats] = useState({ scans: 0, threats: 0, domains: 0, countries: 0 });

  useEffect(() => {
    // Simulate live counting animation
    const targets = { scans: 12847, threats: 3421, domains: 8956, countries: 142 };
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      setStats({
        scans: Math.floor(targets.scans * progress),
        threats: Math.floor(targets.threats * progress),
        domains: Math.floor(targets.domains * progress),
        countries: Math.floor(targets.countries * progress),
      });
      if (step >= steps) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const items = [
    { icon: Activity, label: "Total Scans", value: stats.scans.toLocaleString(), color: "text-blue-400", bg: "bg-blue-400/10" },
    { icon: AlertTriangle, label: "Threats Detected", value: stats.threats.toLocaleString(), color: "text-red-400", bg: "bg-red-400/10" },
    { icon: Shield, label: "Domains Analyzed", value: stats.domains.toLocaleString(), color: "text-green-400", bg: "bg-green-400/10" },
    { icon: Globe, label: "Countries", value: stats.countries.toLocaleString(), color: "text-purple-400", bg: "bg-purple-400/10" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map(({ icon: Icon, label, value, color, bg }) => (
        <div key={label} className={`p-4 rounded-xl ${bg} border border-gray-800 hover:border-gray-700 transition-all`}>
          <Icon className={`w-5 h-5 ${color} mb-2`} />
          <div className={`text-2xl font-bold ${color} mb-1`}>{value}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">{label}</div>
        </div>
      ))}
    </div>
  );
}
