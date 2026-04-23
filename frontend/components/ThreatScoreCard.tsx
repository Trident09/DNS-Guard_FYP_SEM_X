interface Props {
  score: number;
  verdict: string;
}

const color = (score: number) =>
  score >= 70 ? "text-red-400" : score >= 40 ? "text-yellow-400" : "text-green-400";

export default function ThreatScoreCard({ score, verdict }: Props) {
  return (
    <div className="bg-gray-800 rounded-xl p-6 col-span-1 md:col-span-3 flex items-center gap-8">
      <div className={`text-7xl font-black ${color(score)}`}>{score}</div>
      <div>
        <p className="text-gray-400 text-sm uppercase tracking-widest">Threat Score</p>
        <p className={`text-2xl font-bold mt-1 ${color(score)}`}>{verdict}</p>
      </div>
    </div>
  );
}
