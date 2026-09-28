import { useState } from "react";

interface IntakeDataPoint {
  day: string;
  tonnage: number;
  trips: number;
}

interface IntakeChartProps {
  data: IntakeDataPoint[];
}

export function IntakeChart({ data }: IntakeChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-xs text-slate-400">No telemetry records</div>;
  }

  const maxTonnage = 700;
  const maxTrips = 40;

  const chartHeight = 220;
  const chartWidth = 640;
  const paddingLeft = 45;
  const paddingRight = 45;
  const paddingTop = 25;
  const paddingBottom = 35;

  const usableWidth = chartWidth - paddingLeft - paddingRight;
  const usableHeight = chartHeight - paddingTop - paddingBottom;
  const stepX = usableWidth / (data.length - 1 || 1);

  // Compute points for the trips line
  const linePoints = data.map((d, i) => {
    const x = paddingLeft + i * stepX;
    const y = paddingTop + usableHeight - (Math.min(d.trips, maxTrips) / maxTrips) * usableHeight;
    return { x, y, trips: d.trips, tonnage: d.tonnage, day: d.day };
  });

  const pathD = linePoints.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, "");

  // Y-axis tick values: [0, 175, 350, 525, 700] on left, [0, 10, 20, 30, 40] on right
  const yTicks = [
    { ratio: 1.0, tonnage: 700, trips: 40 },
    { ratio: 0.75, tonnage: 525, trips: 30 },
    { ratio: 0.5, tonnage: 350, trips: 20 },
    { ratio: 0.25, tonnage: 175, trips: 10 },
    { ratio: 0.0, tonnage: 0, trips: 0 },
  ];

  return (
    <div className="relative w-full overflow-hidden" id="zone-intake-chart-container">
      {/* Legend */}
      <div className="flex items-center justify-end gap-6 mb-3 text-xs font-semibold">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span>
          <span className="text-slate-600">Tonnage (T)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2563eb]"></span>
          <span className="text-slate-600">Trips (#)</span>
        </div>
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto overflow-visible"
        >
          {/* Grid lines */}
          {yTicks.map((tick, i) => {
            const y = paddingTop + usableHeight * (1 - tick.ratio);
            return (
              <g key={i}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={chartWidth - paddingRight}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                {/* Left Y-axis (Tonnage) */}
                <text
                  x={paddingLeft - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  className="text-[11px] fill-slate-400 font-mono select-none"
                >
                  {tick.tonnage}
                </text>
                {/* Right Y-axis (Trips) */}
                <text
                  x={chartWidth - paddingRight + 8}
                  y={y + 3.5}
                  textAnchor="start"
                  className="text-[11px] fill-slate-400 font-mono select-none"
                >
                  {tick.trips}
                </text>
              </g>
            );
          })}

          {/* Bars (Tonnage) */}
          {data.map((d, i) => {
            const barWidth = 32;
            const x = paddingLeft + i * stepX - barWidth / 2;
            const barHeight = (Math.min(d.tonnage, maxTonnage) / maxTonnage) * usableHeight;
            const y = paddingTop + usableHeight - barHeight;
            const isHovered = hoveredIdx === i;
            const isLast = i === data.length - 1;

            return (
              <g
                key={i}
                className="cursor-pointer transition-opacity"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx="3"
                  fill={isHovered ? "#059669" : "#10b981"}
                  className="transition-all duration-200 hover:brightness-105"
                />
                {/* X-axis date labels */}
                <text
                  x={paddingLeft + i * stepX}
                  y={chartHeight - 8}
                  textAnchor="middle"
                  className={`text-[11px] select-none transition-colors ${
                    isLast
                      ? "fill-slate-900 font-bold"
                      : isHovered
                      ? "fill-emerald-800 font-bold"
                      : "fill-slate-500 font-medium"
                  }`}
                >
                  {d.day}
                </text>
              </g>
            );
          })}

          {/* Line (Trips) */}
          <path
            d={pathD}
            fill="none"
            stroke="#2563eb"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Line Markers */}
          {linePoints.map((pt, i) => {
            const isHovered = hoveredIdx === i;
            return (
              <g
                key={i}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 5.5 : 3.5}
                  fill="#ffffff"
                  stroke="#2563eb"
                  strokeWidth="2.5"
                  className="transition-all duration-150"
                />
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip */}
        {hoveredIdx !== null && (
          <div
            className="absolute z-20 bg-slate-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl pointer-events-none transform -translate-x-1/2 -translate-y-full border border-slate-700"
            style={{
              left: `${((paddingLeft + hoveredIdx * stepX) / chartWidth) * 100}%`,
              top: "20%"
            }}
          >
            <p className="font-bold text-slate-200 mb-1">{data[hoveredIdx].day}</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Intake: <strong>{data[hoveredIdx].tonnage} T</strong></span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-sky-400"></span>
              <span>Manifests: <strong>{data[hoveredIdx].trips} Trips</strong></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
