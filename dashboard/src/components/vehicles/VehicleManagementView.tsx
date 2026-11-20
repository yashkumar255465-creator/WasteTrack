import { useState, useEffect, FormEvent } from "react";
import { Truck, Plus, Search, CheckCircle2, Clock, AlertTriangle, X, Edit2, Trash2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { fetchWithAuth } from "../../lib/api";
import { VehicleDto, CreateVehicleRequest, UpdateVehicleRequest } from "../../types";
import { useToast } from "../common/Toast";
import { UnauthorizedView } from "../common/UnauthorizedView";

export function VehicleManagementView() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [vehicles, setVehicles] = useState<VehicleDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleDto | null>(null);

  // Form states
  const [formRegNo, setFormRegNo] = useState("");
  const [formType, setFormType] = useState<string>("1001");
  const [formTagId, setFormTagId] = useState("");
  const [formDriver, setFormDriver] = useState("");
  const [formStatus, setFormStatus] = useState(true);
  const [formZoneId, setFormZoneId] = useState<string>(
    user?.role === "ADMIN" ? String(user.zoneId || 1) : "1"
  );

  const zonesList = [
    { id: 1, name: "Peelamedu" },
    { id: 2, name: "Compost Plant" },
    { id: 3, name: "Sathy Road" },
    { id: 4, name: "Ukkadam" },
  ];

  if (user?.role === "USER") {
    return (
      <UnauthorizedView
        requiredRole="ADMIN or SUPER ADMIN"
        attemptedResource="Vehicle Fleet Management"
      />
    );
  }

  const loadVehicles = async () => {
    setIsLoading(true);
    const param = user?.role === "ADMIN" ? `?zoneId=${user.zoneId}` : "";
    const res = await fetchWithAuth<VehicleDto[]>(`/api/vehiclemanagement${param}`);
    if (res.data) {
      setVehicles(res.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadVehicles();
  }, [user]);

  const handleRegisterVehicle = async (e: FormEvent) => {
    e.preventDefault();
    if (!formRegNo.trim()) {
      showToast("error", "Validation", "Registration Number is required.");
      return;
    }

    const payload: CreateVehicleRequest = {
      vehicleNumber: formRegNo.trim(),
      typeId: Number(formType),
      tagId: formTagId.trim() || null,
      driverDetails: formDriver.trim() || null,
      assignedZoneId: user?.role === "ADMIN" ? user.zoneId : Number(formZoneId),
    };

    const res = await fetchWithAuth("/api/vehiclemanagement", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    if (res.data) {
      showToast("success", "Vehicle Registered", `Fleet vehicle ${formRegNo.toUpperCase()} active.`);
      setShowAddModal(false);
      resetForm();
      loadVehicles();
    } else {
      showToast("error", "Failed", res.error);
    }
  };

  const handleUpdateVehicle = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingVehicle) return;

    const payload: UpdateVehicleRequest = {
      typeId: Number(formType),
      driverDetails: formDriver.trim() || null,
      assignedZoneId: user?.role === "ADMIN" ? user.zoneId : Number(formZoneId),
      status: formStatus
    };

    const res = await fetchWithAuth(`/api/vehiclemanagement/${editingVehicle.id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    });

    if (res.data) {
      showToast("success", "Vehicle Updated", `Fleet vehicle updated successfully.`);
      setEditingVehicle(null);
      setShowAddModal(false);
      resetForm();
      loadVehicles();
    } else {
      showToast("error", "Failed", res.error);
    }
  };

  const handleDeleteVehicle = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this vehicle?")) return;

    const res = await fetchWithAuth(`/api/vehiclemanagement/${id}`, {
      method: "DELETE"
    });

    if (res.error) {
       showToast("error", "Failed", res.error);
    } else {
       showToast("success", "Vehicle Deleted", "Vehicle removed from fleet.");
       loadVehicles();
    }
  };

  const resetForm = () => {
    setFormRegNo("");
    setFormType("1001");
    setFormTagId("");
    setFormDriver("");
    setFormStatus(true);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
    setEditingVehicle(null);
  };

  const openEditModal = (v: VehicleDto) => {
    setEditingVehicle(v);
    setFormRegNo(v.vehicleNumber);
    setFormType("1001"); 
    setFormTagId(""); 
    setFormDriver(v.driverDetails || "");
    setFormStatus(v.status);
    setFormZoneId(String(v.assignedZoneId || 1));
    setShowAddModal(true);
  };

  const filtered = vehicles.filter((v) => {
    const matchSearch =
      v.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.driverDetails && v.driverDetails.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchType = filterType === "All" || v.vehicleType === filterType;
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-200" id="vehicle-management-view">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Vehicle Fleet Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Municipal fleet registry, RFID tags, tare weight calibration, and live dispatch tracking.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#064e3b] hover:bg-[#053d2e] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
          id="btn-register-vehicle"
        >
          <Plus className="w-4 h-4" />
          <span>Register Vehicle</span>
        </button>
      </div>

      {/* Fleet Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Registered Fleet
          </span>
          <span className="text-xl font-black text-slate-900 font-mono">
            {vehicles.length} Trucks
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Active Vehicles
          </span>
          <span className="text-xl font-black text-emerald-700 font-mono">
            {vehicles.filter((v) => v.status).length} Active
          </span>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Reg No, or Driver..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 outline-none focus:border-emerald-600"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
          <span className="font-semibold text-slate-500">Modality:</span>
          {["All", "Compactor", "Tipper", "LCV", "Dumper Placer"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                filterType === type
                  ? "bg-[#064e3b] text-white font-bold"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs" id="table-vehicles">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Reg Number</th>
                <th className="py-3 px-4">Modality</th>
                <th className="py-3 px-4">Zone</th>
                <th className="py-3 px-4">Driver Details</th>
                <th className="py-3 px-4 text-right">Capacity (T)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {v.vehicleNumber}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-800">{v.vehicleType || '-'}</span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-800">
                    {v.assignedZoneName || '-'}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-800">{v.driverDetails || '-'}</div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-700">
                    {v.capacity ? `${v.capacity} T` : '-'}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        v.status
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                      {v.status ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center justify-center gap-2">
                       <button onClick={() => openEditModal(v)} className="text-slate-400 hover:text-sky-600 transition-colors" title="Edit">
                          <Edit2 className="w-4 h-4" />
                       </button>
                       <button onClick={() => handleDeleteVehicle(v.id)} className="text-slate-400 hover:text-rose-600 transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Vehicle Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-700" />
                <span>{editingVehicle ? "Edit Fleet Vehicle" : "Register Fleet Vehicle"}</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editingVehicle ? handleUpdateVehicle : handleRegisterVehicle} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Registration Number *</label>
                <input
                  type="text"
                  required
                  disabled={!!editingVehicle}
                  value={formRegNo}
                  onChange={(e) => setFormRegNo(e.target.value)}
                  placeholder="e.g. TN 38 BR 9901"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-slate-900 outline-none focus:border-emerald-600 uppercase disabled:opacity-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Vehicle Type (ID)</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 outline-none focus:border-emerald-600"
                  >
                    <option value="1001">Garbage Compactor (1001)</option>
                    <option value="1002">Tipper (1002)</option>
                  </select>
                </div>
                {!editingVehicle && (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">RFID Tag ID</label>
                    <input
                      type="text"
                      value={formTagId}
                      onChange={(e) => setFormTagId(e.target.value)}
                      placeholder="Tag ID"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 outline-none focus:border-emerald-600"
                    />
                  </div>
                )}
              </div>

              {user?.role === "SUPER_ADMIN" && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assign Operational Zone</label>
                  <select
                    value={formZoneId}
                    onChange={(e) => setFormZoneId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 outline-none focus:border-emerald-600"
                  >
                    {zonesList.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Driver Details</label>
                <input
                  type="text"
                  value={formDriver}
                  onChange={(e) => setFormDriver(e.target.value)}
                  placeholder="K. Selvam - 9842012345"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 outline-none focus:border-emerald-600"
                />
              </div>

              {editingVehicle && (
                <div>
                  <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
                    <input 
                       type="checkbox" 
                       checked={formStatus} 
                       onChange={e => setFormStatus(e.target.checked)} 
                       className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                    />
                    Active Status
                  </label>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#064e3b] hover:bg-[#053d2e] font-bold text-white shadow-xs transition-colors cursor-pointer"
                >
                  {editingVehicle ? "Save Changes" : "Save to Fleet Registry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
