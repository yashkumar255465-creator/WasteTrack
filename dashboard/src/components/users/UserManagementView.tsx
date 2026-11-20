import { useState, useEffect, FormEvent } from "react";
import { Users, Plus, RefreshCw, KeyRound, Edit3, AlertCircle, X, Trash2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { fetchWithAuth } from "../../lib/api";
import { RoleBadge } from "../common/RoleBadge";
import { useToast } from "../common/Toast";
import { UnauthorizedView } from "../common/UnauthorizedView";

// DTOs matching backend C#
export interface UserListItemDto {
  id: number;
  name: string;
  uname: string;
  role: string;
  zoneId: number | null;
  zoneName: string | null;
  status: boolean;
  addedOn: string;
}

export interface CreateUserRequest {
  name: string;
  designation?: string;
  department?: string;
  uname: string;
  password?: string;
  role: string;
  zoneId?: number;
}

export interface UpdateUserRequest {
  name?: string;
  designation?: string;
  department?: string;
  zoneId?: number;
  status?: boolean;
  newPassword?: string;
}

export function UserManagementView() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [users, setUsers] = useState<UserListItemDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Modals state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<UserListItemDto | null>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<UserListItemDto | null>(null);
  const [newPasswordValue, setNewPasswordValue] = useState<string>("ciwmcpl@2026");

  // Add/Edit Form fields
  const [formUname, setFormUname] = useState("");
  const [formName, setFormName] = useState("");
  const [formDesignation, setFormDesignation] = useState("");
  const [formDepartment, setFormDepartment] = useState("");
  const [formRole, setFormRole] = useState<string>("Admin");
  const [formZoneId, setFormZoneId] = useState<string>("1");
  const [formPassword, setFormPassword] = useState("password123");
  const [formError, setFormError] = useState("");

  const zonesList = [
    { id: 1, name: "Peelamedu", station: "Peelamedu Transfer Station" },
    { id: 2, name: "Compost Plant", station: "Vellalore Bio-Compost Facility" },
    { id: 3, name: "Sathy Road", station: "Sathy Road Transit Hub" },
    { id: 4, name: "Ukkadam", station: "Ukkadam Weigh Station" },
  ];

  // RBAC Guard
  if (user?.role !== "SUPER_ADMIN") {
    return (
      <UnauthorizedView
        requiredRole="SUPER ADMIN"
        attemptedResource="User Management"
      />
    );
  }

  const loadUsers = async () => {
    setIsLoading(true);
    const res = await fetchWithAuth<UserListItemDto[]>("/api/usermanagement");
    if (res.data) {
      setUsers(res.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSyncMssql = async () => {
    setIsSyncing(true);
    showToast("info", "Syncing", "Fetching latest users...");
    await loadUsers();
    setIsSyncing(false);
    showToast("success", "Synchronized", "User list updated.");
  };

  const handleToggleStatus = async (targetUser: UserListItemDto) => {
    if (targetUser.uname === user?.userId) {
      showToast("error", "Action Forbidden", "You cannot deactivate your own session.");
      return;
    }

    const res = await fetchWithAuth(`/api/usermanagement/${targetUser.role}/${targetUser.id}`, {
      method: "PUT",
      body: JSON.stringify({ status: !targetUser.status })
    });

    if (res.status === 200 || res.status === 204 || res.data) {
      showToast("success", "Account Status Updated", `${targetUser.name} status changed.`);
      loadUsers();
    } else {
      showToast("error", "Update Failed", res.error);
    }
  };

  const handleDelete = async (targetUser: UserListItemDto) => {
    if (targetUser.uname === user?.userId) {
      showToast("error", "Action Forbidden", "You cannot delete your own account.");
      return;
    }
    
    if (!confirm(`Are you sure you want to delete ${targetUser.name}?`)) return;

    const res = await fetchWithAuth(`/api/usermanagement/${targetUser.role}/${targetUser.id}`, {
      method: "DELETE"
    });

    if (res.status === 200 || res.status === 204 || res.data) {
      showToast("success", "User Deleted", `${targetUser.name} has been removed.`);
      loadUsers();
    } else {
      showToast("error", "Delete Failed", res.error);
    }
  };

  const openAddModal = () => {
    setFormUname("");
    setFormName("");
    setFormDesignation("Supervisor");
    setFormDepartment("IT");
    setFormRole("Admin");
    setFormZoneId("1");
    setFormPassword("admin123");
    setFormError("");
    setShowAddModal(true);
  };

  const openEditModal = (targetUser: UserListItemDto) => {
    setEditingUser(targetUser);
    setFormName(targetUser.name);
    setFormRole(targetUser.role);
    setFormZoneId(targetUser.zoneId ? String(targetUser.zoneId) : "1");
    setFormDesignation("");
    setFormDepartment("");
    setFormError("");
  };

  const handleCreateUser = async (e: FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formUname.trim() || !formName.trim()) {
      setFormError("User ID and Full Name are mandatory.");
      return;
    }

    if (formRole !== "SuperAdmin" && !formZoneId) {
      setFormError("Admin/User role requires a zone.");
      return;
    }

    const payload: CreateUserRequest = {
      uname: formUname.trim(),
      name: formName.trim(),
      designation: formDesignation.trim(),
      department: formDepartment.trim(),
      role: formRole,
      zoneId: formRole === "SuperAdmin" ? undefined : Number(formZoneId),
      password: formPassword
    };

    const res = await fetchWithAuth("/api/usermanagement", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    if (res.status === 200 || res.status === 201 || res.data) {
      showToast("success", "User Created", `Added ${formName}.`);
      setShowAddModal(false);
      loadUsers();
    } else {
      setFormError(res.error || "Failed to create user account.");
    }
  };

  const handleUpdateUser = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setFormError("");

    const payload: UpdateUserRequest = {
      name: formName.trim(),
      designation: formDesignation.trim(),
      department: formDepartment.trim(),
      zoneId: formRole === "SuperAdmin" ? undefined : Number(formZoneId),
    };

    const res = await fetchWithAuth(`/api/usermanagement/${editingUser.role}/${editingUser.id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    });

    if (res.status === 200 || res.status === 204 || res.data) {
      showToast("success", "User Updated", `Updated details for ${formName}.`);
      setEditingUser(null);
      loadUsers();
    } else {
      setFormError(res.error || "Failed to update user.");
    }
  };

  const handleResetPassword = async () => {
    if (!resetPasswordUser) return;

    const payload: UpdateUserRequest = {
      newPassword: newPasswordValue
    };

    const res = await fetchWithAuth(`/api/usermanagement/${resetPasswordUser.role}/${resetPasswordUser.id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    });

    if (res.status === 200 || res.status === 204 || res.data) {
      showToast("success", "Password Reset", `New password set for ${resetPasswordUser.name}.`);
      setResetPasswordUser(null);
    } else {
      showToast("error", "Reset Failed", res.error);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200" id="user-management-view">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            User Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Admin console user accounts and scale terminal operator authentication.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSyncMssql}
            disabled={isSyncing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isSyncing ? "animate-spin text-emerald-600" : ""}`} />
            <span>Sync</span>
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#064e3b] hover:bg-[#053d2e] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">User Name</th>
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Assigned Plant</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {users.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-medium text-slate-500">{item.id}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{item.uname}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{item.name}</td>
                  <td className="py-3.5 px-4">
                    <RoleBadge role={item.role.toUpperCase() as any} customTitle={item.role} />
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-700">
                    {item.role === "SuperAdmin" ? "Central HQ & Operations" : item.zoneName ? `${item.zoneName} Transfer Station` : "Unassigned"}
                  </td>
                  <td className="py-3.5 px-4">
                    {item.status ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>ACTIVE
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>DEACTIVATED
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEditModal(item)} className="p-1 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100 transition-colors" title="Edit">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => { setResetPasswordUser(item); setNewPasswordValue(""); }} className="p-1 text-slate-500 hover:text-amber-700 rounded hover:bg-amber-50 transition-colors" title="Reset Password">
                        <KeyRound className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(item)} className="p-1 text-slate-500 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors" title="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleToggleStatus(item)} className={`text-xs font-semibold px-2 py-0.5 rounded transition-colors cursor-pointer ${item.status ? "text-slate-600 hover:text-rose-600 hover:bg-rose-50" : "text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50"}`}>
                        {item.status ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-700" />
                <span>Add New User</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-3.5">
              {formError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" /><span>{formError}</span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">User ID / Username *</label>
                  <input type="text" required value={formUname} onChange={(e) => setFormUname(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 outline-none focus:border-emerald-600" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input type="text" required value={formName} onChange={(e) => setFormName(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 outline-none focus:border-emerald-600" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Designation</label>
                  <select value={formDesignation} onChange={(e) => setFormDesignation(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 outline-none focus:border-emerald-600">
                    <option value="Supervisor">Supervisor</option>
                    <option value="Zone Manager">Zone Manager</option>
                    <option value="Fleet Manager">Fleet Manager</option>
                    <option value="System Administrator">System Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <select value={formDepartment} onChange={(e) => setFormDepartment(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 outline-none focus:border-emerald-600">
                    <option value="IT">IT</option>
                    <option value="Waste Management">Waste Management</option>
                    <option value="Administration">Administration</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Role *</label>
                  <select value={formRole} onChange={(e) => setFormRole(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 outline-none focus:border-emerald-600">
                    <option value="Admin">Admin</option>
                    <option value="User">User</option>
                    <option value="SuperAdmin">Super Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Zone</label>
                  <select value={formZoneId} onChange={(e) => setFormZoneId(e.target.value)} disabled={formRole === "SuperAdmin"} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 outline-none focus:border-emerald-600 disabled:bg-slate-100">
                    {formRole === "SuperAdmin" ? <option value="All">All Zones</option> : zonesList.map((z) => (
                      <option key={z.id} value={z.id}>{z.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
                <input type="password" required value={formPassword} onChange={(e) => setFormPassword(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono text-slate-900 outline-none focus:border-emerald-600" />
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-lg bg-[#064e3b] hover:bg-[#053d2e] text-xs font-bold text-white shadow-xs transition-colors">Save Account</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-extrabold text-slate-900">Edit User: {editingUser.uname}</h3>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-700 p-1 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateUser} className="space-y-3.5">
              {formError && <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">{formError}</div>}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input type="text" required value={formName} onChange={(e) => setFormName(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 outline-none focus:border-emerald-600" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Designation</label>
                  <select value={formDesignation} onChange={(e) => setFormDesignation(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 outline-none focus:border-emerald-600">
                    <option value="">— unchanged —</option>
                    <option value="Supervisor">Supervisor</option>
                    <option value="Zone Manager">Zone Manager</option>
                    <option value="Fleet Manager">Fleet Manager</option>
                    <option value="System Administrator">System Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <select value={formDepartment} onChange={(e) => setFormDepartment(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 outline-none focus:border-emerald-600">
                    <option value="">— unchanged —</option>
                    <option value="IT">IT</option>
                    <option value="Waste Management">Waste Management</option>
                    <option value="Administration">Administration</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Role (Read-Only)</label>
                  <input type="text" value={formRole} disabled className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 text-xs text-slate-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Zone</label>
                  <select value={formZoneId} onChange={(e) => setFormZoneId(e.target.value)} disabled={formRole === "SuperAdmin"} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 outline-none focus:border-emerald-600 disabled:bg-slate-100">
                    {formRole === "SuperAdmin" ? <option value="All">All Zones</option> : zonesList.map((z) => (
                      <option key={z.id} value={z.id}>{z.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setEditingUser(null)} className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-lg bg-[#064e3b] hover:bg-[#053d2e] text-xs font-bold text-white shadow-xs transition-colors cursor-pointer">Update Account</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {resetPasswordUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3 border border-amber-100">
              <KeyRound className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 text-center mb-1">Reset Password</h3>
            <p className="text-xs text-slate-500 text-center mb-4">Enter a new password for <strong className="text-slate-800">{resetPasswordUser.name}</strong></p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
                <input type="text" value={newPasswordValue} onChange={(e) => setNewPasswordValue(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono text-slate-900 outline-none focus:border-amber-600" />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setResetPasswordUser(null)} className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
                <button onClick={handleResetPassword} className="flex-1 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-xs font-bold text-white transition-colors cursor-pointer">Confirm Reset</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
