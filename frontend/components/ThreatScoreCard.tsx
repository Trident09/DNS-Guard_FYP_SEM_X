"use client";
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from "recharts";

interface Props {
  score: number;
  verdict: string;
  confidence_interval?: [number, number];
}

const color = (s: number) => s >= 70 ? "#f87171" : s >= 40 ? "#facc15" : "#4ade80";

export default function ThreatScoreCard({ score, verdict, confidence_interval }: Props) {
  const fill = color(score);
  return (
    <div className="bg-gray-800 rounded-xl p-6 flex items-center gap-8">
      <div className="relative w-40 h-40 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            innerRadius="70%"
            outerRadius="100%"
            data={[{ value: score, fill }]}
            startAngle={210}
            endAngle={-30}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar dataKey="value" cornerRadius={6} background={{ fill: "#374151" }} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-black" style={{ color: fill }}>{score}</span>
          <span className="text-xs text-gray-400">/100</span>
        </div>
      </div>
      <div>
        <p className="text-gray-400 text-sm uppercase tracking-widest">Threat Score</p>
        <p className="text-2xl font-bold mt-1" style={{ color: fill }}>{verdict}</p>
        {confidence_interval && (
          <p className="text-xs text-gray-500 mt-1">
            95% CI: {confidence_interval[0]} – {confidence_interval[1]}
          </p>
        )}
      </div>
    </div>
  );
}
