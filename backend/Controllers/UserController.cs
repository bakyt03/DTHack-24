using HackTukeAPI.Requests;
using HackTukeAPI.Responses;
using HackTukeAPI.Services;
using Microsoft.AspNetCore.Mvc;

namespace HackTukeAPI.Controllers;

[ApiController]
[Route("api/users")]
public class UserController(UserService userService) : Controller
{
    [HttpGet("{id:int}")]
    public async Task<ActionResult<UserResponse>> GetById(int id)
    {
        var user = await userService.GetUserByIdAsync(id);
        if (user is null)
            return NotFound();

        return Ok(user);
    }

    [HttpPost("register")]
    public async Task<ActionResult<UserResponse>> CreateUser(CreateUserRequest request)
    {
        var (createdUser, errorMessage) = await userService.CreateUserAsync(request);
        if (createdUser is null)
            return Problem(errorMessage);

        return CreatedAtAction("GetById", new { id = createdUser.ID }, createdUser);
    }

    [HttpPost("login")]
    public async Task<ActionResult<UserResponse>> LoginUser(LoginUserRequest request)
    {
        var (user, errorMessage) = await userService.LoginUserAsync(request);
        if (user is null)
            return Problem(errorMessage);

        return Ok(user);
    }

    [HttpGet("user-data")]
    public async Task<ActionResult<UserDataResponse>> GetUserData(int id)
    {
        var userData = await userService.GetUserDataAsync(id);
        return Ok(userData);
    }

    [HttpPost("user-data")]
    public async Task<ActionResult<UserDataResponse>> InsertUserData(int userID, Dictionary<string, string> dataList)
    {
        var userData = await userService.InsertUserDataAsync(userID, dataList);
        return Ok(userData);
    }

    [HttpPut("user-data")]
    public async Task<ActionResult<UserDataResponse>> UpdataUserData(int dataID, string? value)
    {
        var userData = await userService.UpdateData(dataID, value);
        return Ok(userData);
    }

    [HttpDelete("user-data")]
    public async Task<ActionResult<UserDataResponse>> DeleteUserData(int dataID)
    {
        var userData = await userService.DeleteData(dataID);
        return Ok(userData);
    }

}

