using GameLocalization.Core.Interfaces;
using GameLocalization.Core.Models;
using GameLocalization.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
namespace GameLocalization.Modules.Languages;

public class LanguageRepository : ILanguageRepository
{
    private readonly AppDbContext _db;
    
    public LanguageRepository(AppDbContext db) => _db = db;
    
    public async Task<List<Language>> GetAvailableLanguagesAsync()
    {
        var supportedLanguages = new List<Language>
        {
            new() { Code = "en", Name = "English" },
            new() { Code = "ru", Name = "Русский" },
            new() { Code = "tr", Name = "Türkçe" }
        };
    
        var existingCodes = await _db.Languages
            .AsNoTracking()
            .Select(l => l.Code)
            .ToListAsync();
    
        return supportedLanguages
            .Where(lang => !existingCodes.Contains(lang.Code))
            .ToList();
    }
    
    public async Task<List<Language>> GetAllAsync() 
        => await _db.Languages.ToListAsync();

    public async Task<Language> AddAsync(Language language)
    {
        if (string.IsNullOrWhiteSpace(language.Code) || language.Code.Length != 2)
            throw new ArgumentException("Language code must be 2 characters (e.g., 'en', 'fr')");

        if (await _db.Languages.AnyAsync(l => l.Code == language.Code))
            throw new InvalidOperationException("Language already exists");

        await _db.Languages.AddAsync(language);
        await _db.SaveChangesAsync();
    
        return language;
    }
    
    public async Task DeleteAsync(int id)
    {
        var language = await _db.Languages.FindAsync(id);
        if (language == null)
        {
            throw new ArgumentException($"Language with ID {id} not found");
        }
        
        using var transaction = await _db.Database.BeginTransactionAsync();
    
        try
        {
            var translations = await _db.Translations
                .Where(t => t.LanguageId == id)
                .ToListAsync();
        
            _db.Translations.RemoveRange(translations);
            _db.Languages.Remove(language);
        
            await _db.SaveChangesAsync();
            await transaction.CommitAsync();
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<bool> ExistsAsync(string code)
        => await _db.Languages.AnyAsync(l => l.Code == code);
}