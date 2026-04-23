import { AlertTriangle, ShieldCheck } from "lucide-react";

interface CertData {
  total_certs?: number;
  wildcard_certs?: number;
  certs_last_30d?: number;
  cert_spike?: boolean;
  has_wildcards?: boolean;
  recent_certs?: { id: number; issuer: string; name: string; not_before: string; not_after: string }[];
  error?: string;
}

export default function CertCard({ data }: { data: CertData }) {
  if (data?.error) return null;

  return (
    <div className="bg-gray-800 rounded-xl p-5">
      <h2 className="text-lg font-semibold mb-4">Certificate Transparency</h2>
      <div className="space-y-2 text-sm mb-4">
        {data?.cert_spike && (
          <div className="flex items-center gap-2 text-red-400 font-medium">
            <AlertTriangle className="w-4 h-4" />
            Cert spike — {data.certs_last_30d} certs issued in last 30 days
          </div>
        )}
        {data?.has_wildcards && (
          <div className="flex items-center gap-2 text-yellow-400 font-medium">
            <AlertTriangle className="w-4 h-4" />
            {data.wildcard_certs} wildcard certificate(s) detected
          </div>
        )}
        {!data?.cert_spike && !data?.has_wildcards && (
          <div className="flex items-center gap-2 text-green-400">
            <ShieldCheck className="w-4 h-4" /> No cert anomalies detected
          </div>
        )}
        <div className="flex justify-between text-gray-400">
          <span>Total certs</span><span className="text-white">{data?.total_certs ?? "—"}</span>
        </div>
        <div className="flex justify-between text-gray-400">
          <span>Last 30 days</span><span className="text-white">{data?.certs_last_30d ?? "—"}</span>
        </div>
      </div>
      {(data?.recent_certs?.length ?? 0) > 0 && (
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Recent certs</p>
          <ul className="space-y-1">
            {data!.recent_certs!.slice(0, 5).map((c) => (
              <li key={c.id} className="text-xs text-gray-300 font-mono truncate">
                {c.name} <span className="text-gray-500">({c.not_before?.slice(0, 10)})</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
