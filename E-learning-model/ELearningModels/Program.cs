using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ELearningModels.Data;
using ELearningModels.Iservice;
using ELearningModels.model;
using ELearningModels.service;
using AutoMapper;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;

var builder = WebApplication.CreateBuilder(args);

// 1️⃣ DbContext
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection"))
);

// 2️⃣ Identity
builder.Services.AddIdentity<ApplicationUser, IdentityRole<int>>()
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();

// 2.5 CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:5174", "http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();  // Add this line
    });
});

// 3️⃣ AutoMapper
builder.Services.AddAutoMapper(cfg => { }, typeof(InstructorProfile));

// 4️⃣ Controllers
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.WriteIndented = true;
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

// 5️⃣ Services
builder.Services.AddScoped<IInstructorService, InstructorService>();
builder.Services.AddScoped<IDepartmentService, DepartmentService>();
builder.Services.AddScoped<ICourseService, CourseService>();
builder.Services.AddScoped<IStudentService, StudentService>();
builder.Services.AddScoped<IEnrollmentService, EnrollmentService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ITokenService, TokenService>();

// 6️⃣ Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 7️⃣ JWT Authentication
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
        ValidIssuer = builder.Configuration["JWT:Issuer"],
        ValidAudience = builder.Configuration["JWT:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["JWT:Key"]!)
        )
    };
});

var app = builder.Build();

// Global exception handler - return JSON for API errors
app.Use(async (context, next) =>
{
    try { await next(); }
    catch (Exception ex)
    {
        context.Response.StatusCode = ex is UnauthorizedAccessException ? 401 : 500;
        context.Response.ContentType = "application/json";
        var msg = ex.Message;
        if (ex.InnerException != null) msg += " | " + ex.InnerException.Message;
        await context.Response.WriteAsJsonAsync(new { message = msg });
    }
});

using (var scope = app.Services.CreateScope())
{
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<int>>>();
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    // Create default roles
    foreach (var roleName in Enum.GetNames(typeof(UserRoleType)))
    {
        if (!await roleManager.RoleExistsAsync(roleName))
        {
            await roleManager.CreateAsync(new IdentityRole<int>(roleName));
        }
    }

    // Seed default departments
    if (!context.Departments.Any())
    {
        var departments = new[]
        {
            new Department { Name = "Computer Science", Budget = 100000, StartDate = new DateTime(2024, 1, 1) },
            new Department { Name = "Engineering", Budget = 150000, StartDate = new DateTime(2024, 1, 1) },
            new Department { Name = "Business", Budget = 80000, StartDate = new DateTime(2024, 1, 1) },
            new Department { Name = "Arts & Humanities", Budget = 60000, StartDate = new DateTime(2024, 1, 1) },
            new Department { Name = "Science", Budget = 120000, StartDate = new DateTime(2024, 1, 1) },
        };
        context.Departments.AddRange(departments);
        await context.SaveChangesAsync();
    }
}
// 8️⃣ Middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    // Disable HTTPS redirection in development for HTTP requests
    // app.UseHttpsRedirection();
}
else
{
    app.UseHttpsRedirection();
}

app.UseCors();

// Create uploads directory if it doesn't exist
var uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "uploads");
if (!Directory.Exists(uploadPath))
{
    Directory.CreateDirectory(uploadPath);
}

// Serve static files from uploads directory
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(uploadPath),
    RequestPath = "/uploads"
});

// ⚠️ Must come BEFORE UseAuthorization
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.Run();
