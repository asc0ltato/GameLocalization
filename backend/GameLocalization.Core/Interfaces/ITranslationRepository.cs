using GameLocalization.Core.Models;
using GameLocalization.Core.Models.DTO;

namespace GameLocalization.Core.Interfaces;

public interface ITranslationRepository
{
    Task<TableDataDto> GetTableDataAsync(int page, int pageSize);
    Task<List<Language>> GetSupportedLanguagesAsync();
    
    Task<TranslationKey> AddKeyAsync(TranslationKey key);
    Task<List<TranslationKey>> GetPagedKeysAsync(int page, int pageSize);
    Task<int> GetKeysCountAsync();
    
    Task<Language> AddLanguageAsync(Language language);
    
    Task UpdateTranslationAsync(int keyId, int languageId, string value);
    
    Task DeleteKeyAsync(int id);
    Task<List<Translation>> GetTranslationsForKeyAsync(int keyId);
    Task<TranslationKey?> FindKeyAsync(string keyName);
}