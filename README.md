# SchoolHoldDotnet API

A simple and maintainable **ASP.NET Core Web API** for managing school data, including departments, instructors, courses, and enrollments.  
Built with **.NET 8** and **Entity Framework Core** for database interactions.

---

## 📂 Project Structure

| Folder | Description |
|--------|-------------|
| `Controllers/` | API controllers: `DepartmentController`, `InstructorController`, `WeatherForecastController` |
| `Data/` | `AppDbContext` with EF Core mappings |
| `Service/` | Business logic implementations (`DepartmentService`, `InstructorService`) |
| `IService/` | Service interfaces |
| `Models/` | Domain entities (`Department`, `Instructor`, `Course`, `Enrollment`, `OfficeAssignment`, `ApplicationUser`) |
| `DTO/` | Request DTOs for create/update operations |
| `Migrations/` | EF Core migrations representing the database schema |

---

## ⚡ Features

- RESTful endpoints for **Departments** and **Instructors**
- EF Core database migrations included
- Configurable via `appsettings.json` / `appsettings.Development.json`
- Support for multiple database providers (SQLite, SQL Server, etc.)
- Clean separation of concerns: controllers → services → data layer

---

## 🛠 Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download)  
- (Optional) `dotnet-ef` tool for migrations:  
  ```bash
  dotnet tool install --global dotnet-ef


  git clone https://github.com/MhmdTalat/SchoolHubAPI.git
cd SchoolHubAPI
dotnet restore
dotnet build
dotnet ef database update
dotnet run
curl -sS https://localhost:5001/api/department
curl -X POST https://localhost:5001/api/department \
     -H "Content-Type: application/json" \
     -d '{"name":"Computer Science"}'

