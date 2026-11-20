import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./components/common/Toast";
import { LoginPage } from "./components/auth/LoginPage";
import { Header } from "./components/common/Header";
import { Sidebar } from "./components/common/Sidebar";
import { DashboardView } from "./components/dashboard/DashboardView";
import { UserManagementView } from "./components/users/UserManagementView";
import { VehicleManagementView } from "./components/vehicles/VehicleManagementView";
import { ReportsView } from "./components/reports/ReportsView";
import { ChangeLocationView } from "./components/location/ChangeLocationView";
import { WasteDataView } from "./components/waste/WasteDataView";
import { UnauthorizedView } from "./components/common/UnauthorizedView";
import { Loader2 } from "lucide-react";

function MainAppContent() {
  const { user, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState<string>("dashboard");
  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState(false);

  // Sync URL hash with views for realistic bookmarkable route navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#/", "").replace("#", "");
      if (hash) {
        if (hash.includes("unauthorized")) setCurrentView("unauthorized");
        else if (hash.includes("users")) setCurrentView("users");
        else if (hash.includes("vehicles")) setCurrentView("vehicles");
        else if (hash.includes("reports")) setCurrentView("reports");
        else if (hash.includes("location")) setCurrentView("location");
        else if (hash.includes("waste")) setCurrentView("waste");
        else if (hash.includes("dashboard")) setCurrentView("dashboard");
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    handleHashChange();
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Update hash when currentView changes
  const handleSelectView = (view: string) => {
    setCurrentView(view);
    if (user) {
      const rolePrefix = user.role.toLowerCase().replace("_", "-");
      window.location.hash = `#/${rolePrefix}/${view}`;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#083324] flex flex-col items-center justify-center gap-3 text-white">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
        <span className="text-xs font-mono font-semibold tracking-wider text-emerald-200">
          INITIALIZING WASTETRACK CIWMCPL ENGINE...
        </span>
      </div>
    );
  }

  // Not authenticated -> show Common Login Page
  if (!user) {
    return <LoginPage />;
  }

  // Determine what view to render with RBAC validation
  const renderViewContent = () => {
    // 1. Dashboard is accessible to all authenticated roles
    if (currentView === "dashboard") {
      return <DashboardView />;
    }

    // 2. Reports is accessible to all roles (with zone locking for Admin/User)
    if (currentView === "reports") {
      return <ReportsView />;
    }

    // 3. User Management is strictly SUPER_ADMIN only
    if (currentView === "users") {
      if (user.role !== "SUPER_ADMIN") {
        return (
          <UnauthorizedView
            requiredRole="SUPER ADMIN"
            attemptedResource="User Management & Operator Registry"
            onNavigateHome={() => handleSelectView("dashboard")}
          />
        );
      }
      return <UserManagementView />;
    }

    // 4. Vehicle Management is accessible to SUPER_ADMIN and ADMIN
    if (currentView === "vehicles") {
      if (user.role === "USER") {
        return (
          <UnauthorizedView
            requiredRole="ADMIN or SUPER ADMIN"
            attemptedResource="Vehicle Fleet Management"
            onNavigateHome={() => handleSelectView("dashboard")}
          />
        );
      }
      return <VehicleManagementView />;
    }

    // 5. Change Location is strictly SUPER_ADMIN only
    if (currentView === "location") {
      if (user.role !== "SUPER_ADMIN") {
        return (
          <UnauthorizedView
            requiredRole="SUPER ADMIN"
            attemptedResource="Global Location & Facility Switching"
            onNavigateHome={() => handleSelectView("dashboard")}
          />
        );
      }
      return <ChangeLocationView />;
    }

    // 6. Waste Data is accessible to ADMIN and SUPER_ADMIN
    if (currentView === "waste") {
      if (user.role === "USER") {
        return (
          <UnauthorizedView
            requiredRole="ADMIN or SUPER ADMIN"
            attemptedResource="Zone Waste Operations & Load-Cell Data"
            onNavigateHome={() => handleSelectView("dashboard")}
          />
        );
      }
      return <WasteDataView />;
    }

    // 7. Explicit Unauthorized View
    if (currentView === "unauthorized") {
      return (
        <UnauthorizedView
          requiredRole="ELEVATED ROLE"
          attemptedResource="Protected Municipal System Data"
          onNavigateHome={() => handleSelectView("dashboard")}
        />
      );
    }

    return <DashboardView />;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      {/* Top Navigation Bar */}
      <Header
        onToggleSidebar={() => setIsSidebarMobileOpen(!isSidebarMobileOpen)}
        onRefreshData={() => {
          // Trigger reload of active views
          const event = new CustomEvent("wt_refresh_data");
          window.dispatchEvent(event);
        }}
      />

      {/* Main Layout: Dark Green Sidebar + White Content Canvas */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          currentView={currentView}
          onSelectView={handleSelectView}
          isOpenMobile={isSidebarMobileOpen}
          onCloseMobile={() => setIsSidebarMobileOpen(false)}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {renderViewContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <MainAppContent />
      </ToastProvider>
    </AuthProvider>
  );
}
