"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface FeatureItem {
  feature: string;
  value: number;
  impact: "high" | "medium" | "low";
}

const impactColor = { high: "#f87171", medium: "#facc15", low: "#4ade80" };

export default function FeatureImportanceChart({ data }: { data: FeatureItem[] }) {
  if (!data?.length) return null;

  return (
    <div className="bg-gray-800 rounded-xl p-5">
      <h2 className="text-lg font-semibold mb-1">Feature Importance</h2>
      <p className="text-xs text-gray-500 mb-4">Top factors contributing to the threat score</p>
      <ResponsiveContainer width="100%" height={data.length * 36 + 20}>
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24 }}>
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="feature"
            width={160}
            tick={{ fill: "#9ca3af", fontSize: 12 }}
          />
          <Tooltip
            cursor={{ fill: "#374151" }}
            contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8 }}
            labelStyle={{ color: "#f9fafb" }}
            formatter={(v) => [Number(v).toFixed(1), "Score contribution"]}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((d, i) => (
              <Cell key={i} fill={impactColor[d.impact]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
