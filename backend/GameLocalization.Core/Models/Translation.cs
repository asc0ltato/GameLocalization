using System.Text.Json.Serialization;

namespace GameLocalization.Core.Models;

public class Translation
{
    public int Id { get; set; }
    public string Value { get; set; }
    
    public int LanguageId { get; set; }
    public Language Language { get; set; }
    
    public int TranslationKeyId { get; set; }
    public TranslationKey TranslationKey { get; set; }
}