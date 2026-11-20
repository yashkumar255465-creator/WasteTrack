# WasteTrack API (.NET 8)

Role-based backend for the CIWMCPL waste-management schema, matching the
tables in your `waste` database: `super_admin`, `admin_info`, `user_info`,
`role`, `zone`, `vehicle`, `vehicle_type`, `waste`, `waste_type`, `owner`,
`fleet`, `api_user`, and the trip tables `internal_transit` /
`peelamedu` / `sathy_road` / `ukkadam`.

## Setup

1. `dotnet restore`
2. Edit `appsettings.json`:
   - `ConnectionStrings:DefaultConnection` → your SQL Server instance
   - `Jwt:Key` → a long random secret (32+ chars)
3. Run `seed.sql` against the `waste` database once (adds the `role` rows
   1/2/3 and two new app-level tables: `refresh_token`,
   `vehicle_zone_assignment` — everything else uses your existing tables
   as-is).
4. Create your first Super Admin row in `super_admin` with a BCrypt password
   hash (see comment at the bottom of `seed.sql`).
5. `dotnet run`

## Why two new tables

- `refresh_token` — the three login tables (`super_admin`, `admin_info`,
  `user_info`) are physically separate, so refresh tokens are tracked in one
  shared place rather than three.
- `vehicle_zone_assignment` — `dbo.vehicle` has no `zone_id` column, so
  "assign vehicle to zone" (required by the spec) needed somewhere to live.
  Everything else — users, admins, zones, trips — reads/writes your existing
  tables directly with no schema changes.

## Roles & scoping

| Role | Backed by | Scope |
|---|---|---|
| Super Admin | `super_admin` | Everything |
| Admin | `admin_info` | Locked to `zone_id` on their row (read from the JWT, never from client input) |
| User | `user_info` | Same zone lock, read-only (no vehicle/user/zone management endpoints) |

The JWT carries `role`, `account_id`, and `zone_id` (Admin/User only).
Every controller re-derives the caller's zone from the token — a request
can't widen its own scope by passing a different `zoneId` in the query
string.

## Endpoints

- `POST /api/auth/login`, `/refresh`, `/logout`
- `GET /api/dashboard` — shape depends on caller's role (Super Admin /
  Admin / User dashboards, per the spec)
- `GET/POST/PUT/DELETE /api/usermanagement/...` — **Super Admin only**
- `GET/POST/PUT/DELETE /api/zonemanagement/...` — **Super Admin only**
- `GET/POST/PUT/DELETE /api/vehiclemanagement/...` — Super Admin manages;
  Admin gets a read-only, zone-filtered list; User is forbidden
- `GET /api/reports` and `GET /api/reports/export` (CSV) — zone/vehicle/date
  filters; Admin/User are hard-locked to their own zone

## Historical data note

`internal_transit` is treated as the current trip table; `peelamedu`,
`sathy_road` and `ukkadam` look like older per-zone mirror tables with the
same shape. `TransitRepository` unions all four so dashboards and reports
don't miss historical rows — confirm this matches your actual data model
before going to production, and point new trip writes at `internal_transit`
only going forward.
