import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  valueClassName?: string;
  subtext?: string;
  subtextColor?: string;
  icon: ReactNode;
  iconBg?: string;
  id?: string;
}

export function StatCard({
  title,
  value,
  valueClassName = "text-slate-900",
  subtext,
  subtextColor = "text-emerald-700",
  icon,
  iconBg = "bg-emerald-50 text-emerald-700",
  id
}: StatCardProps) {
  return (
    <div
      className="bg-white rounded-xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col justify-between"
      id={id || `stat-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            {title}
          </span>
          <div className={`text-2xl font-extrabold tracking-tight ${valueClassName}`}>
            {value}
          </div>
        </div>
        <div className={`w-9 h-9 rounded-full flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
      </div>
      {subtext && (
        <div className="mt-3 flex items-center text-xs">
          <span className={`font-medium ${subtextColor}`}>{subtext}</span>
        </div>
      )}
    </div>
  );
}
