using GameLocalization.Core.Interfaces;
using GameLocalization.Core.Models;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;
using GameLocalization.Core.Models.DTO;

namespace GameLocalization.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class TranslationsController : ControllerBase
{
    private readonly ITranslationRepository _translationRepo;
    private readonly ILanguageRepository _languageRepo;
    
    public TranslationsController(
        ITranslationRepository translationRepo,
        ILanguageRepository languageRepo)
    {
        _translationRepo = translationRepo;
        _languageRepo = languageRepo;
    }
    
    [HttpGet("table")]
    [ProducesResponseType(typeof(TableDataDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTableData(
        [FromQuery] int page = 1, 
        [FromQuery] int pageSize = 10)
    {
        try
        {
            var data = await _translationRepo.GetTableDataAsync(page, pageSize);
            return Ok(data);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new {
                message = "Internal server error",
                details = ex.Message
            });
        }
    }

    [HttpPost("keys")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> AddKey([FromBody] KeyRequest request)
    {
        if (string.IsNullOrWhiteSpace(request?.Key))
        {
            return BadRequest(new ProblemDetails {
                Title = "Validation Error",
                Detail = "Key is required",
                Status = StatusCodes.Status400BadRequest
            });
        }

        if (!Regex.IsMatch(request.Key, @"^ui_[a-zA-Z]+$"))
        {
            return BadRequest(new ProblemDetails {
                Title = "Validation Error",
                Detail = "Key must be in format 'section.key' (lowercase with dot)",
                Status = StatusCodes.Status400BadRequest
            });
        }

        if (await _translationRepo.FindKeyAsync(request.Key) != null)
        {
            return BadRequest(new ProblemDetails {
                Title = "Duplicate Key",
                Detail = "Key already exists",
                Status = StatusCodes.Status400BadRequest
            });
        }

        var newKey = new TranslationKey { Key = request.Key.Trim() };
        var createdKey = await _translationRepo.AddKeyAsync(newKey);
        return Ok(createdKey);
    }

    [HttpPut("{keyId:int}/{languageId:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpdateTranslation(
        [FromRoute] int keyId,
        [FromRoute] int languageId,
        [FromBody] UpdateTranslationRequest request)
    {
        await _translationRepo.UpdateTranslationAsync(keyId, languageId, request.Value);
        return Ok();
    }

    [HttpPost("languages")]
    [ProducesResponseType(typeof(Language), StatusCodes.Status200OK)] 
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> AddLanguage([FromBody] Language language)
    {
        if (string.IsNullOrWhiteSpace(language.Code) || language.Code.Length != 2)
        {
            return BadRequest(new ProblemDetails {
                Title = "Invalid Language Code",
                Detail = "Language code must be 2 characters (e.g., 'en', 'fr')",
                Status = StatusCodes.Status400BadRequest
            });
        }

        if (await _languageRepo.ExistsAsync(language.Code))
        {
            return BadRequest(new ProblemDetails {
                Title = "Duplicate Language",
                Detail = "This language already exists",
                Status = StatusCodes.Status400BadRequest
            });
        }

        var addedLanguage = await _languageRepo.AddAsync(language);
        return Ok(addedLanguage);
    }

    [HttpGet("languages/available")]
    [ProducesResponseType(typeof(IEnumerable<Language>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAvailableLanguages()
    {
        var languages = await _translationRepo.GetSupportedLanguagesAsync();
        return Ok(languages);
    }

    [HttpDelete("keys/{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteKey([FromRoute] int id)
    {
        try
        {
            await _translationRepo.DeleteKeyAsync(id);
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new {
                message = "Internal server error",
                details = ex.Message
            });
        }
    }
    
    public class KeyRequest
    {
        [Required]
        public string Key { get; set; }
    }
    
    public class UpdateTranslationRequest
    {
        [Required]
        public string Value { get; set; }
    }
}