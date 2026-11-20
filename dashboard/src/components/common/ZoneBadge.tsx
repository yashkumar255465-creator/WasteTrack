import { MapPin, Lock } from "lucide-react";

interface ZoneBadgeProps {
  zoneName: string | null;
  isLocked?: boolean;
  className?: string;
  onClick?: () => void;
}

export function ZoneBadge({ zoneName, isLocked, className = "", onClick }: ZoneBadgeProps) {
  const label = zoneName || "All Zones";

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium border transition-colors ${
        onClick ? "cursor-pointer hover:bg-slate-100" : ""
      } ${
        isLocked
          ? "bg-slate-100 text-slate-700 border-slate-300"
          : "bg-emerald-50 text-emerald-800 border-emerald-200"
      } ${className}`}
      id="zone-badge"
    >
      {isLocked ? (
        <Lock className="w-3.5 h-3.5 text-slate-500" />
      ) : (
        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
      )}
      <span>Zone: {label}</span>
      {isLocked && <span className="text-[10px] text-slate-400 font-normal">(Locked)</span>}
    </div>
  );
}
