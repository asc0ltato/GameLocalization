using GameLocalization.Core.Interfaces;
using GameLocalization.Core.Models;
using Microsoft.AspNetCore.Mvc;
namespace GameLocalization.Api.Controllers;

[ApiController]
[Route("api/languages")]
public class LanguagesController : ControllerBase
{
    private readonly ILanguageRepository _repo;
    
    public LanguagesController(ILanguageRepository repo) => _repo = repo;

    [HttpGet("available")]
    public async Task<IActionResult> GetAvailable()
    {
        try
        {
            var languages = await _repo.GetAvailableLanguagesAsync();
            return Ok(languages);
        }
        catch (Exception ex)
        {
            return StatusCode(500, "Internal server error");
        }
    }
    
    [HttpGet]
    public async Task<IActionResult> GetAll() 
        => Ok(await _repo.GetAllAsync());

    [HttpPost]
    public async Task<IActionResult> Add([FromBody] AddLanguageRequest request) 
    {
        if (string.IsNullOrWhiteSpace(request?.Code))
            return BadRequest("Language code is required");

        if (await _repo.ExistsAsync(request.Code))
            return Conflict("Language already exists");

        await _repo.AddAsync(new Language { 
            Code = request.Code,
            Name = request.Name
        });
        return Ok();
    }

    public class AddLanguageRequest
    {
        public string Code { get; set; }
        public string Name { get; set; }
    }
    
    
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        try 
        {
            await _repo.DeleteAsync(id);
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new {
                message = "Failed to delete language",
                error = ex.Message
            });
        }
    }
}