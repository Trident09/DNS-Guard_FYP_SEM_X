interface Props {
  records: Record<string, string[]>;
}

export default function DnsRecordsTable({ records }: Props) {
  return (
    <div className="bg-gray-800 rounded-xl p-5">
      <h2 className="text-lg font-semibold mb-4">DNS Records</h2>
      <div className="space-y-3">
        {Object.entries(records || {}).map(([type, values]) => (
          <div key={type}>
            <span className="text-xs font-bold text-blue-400 uppercase">{type}</span>
            <ul className="mt-1 space-y-1">
              {values.map((v, i) => (
                <li key={i} className="text-sm text-gray-300 font-mono truncate">{v}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
