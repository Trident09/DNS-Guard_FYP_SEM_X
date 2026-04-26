"use client";

import { MapPin } from "lucide-react";

const THREAT_DATA = [
  { country: "United States", code: "US", threats: 1247, flag: "🇺🇸" },
  { country: "China", code: "CN", threats: 1034, flag: "🇨🇳" },
  { country: "Russia", code: "RU", threats: 892, flag: "🇷🇺" },
  { country: "India", code: "IN", threats: 678, flag: "🇮🇳" },
  { country: "Nigeria", code: "NG", threats: 534, flag: "🇳🇬" },
  { country: "Brazil", code: "BR", threats: 456, flag: "🇧🇷" },
  { country: "United Kingdom", code: "GB", threats: 389, flag: "🇬🇧" },
  { country: "Germany", code: "DE", threats: 312, flag: "🇩🇪" },
];

export default function ThreatHeatmap() {
  const maxThreats = Math.max(...THREAT_DATA.map(d => d.threats));

  const getColor = (threats: number) => {
    if (threats > 1000) return "bg-red-500";
    if (threats > 500) return "bg-orange-500";
    return "bg-yellow-500";
  };

  const getBarColor = (threats: number) => {
    if (threats > 1000) return "bg-gradient-to-r from-red-500 to-red-600";
    if (threats > 500) return "bg-gradient-to-r from-orange-500 to-orange-600";
    return "bg-gradient-to-r from-yellow-500 to-yellow-600";
  };

  return (
    <div className="p-6 rounded-xl bg-gray-900 border border-gray-800">
      <div className="flex items-center gap-2 mb-6">
        <MapPin className="w-5 h-5 text-blue-400" />
        <h3 className="text-xl font-bold">Global Threat Distribution</h3>
      </div>
      
      <div className="space-y-3">
        {THREAT_DATA.map((item) => {
          const percentage = (item.threats / maxThreats) * 100;
          return (
            <div key={item.code} className="group">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{item.flag}</span>
                  <span className="text-sm font-medium text-gray-300">{item.country}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{item.threats.toLocaleString()}</span>
                  <div className={`w-2 h-2 rounded-full ${getColor(item.threats)}`} />
                </div>
              </div>
              <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getBarColor(item.threats)} transition-all duration-500 ease-out group-hover:opacity-90`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-gray-800 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-gray-400">Critical (&gt;1000)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500" />
          <span className="text-gray-400">High (500-1000)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <span className="text-gray-400">Medium (&lt;500)</span>
        </div>
      </div>
    </div>
  );
}
