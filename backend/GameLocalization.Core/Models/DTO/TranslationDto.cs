namespace GameLocalization.Core.Models.DTO;

public class TranslationDto
{
    public int Id { get; set; }
    public string Value { get; set; }
    public int LanguageId { get; set; }
    public string LanguageCode { get; set; }
    public string LanguageName { get; set; }
}