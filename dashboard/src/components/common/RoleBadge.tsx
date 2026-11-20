import { Role } from "../../types";

interface RoleBadgeProps {
  role: Role | string;
  customTitle?: string;
  className?: string;
}

export function RoleBadge({ role, customTitle, className = "" }: RoleBadgeProps) {
  const displayRole = customTitle || (role === "SUPER_ADMIN" ? "Super Admin" : role === "ADMIN" ? "Admin" : "User");

  // Visual styling aligned with screenshots
  let styleClass = "bg-emerald-100/70 text-emerald-800 border-emerald-200";

  const lower = (role || "").toLowerCase();
  const lowerTitle = (customTitle || "").toLowerCase();

  if (lower.includes("super") || lowerTitle.includes("super")) {
    styleClass = "bg-purple-100 text-purple-800 border-purple-200";
  } else if (lowerTitle.includes("supervisor") || lower === "admin") {
    styleClass = "bg-blue-100 text-blue-800 border-blue-200";
  } else if (lowerTitle.includes("weighbridge")) {
    styleClass = "bg-teal-100 text-teal-800 border-teal-200";
  } else if (lowerTitle.includes("dispatcher")) {
    styleClass = "bg-amber-100 text-amber-800 border-amber-200";
  } else {
    styleClass = "bg-emerald-100 text-emerald-800 border-emerald-200";
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styleClass} ${className}`}
      id={`role-badge-${role}`}
    >
      {displayRole}
    </span>
  );
}
