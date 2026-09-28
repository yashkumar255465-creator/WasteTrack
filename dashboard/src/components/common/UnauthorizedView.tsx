import { ShieldAlert, ArrowLeft } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { RoleBadge } from "./RoleBadge";

interface UnauthorizedViewProps {
  requiredRole?: string;
  attemptedResource?: string;
  onNavigateHome?: () => void;
}

export function UnauthorizedView({
  requiredRole,
  attemptedResource = "this resource",
  onNavigateHome
}: UnauthorizedViewProps) {
  const { user } = useAuth();

  return (
    <div className="flex-1 flex items-center justify-center p-8 min-h-[500px]" id="unauthorized-view">
      <div className="bg-white max-w-lg w-full rounded-2xl border border-rose-200 shadow-md p-8 text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-5 border border-rose-100">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <span className="inline-block px-2.5 py-1 rounded bg-rose-100 text-rose-800 text-xs font-mono font-bold uppercase tracking-wider mb-2">
          HTTP 403 • FORBIDDEN
        </span>

        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
          Access Denied
        </h2>

        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          You do not have permission to access <strong className="text-slate-800">{attemptedResource}</strong>.
          Role-Based Access Control (RBAC) restricts this section exclusively to authorized personnel.
        </p>

        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-left mb-6 space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">Your Current Account:</span>
            <span className="font-bold text-slate-800">{user?.name} ({user?.userId})</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">Assigned Role:</span>
            {user && <RoleBadge role={user.role} />}
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">Assigned Operational Zone:</span>
            <span className="font-semibold text-slate-800">{user?.zoneName || "Global / All Zones"}</span>
          </div>
          {requiredRole && (
            <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-rose-700">
              <span className="font-medium">Required Authorization:</span>
              <span className="font-bold uppercase">{requiredRole}</span>
            </div>
          )}
        </div>

        <button
          onClick={onNavigateHome}
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg font-semibold text-sm shadow-sm transition-colors cursor-pointer"
          id="btn-return-dashboard"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Permitted Dashboard</span>
        </button>
      </div>
    </div>
  );
}
