using GameLocalization.Core.Models;
using Microsoft.EntityFrameworkCore;
namespace GameLocalization.Infrastructure.Data;


public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Language> Languages { get; set; }
    public DbSet<TranslationKey> TranslationKeys { get; set; }
    public DbSet<Translation> Translations { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        modelBuilder.Entity<Translation>()
            .HasOne(t => t.Language)
            .WithMany()
            .HasForeignKey(t => t.LanguageId);

        modelBuilder.Entity<Translation>()
            .HasOne(t => t.TranslationKey)
            .WithMany(k => k.Translations)
            .HasForeignKey(t => t.TranslationKeyId);
    }
}