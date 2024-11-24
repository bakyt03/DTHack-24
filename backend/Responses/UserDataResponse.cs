namespace HackTukeAPI.Responses;

public class UserDataResponse
{
    public int ID { get; set; }
    public int EntityID { get; set; }
    public int RecordID { get; set; }
    public string DataName { get; set; }
    public string DataValue { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
