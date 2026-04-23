import { ShieldCheck, ShieldX, ShieldAlert } from "lucide-react";

interface DnssecData {
  signed?: boolean;
  validated?: boolean;
  enabled?: boolean;
}

export default function DnssecBadge({ data }: { data: DnssecData }) {
  const enabled = data?.signed || data?.validated || data?.enabled;

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
      enabled ? "bg-green-900/50 text-green-300" : "bg-red-900/50 text-red-300"
    }`}>
      {enabled ? (
        <><ShieldCheck className="w-4 h-4" /> DNSSEC Enabled</>
      ) : (
        <><ShieldX className="w-4 h-4" /> DNSSEC Disabled</>
      )}
    </div>
  );
}
