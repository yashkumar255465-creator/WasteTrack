using Microsoft.EntityFrameworkCore;
using WasteTrack.API.Models.Entities;

namespace WasteTrack.API.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Zone> Zones => Set<Zone>();
    public DbSet<SuperAdmin> SuperAdmins => Set<SuperAdmin>();
    public DbSet<AdminInfo> AdminInfos => Set<AdminInfo>();
    public DbSet<UserInfo> UserInfos => Set<UserInfo>();
    public DbSet<ApiUser> ApiUsers => Set<ApiUser>();
    public DbSet<Owner> Owners => Set<Owner>();
    public DbSet<Fleet> Fleets => Set<Fleet>();
    public DbSet<VehicleType> VehicleTypes => Set<VehicleType>();
    public DbSet<Vehicle> Vehicles => Set<Vehicle>();
    public DbSet<Waste> Wastes => Set<Waste>();
    public DbSet<WasteType> WasteTypes => Set<WasteType>();
    public DbSet<InternalTransit> InternalTransits => Set<InternalTransit>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<VehicleZoneAssignment> VehicleZoneAssignments => Set<VehicleZoneAssignment>();
    public DbSet<Report> Reports => Set<Report>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<Role>(e =>
        {
            e.ToTable("role");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id").ValueGeneratedNever();
            e.Property(x => x.RoleName).HasColumnName("role_name").HasMaxLength(50);
            e.Property(x => x.Description).HasColumnName("description");
            e.Property(x => x.Status).HasColumnName("status");
            e.Property(x => x.CreatedOn).HasColumnName("created_on");
        });

        b.Entity<Zone>(e =>
        {
            e.ToTable("zone");
            e.HasKey(x => x.ZoneId);
            e.Property(x => x.ZoneId).HasColumnName("zone_id");
            e.Property(x => x.ZoneName).HasColumnName("zone_name").HasMaxLength(100);
        });

        b.Entity<SuperAdmin>(e =>
        {
            e.ToTable("super_admin");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id").ValueGeneratedOnAdd();
            e.Property(x => x.Name).HasColumnName("name");
            e.Property(x => x.Uname).HasColumnName("uname");
            e.Property(x => x.Pwd).HasColumnName("pwd");
            e.Property(x => x.RoleId).HasColumnName("role_id");
            e.Property(x => x.Status).HasColumnName("status");
            e.Property(x => x.CreatedOn).HasColumnName("created_on");
            e.HasOne(x => x.Role).WithMany(r => r.SuperAdmins).HasForeignKey(x => x.RoleId);
            e.HasIndex(x => x.Uname).IsUnique();
        });

        b.Entity<AdminInfo>(e =>
        {
            e.ToTable("admin_info");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id").ValueGeneratedOnAdd();
            e.Property(x => x.Name).HasColumnName("name");
            e.Property(x => x.Designation).HasColumnName("designation");
            e.Property(x => x.Department).HasColumnName("department");
            e.Property(x => x.Uname).HasColumnName("uname");
            e.Property(x => x.Pwd).HasColumnName("pwd");
            e.Property(x => x.RoleId).HasColumnName("role_id");
            e.Property(x => x.ZoneId).HasColumnName("zone_id");
            e.Property(x => x.Status).HasColumnName("status");
            e.Property(x => x.AddedBy).HasColumnName("added_by");
            e.Property(x => x.AddedOn).HasColumnName("added_on");
            e.HasOne(x => x.Role).WithMany(r => r.AdminInfos).HasForeignKey(x => x.RoleId);
            e.HasOne(x => x.Zone).WithMany(z => z.AdminInfos).HasForeignKey(x => x.ZoneId);
            e.HasIndex(x => x.Uname).IsUnique();
        });

        b.Entity<UserInfo>(e =>
        {
            e.ToTable("user_info");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id").ValueGeneratedOnAdd();
            e.Property(x => x.Name).HasColumnName("name");
            e.Property(x => x.Designation).HasColumnName("designation");
            e.Property(x => x.Department).HasColumnName("department");
            e.Property(x => x.Uname).HasColumnName("uname");
            e.Property(x => x.Pwd).HasColumnName("pwd");
            e.Property(x => x.RoleId).HasColumnName("role_id");
            e.Property(x => x.ZoneId).HasColumnName("zone_id");
            e.Property(x => x.Status).HasColumnName("status");
            e.Property(x => x.AddedBy).HasColumnName("added_by");
            e.Property(x => x.AddedOn).HasColumnName("added_on");
            e.HasOne(x => x.Role).WithMany(r => r.UserInfos).HasForeignKey(x => x.RoleId);
            e.HasOne(x => x.Zone).WithMany(z => z.UserInfos).HasForeignKey(x => x.ZoneId);
            e.HasIndex(x => x.Uname).IsUnique();
        });

        b.Entity<ApiUser>(e =>
        {
            e.ToTable("api_user");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id").ValueGeneratedNever();
            e.Property(x => x.UserId).HasColumnName("user_id");
            e.Property(x => x.Pwd).HasColumnName("pwd");
            e.Property(x => x.Status).HasColumnName("status");
        });

        b.Entity<Owner>(e =>
        {
            e.ToTable("owner");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id").ValueGeneratedNever();
            e.Property(x => x.Type).HasColumnName("type");
        });

        b.Entity<Fleet>(e =>
        {
            e.ToTable("fleet");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id").ValueGeneratedNever();
            e.Property(x => x.FleetName).HasColumnName("fleet");
        });

        b.Entity<VehicleType>(e =>
        {
            e.ToTable("vehicle_type");
            e.HasKey(x => x.VehicleId);
            e.Property(x => x.VehicleId).HasColumnName("vehicle_id");
            e.Property(x => x.VehicleTypeName).HasColumnName("vehicle_type");
            e.Property(x => x.Capacity).HasColumnName("capacity");
        });

        b.Entity<Vehicle>(e =>
        {
            e.ToTable("vehicle");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id").ValueGeneratedNever();
            e.Property(x => x.VehicleNumber).HasColumnName("vehicle_number");
            e.Property(x => x.TypeId).HasColumnName("type_id");
            e.Property(x => x.Status).HasColumnName("status");
            e.Property(x => x.TagId).HasColumnName("tag_id");
            e.Property(x => x.AddedBy).HasColumnName("added_by");
            e.Property(x => x.AddedOn).HasColumnName("added_on");
            e.Property(x => x.TaggedBy).HasColumnName("tagged_by");
            e.Property(x => x.TaggedOn).HasColumnName("tagged_on");
            e.Property(x => x.UpdatedBy).HasColumnName("updated_by");
            e.Property(x => x.UpdatedOn).HasColumnName("updated_on");
            e.Property(x => x.VehicleRemark).HasColumnName("vehicle_remark");
            e.HasOne(x => x.VehicleTypeNav).WithMany().HasForeignKey(x => x.TypeId).HasPrincipalKey(vt => vt.VehicleId);
        });

        b.Entity<Waste>(e =>
        {
            e.ToTable("waste");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id").ValueGeneratedNever();
            e.Property(x => x.Name).HasColumnName("name");
        });

        b.Entity<WasteType>(e =>
        {
            e.ToTable("waste_type");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id").ValueGeneratedNever();
            e.Property(x => x.WasteName).HasColumnName("waste_name");
            e.Property(x => x.WasteId).HasColumnName("waste_id");
            e.Property(x => x.Status).HasColumnName("status");
            e.Property(x => x.AddedBy).HasColumnName("added_by");
            e.Property(x => x.AddedOn).HasColumnName("added_on");
            e.Property(x => x.UpdatedBy).HasColumnName("updated_by");
            e.Property(x => x.UpdatedOn).HasColumnName("updated_on");
        });

        b.Entity<InternalTransit>(e =>
        {
            e.ToTable("internal_transit");
            e.HasKey(x => x.TripId);
            e.Property(x => x.TripId).HasColumnName("trip_id");
            e.Property(x => x.VehicleTagId).HasColumnName("vehicle_tag_id");
            e.Property(x => x.VehicleNumber).HasColumnName("vehicle_number");
            e.Property(x => x.OwnerId).HasColumnName("owner_id");
            e.Property(x => x.FleetId).HasColumnName("fleet_id");
            e.Property(x => x.ZoneId).HasColumnName("zone_id");
            e.Property(x => x.InWeight).HasColumnName("in_weight");
            e.Property(x => x.OutWeight).HasColumnName("out_weight");
            e.Property(x => x.InTime).HasColumnName("in_time");
            e.Property(x => x.OutTime).HasColumnName("out_time");
            e.Property(x => x.TotalTime).HasColumnName("total_time");
            e.Property(x => x.UserId).HasColumnName("user_id");
            e.Property(x => x.Trace).HasColumnName("trace");
            e.Property(x => x.Sync).HasColumnName("sync");
            e.Property(x => x.LocationId).HasColumnName("location_id");
            e.Property(x => x.ContainerTagId).HasColumnName("container_tag_id");
            e.Property(x => x.ContainerNumber).HasColumnName("container_number");
            e.Property(x => x.COwnerId).HasColumnName("c_owner_id");
            e.Property(x => x.TotalWeight).HasColumnName("total_weight");
            e.Property(x => x.Datsign).HasColumnName("datsign");
            e.Property(x => x.WardId).HasColumnName("ward_id");
            e.Property(x => x.WasteType).HasColumnName("waste_type");
            e.Property(x => x.Maturation).HasColumnName("maturation");
            e.HasOne(x => x.Zone).WithMany(z => z.Transits).HasForeignKey(x => x.ZoneId);
        });

        // Application-level table — create via migration, does not exist in original dump.
        b.Entity<RefreshToken>(e =>
        {
            e.ToTable("refresh_token");
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.Token).IsUnique();
        });

        // Application-level table — create via migration, does not exist in original dump.
        b.Entity<VehicleZoneAssignment>(e =>
        {
            e.ToTable("vehicle_zone_assignment");
            e.HasKey(x => x.VehicleId);
        });

        b.Entity<Report>(e =>
        {
            e.ToTable("Reports");
            e.HasKey(x => x.ReportId);
        });
    }
}
