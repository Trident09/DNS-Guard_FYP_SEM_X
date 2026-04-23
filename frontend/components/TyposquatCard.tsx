import { AlertTriangle, ShieldCheck } from "lucide-react";

interface Match {
  target: string;
  distance: number;
  your_sld: string;
  target_sld: string;
}

interface TyposquatData {
  is_typosquat?: boolean;
  match_count?: number;
  matches?: Match[];
  checked_against?: number;
  error?: string;
}

export default function TyposquatCard({ data }: { data: TyposquatData }) {
  if (!data || data.error) return null;

  return (
    <div className="bg-gray-800 rounded-xl p-5">
      <h2 className="text-lg font-semibold mb-4">Typosquat Detection</h2>

      {data.is_typosquat ? (
        <div className="flex items-center gap-2 text-red-400 font-medium mb-4 text-sm">
          <AlertTriangle className="w-4 h-4" />
          Possible typosquat — resembles {data.match_count} popular domain(s)
        </div>
      ) : (
        <div className="flex items-center gap-2 text-green-400 mb-4 text-sm">
          <ShieldCheck className="w-4 h-4" /> No typosquat matches found
        </div>
      )}

      {(data.matches?.length ?? 0) > 0 && (
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Closest matches</p>
          <ul className="space-y-1">
            {data.matches!.map((m, i) => (
              <li key={i} className="flex justify-between text-xs font-mono">
                <span className="text-gray-300">{m.target}</span>
                <span className={`${m.distance === 1 ? "text-red-400" : "text-yellow-400"}`}>
                  dist {m.distance}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-gray-600 mt-3">
            Checked against top {data.checked_against?.toLocaleString()} domains
          </p>
        </div>
      )}
    </div>
  );
}
