import { AlertTriangle } from "lucide-react";

interface WhoisData {
  registrar?: string;
  creation_date?: string;
  expiry_date?: string;
  age_days?: number;
  days_until_expiry?: number;
  is_new_domain?: boolean;
  expiring_soon?: boolean;
  error?: string;
}

export default function WhoisCard({ data }: { data: WhoisData }) {
  if (data?.error) return null;

  const fmt = (iso?: string) =>
    iso ? new Date(iso).toLocaleDateString() : "—";

  return (
    <div className="bg-gray-800 rounded-xl p-5">
      <h2 className="text-lg font-semibold mb-4">WHOIS</h2>
      <div className="space-y-2 text-sm">
        {data?.is_new_domain && (
          <div className="flex items-center gap-2 text-red-400 font-medium">
            <AlertTriangle className="w-4 h-4" />
            New domain — registered {data.age_days} days ago
          </div>
        )}
        {data?.expiring_soon && (
          <div className="flex items-center gap-2 text-yellow-400 font-medium">
            <AlertTriangle className="w-4 h-4" />
            Expiring in {data.days_until_expiry} days
          </div>
        )}
        <Row label="Registrar" value={data?.registrar} />
        <Row label="Registered" value={fmt(data?.creation_date)} />
        <Row label="Expires" value={fmt(data?.expiry_date)} />
        <Row
          label="Domain age"
          value={data?.age_days != null ? `${data.age_days} days` : "—"}
        />
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-400">{label}</span>
      <span className="text-white font-mono text-xs">{value ?? "—"}</span>
    </div>
  );
}
