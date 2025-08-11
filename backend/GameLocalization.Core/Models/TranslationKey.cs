namespace GameLocalization.Core.Models;

public class TranslationKey
{
    public int Id { get; set; }
    public string Key { get; set; }
    public List<Translation> Translations { get; set; } = new();
}