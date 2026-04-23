"use client";
import { useState } from "react";

interface GeoPoint {
  ip: string;
  country: string;
  country_code: string;
  city: string;
  lat: number;
  lon: number;
  org: string;
}

// Equirectangular projection: map lat/lon to SVG coords (1010×500 viewBox)
const project = (lat: number, lon: number) => ({
  x: ((lon + 180) / 360) * 1010,
  y: ((90 - lat) / 180) * 500,
});

export default function GeoMap({ points }: { points: GeoPoint[] }) {
  const [tooltip, setTooltip] = useState<GeoPoint | null>(null);

  if (!points?.length) return null;

  return (
    <div className="bg-gray-800 rounded-xl p-5">
      <h2 className="text-lg font-semibold mb-4">IP Geolocation</h2>
      <div className="relative rounded-lg overflow-hidden bg-gray-900">
        <svg viewBox="0 0 1010 500" className="w-full">
          {/* World outline — simplified Natural Earth */}
          <image
            href="https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/World_map_-_low_resolution.svg/1280px-World_map_-_low_resolution.svg.png"
            x="0" y="0" width="1010" height="500"
            preserveAspectRatio="xMidYMid slice"
            opacity="0.25"
          />
          {/* Grid lines */}
          {[-60, -30, 0, 30, 60].map((lat) => {
            const y = ((90 - lat) / 180) * 500;
            return <line key={lat} x1="0" y1={y} x2="1010" y2={y} stroke="#374151" strokeWidth="0.5" />;
          })}
          {[-120, -60, 0, 60, 120].map((lon) => {
            const x = ((lon + 180) / 360) * 1010;
            return <line key={lon} x1={x} y1="0" x2={x} y2="500" stroke="#374151" strokeWidth="0.5" />;
          })}

          {/* IP markers */}
          {points.map((p, i) => {
            const { x, y } = project(p.lat, p.lon);
            return (
              <g key={i} onMouseEnter={() => setTooltip(p)} onMouseLeave={() => setTooltip(null)}>
                <circle cx={x} cy={y} r="10" fill="#3b82f6" opacity="0.2" />
                <circle cx={x} cy={y} r="5" fill="#3b82f6" stroke="#93c5fd" strokeWidth="1.5" className="cursor-pointer" />
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        {tooltip && (
          <div className="absolute bottom-3 left-3 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-xs pointer-events-none">
            <p className="font-mono font-bold text-blue-400">{tooltip.ip}</p>
            <p className="text-gray-300">{tooltip.city}, {tooltip.country}</p>
            <p className="text-gray-500 truncate max-w-48">{tooltip.org}</p>
          </div>
        )}
      </div>

      {/* Legend table */}
      <div className="mt-3 space-y-1">
        {points.map((p, i) => (
          <div key={i} className="flex items-center gap-3 text-xs">
            <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
            <span className="font-mono text-gray-300 w-32 shrink-0">{p.ip}</span>
            <span className="text-gray-400">{p.city}, {p.country}</span>
            <span className="text-gray-500 truncate">{p.org}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
