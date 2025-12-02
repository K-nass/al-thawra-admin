export default function StatsCard({
  count,
  label,
  bgColor,
}: {
  count: number;
  label: string;
  bgColor: string;
}) {
  return (
    <div
      className={`${bgColor} text-white p-6 rounded-lg flex items-center justify-between`}
    >
      <div>
        <p className="text-4xl font-bold">{count}</p>
        <p className="text-sm">{label}</p>
      </div>
    </div>
  );
}
