import { AlertTriangle, ShieldCheck } from "lucide-react";

interface ThreatIntelData {
  any_listed?: boolean;
  spamhaus_dbl?: { listed: boolean; reason?: string | null };
  phishtank?: { listed: boolean; url?: string; target?: string };
}

export default function ThreatIntelCard({ data }: { data: ThreatIntelData }) {
  if (!data) {
    return (
      <div className="bg-gray-800 rounded-xl p-5">
        <h2 className="text-lg font-semibold mb-4">Threat Intelligence</h2>
        <p className="text-sm text-gray-400">No threat intelligence data available</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-5">
      <h2 className="text-lg font-semibold mb-4">Threat Intelligence</h2>

      {data.any_listed ? (
        <div className="flex items-center gap-2 text-red-400 font-medium text-sm mb-4">
          <AlertTriangle className="w-4 h-4" />
          Domain is listed on one or more blocklists
        </div>
      ) : (
        <div className="flex items-center gap-2 text-green-400 text-sm mb-4">
          <ShieldCheck className="w-4 h-4" /> Not found on any blocklist
        </div>
      )}

      <div className="space-y-3">
        {/* Spamhaus */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium">Spamhaus DBL</p>
            {data.spamhaus_dbl?.listed && (
              <p className="text-xs text-red-400 mt-0.5">{data.spamhaus_dbl.reason}</p>
            )}
          </div>
          <Badge listed={data.spamhaus_dbl?.listed ?? false} />
        </div>

        {/* PhishTank */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium">PhishTank</p>
            {data.phishtank?.listed && data.phishtank.target && (
              <p className="text-xs text-red-400 mt-0.5">
                Targeting: {data.phishtank.target}
              </p>
            )}
          </div>
          <Badge listed={data.phishtank?.listed ?? false} />
        </div>
      </div>
    </div>
  );
}

function Badge({ listed }: { listed: boolean }) {
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
        listed ? "bg-red-900 text-red-300" : "bg-green-900 text-green-300"
      }`}
    >
      {listed ? "LISTED" : "CLEAN"}
    </span>
  );
}
