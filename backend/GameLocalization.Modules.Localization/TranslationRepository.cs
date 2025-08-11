using GameLocalization.Core.Interfaces;
using GameLocalization.Core.Models;
using GameLocalization.Core.Models.DTO;
using GameLocalization.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace GameLocalization.Modules.Localization;

public class TranslationRepository : ITranslationRepository
{
    private readonly AppDbContext _db;
    
    public TranslationRepository(AppDbContext db) => _db = db;

    public async Task<TableDataDto> GetTableDataAsync(int page, int pageSize)
    {
        var query = _db.TranslationKeys
            .AsNoTracking()
            .Include(k => k.Translations)
            .ThenInclude(t => t.Language)
            .OrderBy(k => k.Id);

        var keys = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(k => new 
            {
                k.Id,
                k.Key,
                Translations = k.Translations.Select(t => new TranslationDto
                {
                    Id = t.Id,
                    Value = t.Value,
                    LanguageId = t.LanguageId,
                    LanguageCode = t.Language.Code,
                    LanguageName = t.Language.Name
                }).ToList()
            })
            .ToListAsync();

        var languages = await _db.Languages.AsNoTracking().ToListAsync();
        var totalCount = await query.CountAsync();
        
        var resultKeys = keys.Select(k => new TranslationKey
        {
            Id = k.Id,
            Key = k.Key,
            Translations = k.Translations.Select(t => new Translation
            {
                Id = t.Id,
                Value = t.Value,
                LanguageId = t.LanguageId,
                Language = new Language
                {
                    Id = t.LanguageId,
                    Code = t.LanguageCode,
                    Name = t.LanguageName
                }
            }).ToList()
        }).ToList();

        return new TableDataDto
        {
            Keys = resultKeys,
            Languages = languages,
            TotalCount = totalCount,
            CurrentPage = page
        };
    }

    public async Task<List<TranslationKey>> GetPagedKeysAsync(int page, int pageSize)
    {
        return await _db.TranslationKeys
            .AsNoTracking()
            .Include(k => k.Translations)
            .ThenInclude(t => t.Language)
            .OrderBy(k => k.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }
    
    public async Task<int> GetKeysCountAsync()
    {
        return await _db.TranslationKeys.CountAsync();
    }

    public async Task<List<Language>> GetSupportedLanguagesAsync()
    {
        return await _db.Languages
            .AsNoTracking()
            .ToListAsync();
    }
    
    public async Task<Language> AddLanguageAsync(Language language)
    {
        await _db.Languages.AddAsync(language);
        await _db.SaveChangesAsync();
        return language;
    }
    
    public async Task<TranslationKey> AddKeyAsync(TranslationKey key)
    {
        await _db.TranslationKeys.AddAsync(key);
        await _db.SaveChangesAsync();
        return key;
    }

    public async Task UpdateTranslationAsync(int keyId, int languageId, string value)
    {
        var translation = await _db.Translations
            .FirstOrDefaultAsync(t => t.TranslationKeyId == keyId && t.LanguageId == languageId);

        if (translation == null)
        {
            translation = new Translation
            {
                TranslationKeyId = keyId,
                LanguageId = languageId,
                Value = value
            };
            await _db.Translations.AddAsync(translation);
        }
        else
        {
            translation.Value = value;
            _db.Translations.Update(translation);
        }

        await _db.SaveChangesAsync();
    }

    public async Task DeleteKeyAsync(int id)
    {
        var key = await _db.TranslationKeys
            .Include(k => k.Translations)
            .FirstOrDefaultAsync(k => k.Id == id);
        
        if (key == null)
        {
            throw new KeyNotFoundException($"Key with id {id} not found");
        }
        
        _db.Translations.RemoveRange(key.Translations);
        _db.TranslationKeys.Remove(key);
        await _db.SaveChangesAsync();
    }
    
    public async Task<List<Translation>> GetTranslationsForKeyAsync(int keyId)
        => await _db.Translations
            .Where(t => t.TranslationKeyId == keyId)
            .Include(t => t.Language)
            .ToListAsync();

    public async Task<TranslationKey?> FindKeyAsync(string keyName)
        => await _db.TranslationKeys
            .FirstOrDefaultAsync(k => k.Key == keyName);
}