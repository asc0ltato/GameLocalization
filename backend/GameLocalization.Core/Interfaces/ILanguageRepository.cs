namespace GameLocalization.Core.Interfaces;
using Models;

public interface ILanguageRepository
{
    Task<List<Language>> GetAllAsync();
    Task<List<Language>> GetAvailableLanguagesAsync();
    Task<Language> AddAsync(Language language); 
    Task DeleteAsync(int id);
    Task<bool> ExistsAsync(string code);
}