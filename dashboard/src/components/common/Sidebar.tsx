import { LayoutDashboard, MapPin, Users, Truck, FileText, BarChart3, LogOut, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface SidebarProps {
  currentView: string;
  onSelectView: (view: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ currentView, onSelectView, isOpenMobile, onCloseMobile }: SidebarProps) {
  const { user, logout } = useAuth();

  // Navigation definition tailored strictly by user role
  const getNavItems = () => {
    if (user?.role === "SUPER_ADMIN") {
      return [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "location", label: "Change Location", icon: MapPin },
        { id: "users", label: "User Management", icon: Users },
        { id: "vehicles", label: "Vehicle Management", icon: Truck },
        { id: "reports", label: "Reports", icon: FileText },
      ];
    }

    if (user?.role === "ADMIN") {
      return [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "waste", label: "Waste Data", icon: BarChart3 },
        { id: "vehicles", label: "Zone Vehicles", icon: Truck },
        { id: "reports", label: "Reports", icon: FileText },
      ];
    }

    // USER role: strictly Dashboard & Reports
    return [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "reports", label: "Reports", icon: FileText },
    ];
  };

  const navItems = getNavItems();

  const handleNavClick = (id: string) => {
    onSelectView(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-64 bg-[#083324] text-white flex flex-col justify-between border-r border-[#0d4431] transition-transform duration-300 ease-in-out ${
          isOpenMobile ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        id="app-sidebar"
      >
        {/* Top brand header */}
        <div>
          <div className="p-5 flex items-center justify-between border-b border-[#0d4431]">
            <div className="flex items-center gap-3">
              {/* Circular Emblem Icon */}
              <div className="w-10 h-10 rounded-full bg-emerald-900/60 border border-emerald-500/30 flex items-center justify-center p-1.5 shadow-inner">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#10b981" strokeWidth="6" strokeDasharray="180 80" />
                  <circle cx="50" cy="50" r="28" fill="none" stroke="#38bdf8" strokeWidth="6" strokeDasharray="120 60" />
                  <circle cx="50" cy="50" r="14" fill="none" stroke="#f59e0b" strokeWidth="6" />
                </svg>
              </div>
              <div>
                <h1 className="font-extrabold text-base tracking-tight text-white leading-tight">
                  CIWMCPL
                </h1>
                <span className="text-[10px] tracking-wider text-emerald-300 font-semibold uppercase block">
                  Waste Operations
                </span>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1 text-emerald-300 hover:text-white rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Links Section */}
          <div className="px-4 py-4">
            <span className="text-[11px] font-bold tracking-wider text-emerald-400/80 uppercase px-3 block mb-2">
              Quick Links
            </span>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer ${
                      isActive
                        ? "bg-[#14533d] text-white shadow-sm font-semibold border-l-4 border-emerald-400 pl-3"
                        : "text-emerald-100/80 hover:bg-[#0d4431] hover:text-white"
                    }`}
                    id={`nav-${item.id}`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-emerald-300" : "text-emerald-400/70"}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Bottom Status & Role Footer */}
        <div className="p-4 border-t border-[#0d4431] bg-[#06291d]">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{user?.role.replace("_", " ")}</span>
              </div>
              <span className="text-[10px] text-emerald-400/60 font-mono mt-0.5">
                Port 1433 • Connected
              </span>
            </div>

            <button
              onClick={logout}
              className="flex items-center gap-1 text-xs text-emerald-300 hover:text-white px-2 py-1 rounded hover:bg-[#0d4431] transition-colors cursor-pointer"
              title="Logout session"
              id="btn-sidebar-logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
