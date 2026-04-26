import { AlertTriangle, Server } from "lucide-react";

interface ReverseIpData {
  ip?: string;
  shared_domains?: string[];
  shared_count?: number;
  high_density_hosting?: boolean;
  error?: string;
}

export default function ReverseIpCard({ data }: { data: ReverseIpData }) {
  if (!data || data.error) {
    return (
      <div className="bg-gray-800 rounded-xl p-5">
        <h2 className="text-lg font-semibold mb-4">Reverse IP</h2>
        <p className="text-sm text-gray-400">
          {data?.error ? `Error: ${data.error}` : "No reverse IP data available"}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-5">
      <h2 className="text-lg font-semibold mb-4">Reverse IP</h2>

      <div className="space-y-2 text-sm mb-4">
        <div className="flex items-center gap-2 text-gray-300">
          <Server className="w-4 h-4 text-blue-400" />
          <span className="font-mono">{data.ip ?? "—"}</span>
        </div>

        {data.high_density_hosting && (
          <div className="flex items-center gap-2 text-yellow-400 font-medium">
            <AlertTriangle className="w-4 h-4" />
            High-density hosting — {data.shared_count} domains on same IP
          </div>
        )}

        <div className="flex justify-between text-gray-400">
          <span>Domains sharing IP</span>
          <span className="text-white">{data.shared_count ?? 0}</span>
        </div>
      </div>

      {(data.shared_domains?.length ?? 0) > 0 && (
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Co-hosted domains</p>
          <ul className="space-y-0.5 max-h-40 overflow-y-auto">
            {data.shared_domains!.map((d) => (
              <li key={d} className="text-xs font-mono text-gray-300">{d}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
