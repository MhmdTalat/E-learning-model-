using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using ELearningModels.Data;

public class AppDbContextFactory
    : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();

        optionsBuilder.UseSqlite(
            "Data Source=schoolhold.db"
        );

        return new AppDbContext(optionsBuilder.Options);
    }
}
