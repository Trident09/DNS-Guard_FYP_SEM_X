interface Explanation {
  feature: string;
  reason: string;
  impact: "high" | "medium" | "low";
}

interface Props {
  explanations: Explanation[];
}

const impactColor = { high: "text-red-400", medium: "text-yellow-400", low: "text-green-400" };

export default function ExplainabilityPanel({ explanations }: Props) {
  return (
    <div className="bg-gray-800 rounded-xl p-5">
      <h2 className="text-lg font-semibold mb-4">Why this score?</h2>
      <ul className="space-y-3">
        {(explanations || []).map((e, i) => (
          <li key={i} className="flex gap-3">
            <span className={`text-xs font-bold uppercase mt-0.5 ${impactColor[e.impact]}`}>
              {e.impact}
            </span>
            <div>
              <p className="text-sm font-medium">{e.feature}</p>
              <p className="text-xs text-gray-400">{e.reason}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
