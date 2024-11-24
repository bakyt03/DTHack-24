namespace HackTukeAPI.Responses;

public class UserResponse
{
    public int ID { get; set; }
    public string Firstname { get; set; }
    public string Lastname { get; set; }
    public string Email { get; set; }
    public string Username { get; set; }
    public DateTime RegisteredAt { get; set; }
    public DateTime LastLogin { get; set; }
}

