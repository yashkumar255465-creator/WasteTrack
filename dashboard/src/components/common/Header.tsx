import { useState } from "react";
import { Menu, RefreshCw, ChevronDown, LogOut, Shield, Database, Lock, UserCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "./Toast";

interface HeaderProps {
  onToggleSidebar: () => void;
  onRefreshData?: () => void;
}

export function Header({ onToggleSidebar, onRefreshData }: HeaderProps) {
  const { user, logout, selectedZone, setSelectedZone } = useAuth();
  const { showToast } = useToast();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isZoneDropdownOpen, setIsZoneDropdownOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const availableZones = ["All Zones", "Peelamedu", "Compost Plant", "Sathy Road", "Ukkadam"];

  const handleRefresh = () => {
    setIsRefreshing(true);
    showToast("info", "Synchronizing with MSSQL", "Querying [dbo].[api_user] and weighbridge load-cells...");
    if (onRefreshData) onRefreshData();
    setTimeout(() => {
      setIsRefreshing(false);
      showToast("success", "Synchronized", "Data pipeline up-to-date with SQL Engine.");
    }, 600);
  };

  const getRoleBadgeLabel = () => {
    if (user?.role === "SUPER_ADMIN") return "Admin Console";
    if (user?.role === "ADMIN") return "Zone Supervisor Console";
    return "Weighbridge Terminal";
  };

  const getInitial = (name?: string) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

  return (
    <>
      <header className="bg-white border-b border-slate-200 h-16 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs" id="app-header">
        {/* Left Side: Hamburger + Logo Title + Role Badge + Zone Selector */}
        <div className="flex items-center gap-3 md:gap-5">
          <button
            onClick={onToggleSidebar}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg lg:hidden transition-colors"
            aria-label="Toggle navigation menu"
            id="btn-sidebar-toggle"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-1.5">
              <span>WasteTrack</span>
            </span>
            <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              {getRoleBadgeLabel()}
            </span>
          </div>

          {/* Zone Selector: Dropdown for Super Admin, Fixed/Locked for Admin & User */}
          <div className="relative">
            {user?.role === "SUPER_ADMIN" ? (
              <div>
                <button
                  onClick={() => setIsZoneDropdownOpen(!isZoneDropdownOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-xs transition-colors cursor-pointer"
                  id="btn-super-admin-zone-select"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>{selectedZone}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {isZoneDropdownOpen && (
                  <div
                    className="absolute left-0 mt-1 w-48 bg-white rounded-xl border border-slate-200 shadow-lg py-1 z-40 animate-in fade-in zoom-in-95 duration-150"
                    onMouseLeave={() => setIsZoneDropdownOpen(false)}
                  >
                    <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                      Switch Active Zone View
                    </div>
                    {availableZones.map((zone) => (
                      <button
                        key={zone}
                        onClick={() => {
                          setSelectedZone(zone);
                          setIsZoneDropdownOpen(false);
                          showToast("info", "Zone View Switched", `Now displaying telemetry for: ${zone}`);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                          selectedZone === zone
                            ? "bg-emerald-50 font-bold text-emerald-800"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span>{zone}</span>
                        {selectedZone === zone && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700"
                id="admin-zone-indicator"
                title="Your account is restricted to this designated zone"
              >
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Zone: {user?.zoneName || "Peelamedu"}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Refresh + User Profile Menu */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Refresh button matching Screenshot 2 */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-xs transition-colors cursor-pointer"
            id="btn-header-refresh"
            title="Refresh database manifests"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? "animate-spin text-emerald-600" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* User Profile Avatar & Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
              id="user-profile-button"
            >
              <div className="w-8 h-8 rounded-full bg-[#064e3b] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                {getInitial(user?.name)}
              </div>
              <div className="hidden sm:block text-left leading-tight">
                <span className="text-xs font-bold text-slate-900 block truncate max-w-[120px]">
                  {user?.name}
                </span>
                <span className="text-[10px] text-slate-500 block uppercase font-medium">
                  {user?.role.replace("_", " ")}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {isUserMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-64 bg-white rounded-xl border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                onMouseLeave={() => setIsUserMenuOpen(false)}
              >
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {user?.role}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {user?.terminal}
                    </span>
                  </div>
                </div>

                <div className="py-1 text-xs text-slate-600">
                  <div className="px-4 py-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-500">
                      <Shield className="w-3.5 h-3.5" /> Role Access:
                    </span>
                    <span className="font-semibold text-slate-800">{user?.role}</span>
                  </div>
                  <div className="px-4 py-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-500">
                      <Database className="w-3.5 h-3.5" /> Assigned Zone:
                    </span>
                    <span className="font-semibold text-slate-800">{user?.zoneName || "All Zones"}</span>
                  </div>
                  <div className="px-4 py-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-500">
                      <UserCheck className="w-3.5 h-3.5" /> Terminal ID:
                    </span>
                    <span className="font-mono text-slate-700">{user?.terminal}</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-1 mt-1">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setShowLogoutConfirm(true);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-semibold transition-colors cursor-pointer"
                    id="btn-profile-logout"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100">
              <LogOut className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 text-center mb-1">
              Confirm Sign Out
            </h3>
            <p className="text-xs text-slate-600 text-center mb-6">
              Are you sure you want to end your session for <strong className="text-slate-800">{user?.name}</strong>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  logout();
                }}
                className="flex-1 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white transition-colors cursor-pointer"
                id="btn-confirm-logout"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
