-- Run once against the existing [waste] database before first launch.

-- 1) Seed the role table so RoleId 1/2/3 line up with AppRole enum in code.
IF NOT EXISTS (SELECT 1 FROM dbo.role WHERE id = 1)
    SET IDENTITY_INSERT dbo.role ON;
IF NOT EXISTS (SELECT 1 FROM dbo.role WHERE id = 1)
    INSERT INTO dbo.role (id, role_name, description, status, created_on) VALUES (1, 'Super Admin', 'Full system access', 1, GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM dbo.role WHERE id = 2)
    INSERT INTO dbo.role (id, role_name, description, status, created_on) VALUES (2, 'Admin', 'Zone-scoped access', 1, GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM dbo.role WHERE id = 3)
    INSERT INTO dbo.role (id, role_name, description, status, created_on) VALUES (3, 'User', 'Read-only zone access', 1, GETUTCDATE());
SET IDENTITY_INSERT dbo.role OFF;

-- 2) New application tables (not in the original dump).
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'refresh_token')
BEGIN
    CREATE TABLE dbo.refresh_token (
        Id INT IDENTITY PRIMARY KEY,
        Token NVARCHAR(200) NOT NULL UNIQUE,
        AccountUname NVARCHAR(100) NOT NULL,
        Role INT NOT NULL, -- 1=SuperAdmin, 2=Admin, 3=User
        ExpiresOn DATETIME2 NOT NULL,
        Revoked BIT NOT NULL DEFAULT 0,
        CreatedOn DATETIME2 NOT NULL DEFAULT GETUTCDATE()
    );
END

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'vehicle_zone_assignment')
BEGIN
    CREATE TABLE dbo.vehicle_zone_assignment (
        VehicleId INT PRIMARY KEY, -- FK -> vehicle.id
        ZoneId INT NOT NULL,       -- FK -> zone.zone_id
        AssignedOn DATETIME2 NOT NULL DEFAULT GETUTCDATE()
    );
END

-- 3) Create your first Super Admin login (replace the pwd hash below with a
--    real BCrypt hash — you can generate one by calling BCrypt.Net.BCrypt.HashPassword
--    from a scratch console, or temporarily log the hash from a throwaway endpoint).
-- INSERT INTO dbo.super_admin (name, uname, pwd, role_id, status, created_on)
-- VALUES ('System Admin', 'superadmin', '<bcrypt-hash-here>', 1, 1, GETUTCDATE());
