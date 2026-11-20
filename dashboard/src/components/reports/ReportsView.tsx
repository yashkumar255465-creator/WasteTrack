import { useState, useEffect, FormEvent } from "react";
import { Search, RotateCcw, Download, FileSpreadsheet, Printer, Info, Lock } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { fetchWithAuth } from "../../lib/api";
import { useToast } from "../common/Toast";

export interface ReportFilter {
  zoneId?: number;
  vehicleId?: number;
  userId?: number;
  from?: string; // yyyy-MM-dd
  to?: string;   // yyyy-MM-dd
  granularity?: string;
}

export interface ReportRowDto {
  period: string;
  zoneId: number;
  zoneName: string;
  vehicleNumber?: string;
  totalWeightKg: number;
  tripCount: number;
}

export function ReportsView() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [reports, setReports] = useState<ReportRowDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filter States
  const [fromDate, setFromDate] = useState(new Date().toISOString().slice(0, 10));
  const [toDate, setToDate] = useState(new Date().toISOString().slice(0, 10));
  const [granularity, setGranularity] = useState("daily");
  
  // Note: For a fully integrated app, Zones/Vehicles would be fetched from their respective endpoints.
  // We use placeholder IDs here for demonstration of the filter DTO.
  const [selectedZoneId, setSelectedZoneId] = useState<number | "">("");

  // Live timestamp in header
  const [liveTime, setLiveTime] = useState(new Date().toLocaleString());
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTime(new Date().toLocaleString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const loadReports = async (overrideParams?: ReportFilter) => {
    setIsLoading(true);

    const filter: ReportFilter = {
      from: overrideParams?.from !== undefined ? overrideParams.from : fromDate,
      to: overrideParams?.to !== undefined ? overrideParams.to : toDate,
      granularity: overrideParams?.granularity !== undefined ? overrideParams.granularity : granularity
    };

    if (overrideParams?.zoneId !== undefined) {
       if (overrideParams.zoneId !== "") filter.zoneId = overrideParams.zoneId;
    } else {
       if (selectedZoneId !== "") filter.zoneId = Number(selectedZoneId);
    }

    try {
      const query = new URLSearchParams();
      if (filter.zoneId !== undefined) query.append("zoneId", filter.zoneId.toString());
      if (filter.vehicleId !== undefined) query.append("vehicleId", filter.vehicleId.toString());
      if (filter.userId !== undefined) query.append("userId", filter.userId.toString());
      if (filter.from) query.append("from", filter.from);
      if (filter.to) query.append("to", filter.to);
      if (filter.granularity) query.append("granularity", filter.granularity);

      const res = await fetchWithAuth<ReportRowDto[]>(`/api/reports?${query.toString()}`, {
        method: "GET"
      });
      if (res.data) {
        setReports(res.data);
      }
    } catch (err) {
      console.error(err);
      showToast("error", "Error", "Failed to load reports");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleSearch = (e?: FormEvent) => {
    if (e) e.preventDefault();
    loadReports();
    showToast("info", "Filters Applied", `Retrieved report records.`);
  };

  const handleReset = () => {
    const today = new Date().toISOString().slice(0, 10);
    setFromDate(today);
    setToDate(today);
    setGranularity("daily");
    setSelectedZoneId("");
    
    loadReports({
      from: today,
      to: today,
      granularity: "daily",
      zoneId: undefined
    });
    showToast("info", "Filters Reset", "Search parameters cleared.");
  };

  // CSV Exporter
  const handleDownloadCSV = () => {
    if (reports.length === 0) {
      showToast("warning", "No Data", "No reports available for download.");
      return;
    }

    const headers = [
      "Period",
      "Zone ID",
      "Zone Name",
      "Vehicle Number",
      "Total Weight (Kg)",
      "Trip Count"
    ];

    const rows = reports.map((r) => [
      r.period,
      r.zoneId,
      r.zoneName,
      r.vehicleNumber || "-",
      r.totalWeightKg,
      r.tripCount
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `WasteTrack_Reports_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("success", "CSV Download Complete", `Exported ${reports.length} records.`);
  };

  const handleDownloadExcel = () => {
    handleDownloadCSV();
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  const totalTrips = reports.reduce((sum, r) => sum + r.tripCount, 0);
  const totalWeightKg = reports.reduce((sum, r) => sum + r.totalWeightKg, 0);
  const totalWeightTons = (totalWeightKg / 1000).toFixed(2);

  return (
    <div className="space-y-5 animate-in fade-in duration-200" id="reports-view">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Reports
            </h2>
            <button className="text-slate-400 hover:text-slate-600 transition-colors">
              <Info className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Aggregated trip details and weight summaries.
          </p>
        </div>
        <div className="text-xs font-mono font-medium text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs self-start md:self-auto">
          {liveTime}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center justify-between">
          <span>Report Filters</span>
        </h3>

        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                From Date
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 font-medium outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                To Date
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 font-medium outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Granularity
              </label>
              <select
                value={granularity}
                onChange={(e) => setGranularity(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 font-medium outline-none focus:border-emerald-600"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-lg bg-[#064e3b] hover:bg-[#053d2e] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                disabled={isLoading}
              >
                <Search className="w-3.5 h-3.5" />
                <span>{isLoading ? "Loading..." : "Search"}</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </form>

        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div />
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={handleDownloadExcel} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer">
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span>Download Excel</span>
            </button>
            <button onClick={handleDownloadCSV} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer">
              <Download className="w-3.5 h-3.5 text-sky-700" />
              <span>Download CSV</span>
            </button>
            <button onClick={handleDownloadPDF} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer">
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Total Trips</span>
          <span className="text-xl font-black text-slate-900 font-mono">{totalTrips} Trips</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Total Waste Net</span>
          <span className="text-xl font-black text-emerald-800 font-mono">{totalWeightTons} Tons</span>
          <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">({totalWeightKg.toLocaleString()} Kg)</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {reports.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm font-semibold text-slate-700 mb-1">No reports found for the selected criteria.</p>
            <p className="text-xs text-slate-500 mb-4">Try adjusting your date range.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Period</th>
                  <th className="py-3 px-4">Zone</th>
                  <th className="py-3 px-4">Vehicle No</th>
                  <th className="py-3 px-4 text-right">Trip Count</th>
                  <th className="py-3 px-4 text-right">Total Weight (Kg)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{r.period}</td>
                    <td className="py-3 px-4 font-medium text-slate-800">{r.zoneName}</td>
                    <td className="py-3 px-4 font-bold text-slate-800 font-mono">{r.vehicleNumber || "-"}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">{r.tripCount}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-800">{r.totalWeightKg.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
