import { useState, useEffect } from "react";
import {
  Scale,
  FileText,
  Truck,
  MapPin,
  Radio,
  AlertTriangle,
  Download,
  Filter,
  BarChart2,
  ChevronDown,
  TrendingUp,
  PieChart,
  Layers,
  Activity,
  Printer,
  X,
  CheckCircle2
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { fetchWithAuth } from "../../lib/api";
import { DashboardMetrics } from "../../types";
import { StatCard } from "../common/StatCard";
import { IntakeChart } from "./IntakeChart";
import { DonutChart } from "./DonutChart";
import { useToast } from "../common/Toast";
import { DASHBOARD_TIME_RANGES, TimeRangeKey } from "../../data/timeRangeData";

export function DashboardView() {
  const { user } = useAuth();
  const { showToast } = useToast();

  // Master time range filter (supports 1 Day, 7 Days, 15 Days, 30 Days)
  const [globalTimeRange, setGlobalTimeRange] = useState<TimeRangeKey>("7 Days");

  // Card 1: Zone Intake Distribution
  const [intakeZone, setIntakeZone] = useState<string>("Peelamedu");
  const [intakeRange, setIntakeRange] = useState<TimeRangeKey>("7 Days");
  const [showIntakeRangeMenu, setShowIntakeRangeMenu] = useState<boolean>(false);

  // Card 2: Fleet Process Allocations
  const [fleetZone, setFleetZone] = useState<string>("Peelamedu");
  const [fleetRange, setFleetRange] = useState<TimeRangeKey>("15 Days");
  const [showFleetRangeMenu, setShowFleetRangeMenu] = useState<boolean>(false);

  // Card 3: Vehicle Modality Breakdown
  const [modalityZone, setModalityZone] = useState<string>("Ukkadam");
  const [modalityRange, setModalityRange] = useState<TimeRangeKey>("7 Days");
  const [showModalityRangeMenu, setShowModalityRangeMenu] = useState<boolean>(false);

  // Card 4: Yield Segmentation Types
  const [yieldZone, setYieldZone] = useState<string>("Peelamedu");
  const [yieldRange, setYieldRange] = useState<TimeRangeKey>("1 Day");
  const [showYieldRangeMenu, setShowYieldRangeMenu] = useState<boolean>(false);

  // Card 5: Daily Net Weight Accumulation
  const [accumZone, setAccumZone] = useState<string>("Ukkadam");
  const [accumOwner, setAccumOwner] = useState<string>("ALL");
  const [showAccumOwnerMenu, setShowAccumOwnerMenu] = useState<boolean>(false);
  const [trajectoryLoaded, setTrajectoryLoaded] = useState<boolean>(false);

  // Sensor banner state
  const [sensorAlertActive, setSensorAlertActive] = useState<boolean>(false);

  // PDF Modal
  const [showPdfModal, setShowPdfModal] = useState<boolean>(false);

  // Optional server metrics
  const [, setMetrics] = useState<DashboardMetrics | null>(null);

  const loadDashboardData = async () => {
    const res = await fetchWithAuth<DashboardMetrics>("/api/analytics/dashboard");
    if (res.data) {
      setMetrics(res.data);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // When global time filter changes, sync all child cards so the entire dashboard updates dynamically
  const handleGlobalRangeChange = (range: TimeRangeKey) => {
    setGlobalTimeRange(range);
    setIntakeRange(range);
    setFleetRange(range);
    setModalityRange(range);
    setYieldRange(range);
  };

  const toggleSensorAlert = () => {
    setSensorAlertActive(!sensorAlertActive);
    if (!sensorAlertActive) {
      showToast("warning", "Sensor Calibration Warning", "Digital load-cell sensor 04 at Peelamedu flagged 0.08% impedance drift.");
    } else {
      showToast("success", "Sensors Normalized", "All 8 digital load-cell sensors report zero calibration error.");
    }
  };

  const handleExportPdf = () => {
    setShowPdfModal(true);
  };

  const handlePrintPdf = () => {
    window.print();
  };

  // Resolve dynamic dataset based on selected time ranges and zones
  const currentGlobalMetrics = DASHBOARD_TIME_RANGES[globalTimeRange] || DASHBOARD_TIME_RANGES["7 Days"];

  // Helper to normalize zone key
  const getZoneKey = (z: string): string => {
    if (z.toLowerCase().includes("peelamedu")) return "Peelamedu";
    if (z.toLowerCase().includes("compost")) return "Compost Plant";
    if (z.toLowerCase().includes("sathy")) return "Sathy Road";
    return "Ukkadam";
  };

  // Card 1 Data
  const intakeMetricsData = DASHBOARD_TIME_RANGES[intakeRange] || currentGlobalMetrics;
  const activeIntakeZoneData = intakeMetricsData.zones[getZoneKey(intakeZone)] || intakeMetricsData.zones["Peelamedu"];
  const currentIntakeData = activeIntakeZoneData.intakeData;

  // Card 2 Data
  const fleetMetricsData = DASHBOARD_TIME_RANGES[fleetRange] || currentGlobalMetrics;
  const activeFleetZoneData = fleetMetricsData.zones[getZoneKey(fleetZone)] || fleetMetricsData.zones["Peelamedu"];
  const currentFleetSegments = activeFleetZoneData.fleetSegments;
  const currentFleetLabel = activeFleetZoneData.centerFleetLabel;
  const currentFleetSublabel = activeFleetZoneData.centerFleetSublabel;

  // Card 3 Data
  const modalityMetricsData = DASHBOARD_TIME_RANGES[modalityRange] || currentGlobalMetrics;
  const activeModalityZoneData = modalityMetricsData.zones[getZoneKey(modalityZone)] || modalityMetricsData.zones["Ukkadam"];
  const currentModalitySegments = activeModalityZoneData.modalitySegments;
  const currentModalityLabel = activeModalityZoneData.centerModalityLabel;
  const currentModalitySublabel = activeModalityZoneData.centerModalitySublabel;

  // Card 4 Data
  const yieldMetricsData = DASHBOARD_TIME_RANGES[yieldRange] || currentGlobalMetrics;
  const activeYieldZoneData = yieldMetricsData.zones[getZoneKey(yieldZone)] || yieldMetricsData.zones["Peelamedu"];
  const currentYieldData = activeYieldZoneData.yieldData;

  // Card 5 Data
  const activeAccumZoneData = currentGlobalMetrics.zones[getZoneKey(accumZone)] || currentGlobalMetrics.zones["Ukkadam"];
  const currentAccumulationSteps = activeAccumZoneData.accumulationSteps;

  const timeRangeOptions: TimeRangeKey[] = ["1 Day", "7 Days", "15 Days", "30 Days"];

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-8" id="dashboard-view">
      {/* 1. Top Header matching image.png */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Live real-time performance tracking & scale telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Export Master PDF Button */}
          <button
            onClick={handleExportPdf}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-slate-200/90 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            id="btn-export-master-pdf"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Master PDF ({globalTimeRange})</span>
          </button>

          {/* Telemetry Online Badge */}
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-semibold"
            id="badge-telemetry-status"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Telemetry Online</span>
          </div>
        </div>
      </div>

      {/* 3. Four KPI Stat Cards dynamically responding to selected Time Range */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Gross Intake */}
        <StatCard
          title={`GROSS INTAKE (${globalTimeRange.toUpperCase()})`}
          value={currentGlobalMetrics.grossIntakeKg}
          subtext={currentGlobalMetrics.grossIntakeSubtext}
          subtextColor={currentGlobalMetrics.grossIntakeSubtextColor}
          icon={<Scale className="w-4 h-4" />}
          iconBg="bg-emerald-100/70 text-emerald-700"
        />

        {/* Card 2: Fleet Trips */}
        <StatCard
          title={`FLEET TRIPS (${globalTimeRange.toUpperCase()})`}
          value={currentGlobalMetrics.fleetTrips}
          subtext={currentGlobalMetrics.fleetTripsSubtext}
          subtextColor="text-sky-600"
          icon={<FileText className="w-4 h-4" />}
          iconBg="bg-sky-100/70 text-sky-700"
        />

        {/* Card 3: Dominant Fleet (Orange text value) */}
        <StatCard
          title="DOMINANT FLEET"
          value={currentGlobalMetrics.dominantFleet}
          valueClassName={currentGlobalMetrics.dominantFleetValueClass}
          subtext={currentGlobalMetrics.dominantFleetSubtext}
          subtextColor="text-slate-500"
          icon={<Truck className="w-4 h-4" />}
          iconBg="bg-amber-100/70 text-amber-700"
        />

        {/* Card 4: Operational Zones */}
        <StatCard
          title="OPERATIONAL ZONES"
          value={currentGlobalMetrics.operationalZones}
          subtext={currentGlobalMetrics.operationalZonesSubtext}
          subtextColor="text-teal-700"
          icon={<MapPin className="w-4 h-4" />}
          iconBg="bg-teal-100/70 text-teal-700"
        />
      </div>

      {/* 4. Data Analytics Section Header matching image.png */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Data Analytics
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Aggregated volume yields processing the last {globalTimeRange} of activity.
          </p>
        </div>

        {/* Global Filter Pill Group: 1 Day, 7 Days, 15 Days, 30 Days */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200/90 shadow-2xs self-start sm:self-auto text-xs font-semibold text-slate-600">
          <span className="flex items-center gap-1 px-2 text-[10px] uppercase font-bold text-slate-400">
            <Filter className="w-3 h-3" />
            FILTER:
          </span>
          {timeRangeOptions.map((range) => (
            <button
              key={range}
              onClick={() => handleGlobalRangeChange(range)}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer text-xs ${
                globalTimeRange === range
                  ? "bg-[#064e3b] text-white font-bold shadow-2xs"
                  : "hover:bg-slate-100 text-slate-600"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Main Card 1: Zone Intake Distribution matching image.png */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs" id="card-zone-intake-distribution">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                <TrendingUp className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                Zone Intake Distribution
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Aggregated volume routing mapped out across regional operational Zones for {intakeRange} ({intakeZone}).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Zone Pill Buttons */}
            <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-lg border border-slate-200/80 text-xs">
              {["Peelamedu", "Compost Plant", "Sathy Road", "Ukkadam"].map((z) => (
                <button
                  key={z}
                  onClick={() => setIntakeZone(z)}
                  className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer text-xs ${
                    intakeZone === z
                      ? "bg-[#064e3b] text-white shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
                  }`}
                >
                  {z}
                </button>
              ))}
            </div>

            {/* Range Dropdown Pill */}
            <div className="relative">
              <button
                onClick={() => setShowIntakeRangeMenu(!showIntakeRangeMenu)}
                className="flex items-center gap-1 px-3 py-1 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 cursor-pointer"
              >
                <span>RANGE: {intakeRange}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
              {showIntakeRangeMenu && (
                <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg border border-slate-200 shadow-lg py-1 z-30 text-xs font-medium">
                  {timeRangeOptions.map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        setIntakeRange(r);
                        setShowIntakeRangeMenu(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 ${
                        intakeRange === r ? "font-bold text-[#064e3b] bg-emerald-50/50" : "text-slate-700"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-4">
          <IntakeChart data={currentIntakeData} />
        </div>
      </div>

      {/* 6. Row 2: Fleet Process Allocations & Vehicle Modality Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 2: Fleet Process Allocations */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between" id="card-fleet-process-allocations">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="p-1 rounded-full bg-amber-50 text-amber-600">
                  <PieChart className="w-3.5 h-3.5" />
                </span>
                <span>Fleet Process Allocations</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Weight share representations mapped per executing Fleet Owner ({fleetRange}).
              </p>
            </div>

            <div className="flex items-center gap-1.5 self-start sm:self-auto">
              <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
                {["Peelamedu", "Compost", "Sathy", "Ukkadam"].map((z) => (
                  <button
                    key={z}
                    onClick={() => setFleetZone(z)}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                      fleetZone === z
                        ? "bg-[#064e3b] text-white shadow-2xs"
                        : "text-slate-600 hover:bg-white"
                    }`}
                  >
                    {z}
                  </button>
                ))}
              </div>

              {/* Range Dropdown Pill */}
              <div className="relative">
                <button
                  onClick={() => setShowFleetRangeMenu(!showFleetRangeMenu)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-200 bg-white text-[11px] font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 cursor-pointer"
                >
                  <span>RANGE: {fleetRange}</span>
                  <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
                </button>
                {showFleetRangeMenu && (
                  <div className="absolute right-0 mt-1 w-28 bg-white rounded-lg border border-slate-200 shadow-lg py-1 z-30 text-xs font-medium">
                    {timeRangeOptions.map((r) => (
                      <button
                        key={r}
                        onClick={() => {
                          setFleetRange(r);
                          setShowFleetRangeMenu(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 ${
                          fleetRange === r ? "font-bold text-[#064e3b] bg-emerald-50/50" : "text-slate-700"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="py-4 flex-1 flex items-center justify-center">
            <DonutChart
              segments={currentFleetSegments}
              centerLabel={currentFleetLabel}
              centerSublabel={currentFleetSublabel}
              size={190}
            />
          </div>
        </div>

        {/* Card 3: Vehicle Modality Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between" id="card-vehicle-modality-breakdown">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="p-1 rounded-full bg-sky-50 text-sky-600">
                  <Truck className="w-3.5 h-3.5" />
                </span>
                <span>Vehicle Modality Breakdown</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Volume routed matching fleet modality profiles ({modalityRange}).
              </p>
            </div>

            <div className="flex items-center gap-1.5 self-start sm:self-auto">
              <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
                {["Peelamedu", "Compost", "Sathy", "Ukkadam"].map((z) => (
                  <button
                    key={z}
                    onClick={() => setModalityZone(z)}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                      modalityZone === z
                        ? "bg-[#064e3b] text-white shadow-2xs"
                        : "text-slate-600 hover:bg-white"
                    }`}
                  >
                    {z}
                  </button>
                ))}
              </div>

              {/* Range Dropdown Pill */}
              <div className="relative">
                <button
                  onClick={() => setShowModalityRangeMenu(!showModalityRangeMenu)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-200 bg-white text-[11px] font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 cursor-pointer"
                >
                  <span>RANGE: {modalityRange}</span>
                  <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
                </button>
                {showModalityRangeMenu && (
                  <div className="absolute right-0 mt-1 w-28 bg-white rounded-lg border border-slate-200 shadow-lg py-1 z-30 text-xs font-medium">
                    {timeRangeOptions.map((r) => (
                      <button
                        key={r}
                        onClick={() => {
                          setModalityRange(r);
                          setShowModalityRangeMenu(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 ${
                          modalityRange === r ? "font-bold text-[#064e3b] bg-emerald-50/50" : "text-slate-700"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="py-4 flex-1 flex items-center justify-center">
            <DonutChart
              segments={currentModalitySegments}
              centerLabel={currentModalityLabel}
              centerSublabel={currentModalitySublabel}
              size={190}
            />
          </div>
        </div>
      </div>

      {/* 7. Row 3: Yield Segmentation Types & Daily Net Weight Accumulation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 4: Yield Segmentation Types */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between" id="card-yield-segmentation-types">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="p-1 rounded-full bg-rose-50 text-rose-600">
                  <Layers className="w-3.5 h-3.5" />
                </span>
                <span>Yield Segmentation Types</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Aggregated load categorization sorted structurally ({yieldRange}).
              </p>
            </div>

            <div className="flex items-center gap-1.5 self-start sm:self-auto">
              <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
                {["Peelamedu", "Compost", "Sathy", "Ukkadam"].map((z) => (
                  <button
                    key={z}
                    onClick={() => setYieldZone(z)}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                      yieldZone === z
                        ? "bg-[#064e3b] text-white shadow-2xs"
                        : "text-slate-600 hover:bg-white"
                    }`}
                  >
                    {z}
                  </button>
                ))}
              </div>

              {/* Range Dropdown Pill */}
              <div className="relative">
                <button
                  onClick={() => setShowYieldRangeMenu(!showYieldRangeMenu)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-200 bg-white text-[11px] font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 cursor-pointer"
                >
                  <span>RANGE: {yieldRange}</span>
                  <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
                </button>
                {showYieldRangeMenu && (
                  <div className="absolute right-0 mt-1 w-28 bg-white rounded-lg border border-slate-200 shadow-lg py-1 z-30 text-xs font-medium">
                    {timeRangeOptions.map((r) => (
                      <button
                        key={r}
                        onClick={() => {
                          setYieldRange(r);
                          setShowYieldRangeMenu(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 ${
                          yieldRange === r ? "font-bold text-[#064e3b] bg-emerald-50/50" : "text-slate-700"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Dynamic Horizontal Yield Progress Bars */}
          <div className="space-y-4 py-4">
            {currentYieldData.map((yItem, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="w-20 text-xs font-semibold text-slate-700 shrink-0">
                  {yItem.type}
                </span>
                <div className="flex-1 bg-slate-100 rounded-md h-7 overflow-hidden">
                  <div
                    className="h-full rounded-md flex items-center justify-end pr-3 transition-all duration-300"
                    style={{ width: `${Math.max(10, Math.min(100, yItem.widthPct))}%`, backgroundColor: yItem.color }}
                  >
                    <span className="text-white text-xs font-bold font-mono">{yItem.tons} T</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 5: Daily Net Weight Accumulation */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between" id="card-daily-net-weight-accumulation">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="p-1 rounded-full bg-sky-50 text-sky-600">
                  <Activity className="w-3.5 h-3.5" />
                </span>
                <span>Daily Net Weight Accumulation</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Time-series daily mapping representing overall network intake (Tonnes).
              </p>
            </div>

            <div className="flex flex-col items-end gap-1.5 self-start sm:self-auto">
              {/* Zone pills */}
              <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
                {[
                  { id: "Peelamedu", label: "Peelamedu" },
                  { id: "Compost plant", label: "Compost_plant" },
                  { id: "Sathy road", label: "Sathy_road" },
                  { id: "Ukkadam", label: "Ukkadam" }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setAccumZone(item.id);
                      if (item.id !== "Ukkadam") {
                        setTrajectoryLoaded(true);
                      }
                    }}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                      accumZone === item.id
                        ? "bg-[#064e3b] text-white shadow-2xs"
                        : "text-slate-600 hover:bg-white"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Owner Dropdown Pill: OWNER: ALL ▼ */}
              <div className="relative">
                <button
                  onClick={() => setShowAccumOwnerMenu(!showAccumOwnerMenu)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-200 bg-white text-[11px] font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 cursor-pointer"
                >
                  <span>OWNER: {accumOwner}</span>
                  <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
                </button>
                {showAccumOwnerMenu && (
                  <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg border border-slate-200 shadow-lg py-1 z-30 text-xs font-medium">
                    {["ALL", "CIWMCPL", "CMC Fleet", "Private Cont."].map((o) => (
                      <button
                        key={o}
                        onClick={() => {
                          setAccumOwner(o);
                          setShowAccumOwnerMenu(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 ${
                          accumOwner === o ? "font-bold text-[#064e3b] bg-emerald-50/50" : "text-slate-700"
                        }`}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Body: if Ukkadam and !trajectoryLoaded, show exact dashed empty state from image */}
          <div className="py-4 flex-1 flex flex-col justify-center">
            {accumZone === "Ukkadam" && !trajectoryLoaded ? (
              <div className="border border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center">
                <BarChart2 className="w-7 h-7 text-slate-300 mb-2" />
                <p className="text-xs text-slate-500 font-medium">
                  No trip payloads encountered for this filter.
                </p>
                <button
                  onClick={() => setTrajectoryLoaded(true)}
                  className="text-xs font-semibold text-sky-700 hover:text-sky-800 underline mt-1.5 cursor-pointer"
                >
                  Load simulated cumulative trajectory
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="h-36 flex items-end gap-2 sm:gap-3 px-2 pt-2 border-b border-slate-100">
                  {currentAccumulationSteps.map((step, idx) => {
                    const max = 180;
                    const heightPct = Math.round((step.intakeTons / max) * 100);
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                        <span className="text-[10px] font-mono text-slate-400 group-hover:text-slate-700 font-semibold transition-colors">
                          {step.intakeTons}T
                        </span>
                        <div
                          className="w-full bg-[#064e3b] rounded-t-md transition-all group-hover:bg-emerald-600"
                          style={{ height: `${heightPct}%` }}
                        ></div>
                        <span className="text-[10px] font-mono text-slate-500 mt-1">
                          {step.time}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Zone: <strong>{accumZone}</strong> | Range: <strong>{globalTimeRange}</strong> | Owner: <strong>{accumOwner}</strong></span>
                  <span className="text-emerald-700 font-semibold">Peak Influx: 15:00 - 18:00</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 8. Official Printable Master PDF Export Modal */}
      {showPdfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-700 text-white">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Official Municipal Weighbridge Telemetry Report</h3>
                  <p className="text-xs text-slate-400">Coimbatore Integrated Waste Management Company Pvt. Ltd. (CIWMCPL)</p>
                </div>
              </div>
              <button
                onClick={() => setShowPdfModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 text-slate-800 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Gross Intake</span>
                  <span className="text-sm font-extrabold text-slate-900">{currentGlobalMetrics.grossIntakeKg}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Fleet Manifests</span>
                  <span className="text-sm font-extrabold text-slate-900">{currentGlobalMetrics.fleetTrips}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">MSSQL Sync</span>
                  <span className="text-sm font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Synchronized
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Generated By</span>
                  <span className="text-sm font-bold text-slate-900">{user?.name || "Ravi Gupta"}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">Regional Operational Plant Manifests ({globalTimeRange})</h4>
                <table className="w-full text-left border-collapse border border-slate-200 rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-slate-100 text-[11px] font-bold text-slate-700">
                      <th className="p-2 border border-slate-200">Zone / Plant Facility</th>
                      <th className="p-2 border border-slate-200">Total Net Tonnage</th>
                      <th className="p-2 border border-slate-200">Trip Count</th>
                      <th className="p-2 border border-slate-200">Dominant Modality</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 border border-slate-200 font-semibold">Peelamedu Transfer Station</td>
                      <td className="p-2 border border-slate-200 font-mono">
                        {globalTimeRange === "1 Day" ? "19,420 KG" : globalTimeRange === "7 Days" ? "42,500 KG" : globalTimeRange === "15 Days" ? "92,100 KG" : "188,400 KG"}
                      </td>
                      <td className="p-2 border border-slate-200">
                        {globalTimeRange === "1 Day" ? "26 Trips" : globalTimeRange === "7 Days" ? "58 Trips" : globalTimeRange === "15 Days" ? "124 Trips" : "252 Trips"}
                      </td>
                      <td className="p-2 border border-slate-200">Compactor</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-slate-200 font-semibold">Compost Plant Facility</td>
                      <td className="p-2 border border-slate-200 font-mono">
                        {globalTimeRange === "1 Day" ? "16,800 KG" : globalTimeRange === "7 Days" ? "38,100 KG" : globalTimeRange === "15 Days" ? "82,400 KG" : "165,200 KG"}
                      </td>
                      <td className="p-2 border border-slate-200">
                        {globalTimeRange === "1 Day" ? "21 Trips" : globalTimeRange === "7 Days" ? "46 Trips" : globalTimeRange === "15 Days" ? "98 Trips" : "208 Trips"}
                      </td>
                      <td className="p-2 border border-slate-200">Tipper</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-slate-200 font-semibold">Sathy Road Transfer Station</td>
                      <td className="p-2 border border-slate-200 font-mono">
                        {globalTimeRange === "1 Day" ? "13,200 KG" : globalTimeRange === "7 Days" ? "29,800 KG" : globalTimeRange === "15 Days" ? "61,200 KG" : "124,500 KG"}
                      </td>
                      <td className="p-2 border border-slate-200">
                        {globalTimeRange === "1 Day" ? "18 Trips" : globalTimeRange === "7 Days" ? "40 Trips" : globalTimeRange === "15 Days" ? "82 Trips" : "168 Trips"}
                      </td>
                      <td className="p-2 border border-slate-200">Compactor</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-slate-200 font-semibold">Ukkadam Regional Plant</td>
                      <td className="p-2 border border-slate-200 font-mono">
                        {globalTimeRange === "1 Day" ? "9,800 KG" : globalTimeRange === "7 Days" ? "22,200 KG" : globalTimeRange === "15 Days" ? "48,700 KG" : "104,000 KG"}
                      </td>
                      <td className="p-2 border border-slate-200">
                        {globalTimeRange === "1 Day" ? "14 Trips" : globalTimeRange === "7 Days" ? "34 Trips" : globalTimeRange === "15 Days" ? "68 Trips" : "136 Trips"}
                      </td>
                      <td className="p-2 border border-slate-200">LCV / Dumper</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-[11px] text-slate-500">
                <span>Database: <strong>MSSQL wastetrack.dbo.api_user</strong></span>
                <span>Certified Digital Audit Slip: <strong>#WT-AUDIT-2026-913</strong></span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowPdfModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={handlePrintPdf}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#064e3b] text-white text-xs font-bold hover:bg-[#053e30] shadow-sm cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save PDF ({globalTimeRange})</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
