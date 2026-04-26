import { AlertTriangle, ShieldCheck } from "lucide-react";

interface PassiveDnsData {
  total_records?: number;
  unique_ip_count?: number;
  fast_flux_suspected?: boolean;
  top_ips?: { ip: string; count: number }[];
  recent_records?: { rrtype: string; rdata: string; time_first: string; time_last: string }[];
  error?: string;
}

export default function PassiveDnsCard({ data }: { data: PassiveDnsData }) {
  if (!data || data.error) {
    return (
      <div className="bg-gray-800 rounded-xl p-5">
        <h2 className="text-lg font-semibold mb-4">Passive DNS</h2>
        <p className="text-sm text-gray-400">
          {data?.error ? `Error: ${data.error}` : "No passive DNS data available"}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-5">
      <h2 className="text-lg font-semibold mb-4">Passive DNS</h2>
      <div className="space-y-2 text-sm mb-4">
        {data.fast_flux_suspected && (
          <div className="flex items-center gap-2 text-red-400 font-medium">
            <AlertTriangle className="w-4 h-4" />
            Fast-flux suspected — {data.unique_ip_count} unique IPs observed
          </div>
        )}
        {!data.fast_flux_suspected && (
          <div className="flex items-center gap-2 text-green-400">
            <ShieldCheck className="w-4 h-4" /> No fast-flux detected
          </div>
        )}
        <div className="flex justify-between text-gray-400">
          <span>Total records</span>
          <span className="text-white">{data.total_records ?? "—"}</span>
        </div>
        <div className="flex justify-between text-gray-400">
          <span>Unique IPs seen</span>
          <span className="text-white">{data.unique_ip_count ?? "—"}</span>
        </div>
      </div>

      {(data.top_ips?.length ?? 0) > 0 && (
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Top IPs</p>
          <ul className="space-y-1">
            {data.top_ips!.map((item) => (
              <li key={item.ip} className="flex justify-between text-xs font-mono">
                <span className="text-gray-300">{item.ip}</span>
                <span className="text-gray-500">{item.count}×</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
