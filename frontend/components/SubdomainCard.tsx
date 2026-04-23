import { AlertTriangle } from "lucide-react";

interface SubdomainData {
  total_found?: number;
  subdomains?: string[];
  suspicious?: string[];
  suspicious_count?: number;
  sources?: { brute_force: number; cert_transparency: number };
}

export default function SubdomainCard({ data }: { data: SubdomainData }) {
  if (!data) return null;

  return (
    <div className="bg-gray-800 rounded-xl p-5">
      <h2 className="text-lg font-semibold mb-4">
        Subdomains
        <span className="ml-2 text-sm font-normal text-gray-400">
          {data.total_found} found
        </span>
      </h2>

      {(data.suspicious_count ?? 0) > 0 && (
        <div className="flex items-center gap-2 text-yellow-400 text-sm font-medium mb-3">
          <AlertTriangle className="w-4 h-4" />
          {data.suspicious_count} suspicious subdomain(s) detected
        </div>
      )}

      <div className="flex gap-4 text-xs text-gray-500 mb-3">
        <span>Brute-force: {data.sources?.brute_force ?? 0}</span>
        <span>Cert transparency: {data.sources?.cert_transparency ?? 0}</span>
      </div>

      {(data.suspicious?.length ?? 0) > 0 && (
        <div className="mb-3">
          <p className="text-xs text-red-400 uppercase tracking-widest mb-1">Suspicious</p>
          <ul className="space-y-0.5">
            {data.suspicious!.map((s) => (
              <li key={s} className="text-xs font-mono text-red-300">{s}</li>
            ))}
          </ul>
        </div>
      )}

      {(data.subdomains?.length ?? 0) > 0 && (
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">All subdomains</p>
          <ul className="space-y-0.5 max-h-40 overflow-y-auto">
            {data.subdomains!.map((s) => (
              <li key={s} className="text-xs font-mono text-gray-300">{s}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
