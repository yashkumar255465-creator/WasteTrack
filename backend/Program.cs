using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using WasteTrack.API.Data;
using WasteTrack.API.Repositories;
using WasteTrack.API.Services;

var builder = WebApplication.CreateBuilder(args);

// ---- DB ----
builder.Services.AddDbContext<ApplicationDbContext>(opt =>
    opt.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// ---- App services ----
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<ITransitRepository, TransitRepository>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<IReportService, ReportService>();

// ---- JWT auth ----
var jwt = builder.Configuration.GetSection("Jwt");
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwt["Issuer"],
        ValidAudience = jwt["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["Key"]!)),
        ClockSkew = TimeSpan.FromSeconds(30)
    };
});
builder.Services.AddAuthorization();

// ---- CORS (adjust origins for your frontend) ----
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
        policy.WithOrigins("http://localhost:3000", "http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo { Title = "WasteTrack API", Version = "v1" });
    var jwtScheme = new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Scheme = "bearer",
        BearerFormat = "JWT",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Description = "Paste the access token (no 'Bearer ' prefix needed here)."
    };
    c.AddSecurityDefinition("Bearer", jwtScheme);
    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        { new Microsoft.OpenApi.Models.OpenApiSecurityScheme { Reference = new Microsoft.OpenApi.Models.OpenApiReference { Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme, Id = "Bearer" } }, Array.Empty<string>() }
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    db.Database.EnsureCreated();
    
    if (!db.Roles.Any())
    {
        db.Roles.Add(new WasteTrack.API.Models.Entities.Role { Id = 1, RoleName = "Super Admin", Description = "Full system access", Status = true, CreatedOn = DateTime.UtcNow });
        db.Roles.Add(new WasteTrack.API.Models.Entities.Role { Id = 2, RoleName = "Admin", Description = "Zone-scoped access", Status = true, CreatedOn = DateTime.UtcNow });
        db.Roles.Add(new WasteTrack.API.Models.Entities.Role { Id = 3, RoleName = "User", Description = "Read-only zone access", Status = true, CreatedOn = DateTime.UtcNow });
        db.SaveChanges();
    }

    if (!db.SuperAdmins.Any(x => x.Uname == "sysadmin"))
    {
        db.SuperAdmins.Add(new WasteTrack.API.Models.Entities.SuperAdmin 
        { 
            Name = "System Admin",
            Uname = "sysadmin", 
            Pwd = BCrypt.Net.BCrypt.HashPassword("admin123"), 
            RoleId = 1,
            Status = true,
            CreatedOn = DateTime.UtcNow
        });
        db.SaveChanges();
    }

    // Ensure required zones exist
    var requiredZones = new[] { "peelamedu", "sathy_road", "ukkadam", "compost_plant" };
    foreach (var zName in requiredZones)
    {
        if (!db.Zones.Any(z => z.ZoneName.ToLower() == zName.ToLower()))
        {
            db.Zones.Add(new WasteTrack.API.Models.Entities.Zone { ZoneName = zName });
        }
    }
    db.SaveChanges();
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection();
app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.MapGet("/", () => Results.Redirect("/swagger"));

app.Run();
