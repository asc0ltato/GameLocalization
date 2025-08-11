namespace GameLocalization.Core.Models.DTO;

public class TableDataDto
{
    public List<TranslationKey> Keys { get; set; } = new();
    public List<Language> Languages { get; set; } = new();
    
    public int TotalCount { get; set; }
    public int CurrentPage { get; set; }
}