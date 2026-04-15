import type { LucideIcon } from "lucide-react";

export default function StatsCard({
  count,
  label,
  bgColor,
  icon: Icon,
  trend,
}: {
  count: number | string;
  label: string;
  bgColor: string;
  icon?: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${bgColor.replace('bg-', 'bg-').replace('-500', '/10')} ${bgColor.replace('bg-', 'text-').replace('-500', '-600')}`}>
          {Icon ? <Icon size={24} /> : <div className="w-6 h-6" />}
        </div>
        {trend && (
          <div className={`text-xs font-bold px-2 py-1 rounded-full ${trend.isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            {trend.isPositive ? '+' : ''}{trend.value}
          </div>
        )}
      </div>
      <div>
        <p className="text-3xl font-bold text-slate-900 tracking-tight">{count}</p>
        <p className="text-sm font-medium text-slate-500 mt-1">{label}</p>
      </div>
    </div>
  );
}
