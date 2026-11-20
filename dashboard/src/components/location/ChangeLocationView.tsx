import { useState, useEffect } from "react";
import { MapPin, Check, Building2, Truck, Scale, ShieldCheck, ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { fetchWithAuth } from "../../lib/api";
import { useToast } from "../common/Toast";
import { UnauthorizedView } from "../common/UnauthorizedView";

interface ZoneDto {
  zoneId: number;
  zoneName: string;
  vehicleCount: number;
  userCount: number;
}

export function ChangeLocationView() {
  const { user, selectedZone, setSelectedZone } = useAuth();
  const { showToast } = useToast();
  const [zones, setZones] = useState<ZoneDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // RBAC Guard: Only Super Admin can change locations
  if (user?.role !== "SUPER_ADMIN") {
    return (
      <UnauthorizedView
        requiredRole="SUPER ADMIN"
        attemptedResource="Global Location & Zone Switching"
      />
    );
  }

  useEffect(() => {
    async function loadZones() {
      setIsLoading(true);
      const res = await fetchWithAuth<ZoneDto[]>("/api/zonemanagement");
      if (res.data) {
        setZones(res.data);
      }
      setIsLoading(false);
    }
    loadZones();
  }, []);

  const handleSelectZone = (zoneName: string) => {
    setSelectedZone(zoneName);
    showToast(
      "success",
      "Zone Focus Updated",
      `Now routing telemetry and manifest queries for: ${zoneName}`
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200" id="change-location-view">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Operational Facilities & Location Switching
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Select an operational transfer station or central facility to inspect local weighbridge sensors, fleet allocations, and daily targets.
        </p>
      </div>

      {/* Global "All Zones" Card */}
      <div
        onClick={() => handleSelectZone("All Zones")}
        className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
          selectedZone === "All Zones"
            ? "border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-600/30"
            : "border-slate-200 bg-white hover:border-emerald-300 hover:shadow-md"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#064e3b] text-white flex items-center justify-center font-black shadow-xs">
              ALL
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900">
                  All Regional Operational Zones
                </h3>
                {selectedZone === "All Zones" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-600 text-white">
                    <Check className="w-3 h-3" /> ACTIVE SYSTEM VIEW
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Centralized telemetry across all operational hubs.
              </p>
            </div>
          </div>

          <button
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              selectedZone === "All Zones"
                ? "bg-emerald-700 text-white shadow-2xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {selectedZone === "All Zones" ? "Currently Selected" : "Select Global View"}
          </button>
        </div>
      </div>

      {/* Grid of Individual Regional Facilities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {zones.map((z) => {
          const isSelected = selectedZone === z.zoneName;
          return (
            <div
              key={z.zoneId}
              onClick={() => handleSelectZone(z.zoneName)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? "border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-600/30 shadow-md"
                  : "border-slate-200 bg-white hover:border-emerald-300 hover:shadow-sm"
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-emerald-100/80 text-emerald-800">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                        ZONE {z.zoneId}
                      </span>
                      <h4 className="text-base font-bold text-slate-900 leading-tight">
                        {z.zoneName}
                      </h4>
                    </div>
                  </div>

                  {isSelected ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white">
                      <Check className="w-3.5 h-3.5" /> Selected
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-slate-400 group-hover:text-emerald-700">
                      Click to switch
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 font-medium mb-4">
                  {z.zoneName} Operations
                </p>

                {/* Metrics Breakdown */}
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Assigned Users</span>
                    <span className="font-bold text-slate-800">{z.userCount} Users</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Assigned Fleet</span>
                    <span className="font-bold text-emerald-800">{z.vehicleCount} Trucks</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium flex items-center gap-1">
                  <Scale className="w-3.5 h-3.5 text-emerald-700" /> Digital Scales Active
                </span>
                <button
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-emerald-700 text-white"
                      : "text-emerald-800 hover:bg-emerald-50"
                  }`}
                >
                  {isSelected ? "Active Focus" : "Switch Location →"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

