interface DonutSegment {
  label: string;
  percentage: number;
  color: string;
}

interface DonutChartProps {
  segments: DonutSegment[];
  centerLabel?: string;
  centerSublabel?: string;
  size?: number;
}

export function DonutChart({
  segments,
  centerLabel,
  centerSublabel,
  size = 190
}: DonutChartProps) {
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedOffset = 0;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full -rotate-90">
          {segments.map((seg, idx) => {
            const strokeDasharray = `${(seg.percentage / 100) * circumference} ${circumference}`;
            const strokeDashoffset = -accumulatedOffset;
            accumulatedOffset += (seg.percentage / 100) * circumference;

            return (
              <circle
                key={idx}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-300 hover:opacity-90 cursor-pointer"
              />
            );
          })}
        </svg>

        {/* Center cutout label matching screenshot */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          {centerLabel && (
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
              {centerLabel}
            </span>
          )}
          {centerSublabel && (
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-1">
              {centerSublabel}
            </span>
          )}
        </div>
      </div>

      {/* Legend below donut */}
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-5 text-xs">
        {segments.map((seg, idx) => (
          <div key={idx} className="flex items-center gap-1.5 font-medium text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }}></span>
            <span>{seg.label} ({seg.percentage}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}
