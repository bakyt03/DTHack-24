using HackTukeAPI.Services;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using System.Text.Json;

namespace HackTukeAPI.Controllers;

[ApiController]
[Route("api/openapi")]
public class OpenApiController(OpenApiService openApiService, UserService userService): Controller
{

    [HttpPost("upload")]
    [RequestFormLimits(MultipartBodyLengthLimit = 41943040)] // 40 MB max upload
    [RequestSizeLimit(41943040)]
    public async Task<IActionResult> UploadFile(
        [Required] int userID,
        [Required] IFormFile document,
        string? documentName,
        IFormFile? instructions,
        IFormFile? reference
    )
    {
        if (document.Length == 0)
        {
            return BadRequest("No document was uploaded.");
        }

        try
        {
            string[] allowedExtensions = { ".pdf", ".docx", ".doc", ".txt" };
            string fileExtension = Path.GetExtension(document.FileName).ToLowerInvariant();

            if (!allowedExtensions.Contains(fileExtension))
            {
                return BadRequest("Invalid file type. Allowed types are: " + string.Join(", ", allowedExtensions));
            }

            // upload init file to conversation
            (var response, var assistantId) = await openApiService.UploadFile(userID, documentName, document, instructions, reference);
            // remove GPTs JSON wrapper (```json ````)
            response = response?.Replace("```json", "").Replace("```", "").Trim();

            // deserialize data to be able to add assistantId
            var parsedResponse = JsonSerializer.Deserialize<dynamic>(response);
            var correctData = ((JsonElement)parsedResponse?.GetProperty("correctData"))
                .EnumerateArray()
                .Select(item => item.EnumerateObject().First())
                .ToDictionary(x => x.Name, x => x.Value.GetString());

            // insert correct data from document to database
            await userService.InsertUserDataAsync(userID, correctData);
            var result = new
            {
                response = parsedResponse,
                assistantId = assistantId,
            };

            // serialize data back with assistantId
            var returnable = JsonSerializer.Serialize<object>(result);
            return Ok(returnable);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPost("ask-question")]
    [RequestFormLimits(MultipartBodyLengthLimit = 41943040)] // 40 MB max upload
    [RequestSizeLimit(41943040)]
    public async Task<IActionResult> AskQuestion(int userID,
        string? documentName,
        string assistantID,
        string? userPrompt,
        IFormFile? document,
        IFormFile? instructions,
        IFormFile? reference
    )
    {
        try
        {

            if (document != null)
            {
                string[] allowedExtensions = { ".pdf", ".docx", ".doc", ".txt" };
                string fileExtension = Path.GetExtension(document.FileName).ToLowerInvariant();

                if (!allowedExtensions.Contains(fileExtension))
                {
                    return BadRequest("Invalid file type. Allowed types are: " + string.Join(", ", allowedExtensions));
                }
            }

            // ask in existing conversation
            (var response, var assistantId) = await openApiService.AskQuestion(documentName, assistantID, userPrompt, document, instructions, reference);
            // remove GPTs JSON wrapper (```json ````)
            response = response?.Replace("```json", "").Replace("```", "").Trim();
            var parsedResponse = JsonSerializer.Deserialize<dynamic>(response);

            // deserialize data to be able to add assistantId
            var correctData = ((JsonElement)parsedResponse.GetProperty("correctData"))
                .EnumerateArray()
                .Select(item => item.EnumerateObject().FirstOrDefault())
                .Where(x => x.Value.ValueKind != JsonValueKind.Null 
                            && !string.IsNullOrWhiteSpace(x.Value.GetString())) 
                .GroupBy(x => x.Name) 
                .Where(g => g.Count() == 1) 
                .Select(g => g.First()) 
                .ToDictionary(x => x.Name, x => x.Value.GetString());

            // insert correct data from document to database
            await userService.InsertUserDataAsync(userID, correctData);
            var result = new
            {
                response = parsedResponse,
                assistantId = assistantId,
            };

            // serialize data back with assistantId
            var returnable = JsonSerializer.Serialize<object>(result);
            return Ok(returnable);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

}
