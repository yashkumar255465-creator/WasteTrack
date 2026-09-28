import { useState, useEffect } from "react";
import { BarChart3, Scale, Clock, CheckCircle2, Truck, AlertCircle, Calendar } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { fetchWithAuth } from "../../lib/api";
import { UnauthorizedView } from "../common/UnauthorizedView";

interface ReportRowDto {
  period: string;
  zoneId: number;
  zoneName: string;
  vehicleNumber: string | null;
  totalWeightKg: number;
  tripCount: number;
}

export function WasteDataView() {
  const { user } = useAuth();
  const [reports, setReports] = useState<ReportRowDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // RBAC Guard: USER role cannot access Waste Data
  if (user?.role === "USER") {
    return (
      <UnauthorizedView
        requiredRole="ADMIN or SUPER ADMIN"
        attemptedResource="Zone Waste Operations & Load-Cell Data"
      />
    );
  }

  const assignedZone = user?.zoneName || "All Zones";

  useEffect(() => {
    async function loadReports() {
      setIsLoading(true);
      // Backend automatically filters to user's zone for Admin.
      // Super Admin gets all data if no zoneId is specified.
      const res = await fetchWithAuth<ReportRowDto[]>("/api/reports");
      if (res.data) {
        setReports(res.data);
      }
      setIsLoading(false);
    }
    loadReports();
  }, [user]);

  const totalKg = reports.reduce((acc, r) => acc + r.totalWeightKg, 0);
  const totalTons = (totalKg / 1000).toFixed(2);
  const totalTrips = reports.reduce((acc, r) => acc + r.tripCount, 0);

  return (
    <div className="space-y-5 animate-in fade-in duration-200" id="waste-data-view">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
          {assignedZone} Zone Waste Intake Operations
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time scale terminal recordings, ward collections, and vehicle tare calibrations for {assignedZone} Transfer Station.
        </p>
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Zone Net Intake
          </span>
          <div className="text-2xl font-black text-emerald-800 font-mono">
            {totalTons} Tonnes
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Across {reports.length} report records
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Total Manifest Trips
          </span>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {totalTrips} Trips
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Verified scale weigh-ins today
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Station Weighbridge
          </span>
          <div className="text-2xl font-black text-teal-700 font-mono flex items-center gap-2">
            <span>Online</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Terminal: {user?.terminal || "TERM-MAIN-01"}
          </p>
        </div>
      </div>

      {/* Recent Manifests in Zone */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
          <span>Active Collection Reports ({assignedZone})</span>
          <span className="text-xs font-mono font-medium text-slate-500">
            {reports.length} Records Loaded
          </span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-2.5 px-3">Period</th>
                <th className="py-2.5 px-3">Zone</th>
                <th className="py-2.5 px-3">Vehicle</th>
                <th className="py-2.5 px-3 text-center">Trips</th>
                <th className="py-2.5 px-3 text-right">Net Weight</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reports.map((r, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{r.period}</td>
                  <td className="py-2.5 px-3 text-slate-700 font-medium">{r.zoneName}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">{r.vehicleNumber || "All Vehicles"}</td>
                  <td className="py-2.5 px-3 text-center font-mono font-medium text-slate-700">
                    {r.tripCount}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800">
                    {r.totalWeightKg.toLocaleString()} Kg
                  </td>
                </tr>
              ))}
              {reports.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500">
                    {isLoading ? "Loading reports..." : "No collection data available."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
