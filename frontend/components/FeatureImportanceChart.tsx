"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface FeatureItem {
  feature: string;
  value: number;
  impact: "high" | "medium" | "low";
}

const impactColor = { high: "#ef4444", medium: "#f59e0b", low: "#10b981" };
const impactGlow = { high: "rgba(239, 68, 68, 0.3)", medium: "rgba(245, 158, 11, 0.3)", low: "rgba(16, 185, 129, 0.3)" };

export default function FeatureImportanceChart({ data }: { data: FeatureItem[] }) {
  if (!data?.length) return null;

  return (
    <div className="bg-gray-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Feature Importance</h2>
        <div className="flex gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
            <span className="text-gray-400">High</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
            <span className="text-gray-400">Medium</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
            <span className="text-gray-400">Low</span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={data.length * 42 + 30}>
        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 60, top: 5, bottom: 5 }}>
          <defs>
            {Object.entries(impactColor).map(([impact, color]) => (
              <linearGradient key={impact} id={`gradient-${impact}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={color} stopOpacity={0.8} />
                <stop offset="100%" stopColor={color} stopOpacity={1} />
              </linearGradient>
            ))}
          </defs>
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="feature"
            width={180}
            tick={{ fill: "#d1d5db", fontSize: 13, fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: "rgba(55, 65, 81, 0.5)" }}
            contentStyle={{ 
              background: "linear-gradient(135deg, #1f2937 0%, #111827 100%)", 
              border: "1px solid #374151", 
              borderRadius: 12,
              boxShadow: "0 10px 25px rgba(0,0,0,0.5)"
            }}
            labelStyle={{ color: "#f9fafb", fontWeight: 600, marginBottom: 4 }}
            formatter={(v) => [Number(v).toFixed(1), "Impact Score"]}
          />
          <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={28}>
            {data.map((d, i) => (
              <Cell 
                key={i} 
                fill={`url(#gradient-${d.impact})`}
                style={{
                  filter: `drop-shadow(0 0 8px ${impactGlow[d.impact]})`
                }}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
