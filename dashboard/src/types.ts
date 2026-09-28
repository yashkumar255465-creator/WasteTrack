export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'USER';

export interface User {
  id: number;
  userId: string;
  name: string;
  email: string;
  role: Role;
  zoneId: number | null;
  zoneName: string | null;
  terminal: string;
  status: 'ACTIVE' | 'DEACTIVATED';
  jobTitle: string;
  lastActive?: string;
}

export interface Zone {
  id: number;
  name: string;
  code: string;
  wardCount: number;
  activeVehicles: number;
  dailyTargetTons: number;
  primaryTransferStation: string;
}

export interface VehicleDto {
  id: number;
  vehicleNumber: string;
  vehicleType: string | null;
  capacity: number | null;
  status: boolean;
  driverDetails: string | null;
  assignedZoneId: number | null;
  assignedZoneName: string | null;
}

export interface CreateVehicleRequest {
  vehicleNumber: string;
  typeId: number;
  tagId: string | null;
  driverDetails: string | null;
  assignedZoneId: number | null;
}

export interface UpdateVehicleRequest {
  typeId: number | null;
  driverDetails: string | null;
  assignedZoneId: number | null;
  status: boolean | null;
}

export type WasteType = 'Wet Waste' | 'Dry Waste' | 'Mixed' | 'Silt / Debris';

export interface TripManifest {
  id: string;
  dateTime: string;
  vehicleId: string;
  vehicleNumber: string;
  vehicleType: 'Compactor' | 'Tipper' | 'LCV' | 'Dumper Placer';
  owner: 'CIWMCPL' | 'CMC Fleet' | 'Private Cont.';
  zoneId: number;
  zoneName: string;
  wardNumber: string;
  wasteType: WasteType;
  grossWeightKg: number;
  tareWeightKg: number;
  netWeightKg: number;
  status: 'Verified' | 'Pending Verification' | 'Rejected';
  operatorId: string;
  slipNumber: string;
}

export interface ZoneCollectionDto {
  zoneId: number;
  zoneName: string;
  totalWeightKg: number;
  tripCount: number;
}

export interface VehicleActivityDto {
  vehicleId: number;
  vehicleNumber: string;
  tripsToday: number;
  weightTodayKg: number;
  lastActive: string | null;
}

export interface RecentActivityDto {
  description: string;
  occurredOn: string;
}

export interface DailyTrendPointDto {
  date: string;
  totalWeightKg: number;
}

export interface SuperAdminDashboardDto {
  totalUsers: number;
  totalAdmins: number;
  totalVehicles: number;
  totalZones: number;
  wasteCollectionTodayKg: number;
  wasteCollectionMonthKg: number;
  zoneWiseCollection: ZoneCollectionDto[];
  vehicleActivity: VehicleActivityDto[];
  recentActivities: RecentActivityDto[];
  collectionTrend: DailyTrendPointDto[];
}

export interface AdminDashboardDto {
  zoneId: number;
  zoneName: string;
  vehiclesInZone: number;
  wasteCollectionTodayKg: number;
  wasteCollectionMonthKg: number;
  tripsToday: number;
  vehicleActivity: VehicleActivityDto[];
  collectionTrend: DailyTrendPointDto[];
}

export interface UserDashboardDto {
  zoneId: number;
  zoneName: string;
  wasteCollectionTodayKg: number;
  wasteCollectionMonthKg: number;
  tripsToday: number;
  collectionTrend: DailyTrendPointDto[];
}

export type DashboardMetrics = SuperAdminDashboardDto | AdminDashboardDto | UserDashboardDto;

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ReportFilterParams {
  fromDate?: string;
  toDate?: string;
  zone?: string;
  owner?: string;
  wasteType?: string;
  wardNo?: string;
  vehicleType?: string;
  search?: string;
}
