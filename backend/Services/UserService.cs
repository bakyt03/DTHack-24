using System.Data;
using Dapper;
using HackTukeAPI.Context;
using HackTukeAPI.Requests;
using HackTukeAPI.Responses;
using Microsoft.AspNetCore.Mvc;

namespace HackTukeAPI.Services;

public class UserService(DapperContext dapperContext)
{
    public async Task<UserResponse?> GetUserByIdAsync(int ID)
    {

        string sqlString =@"
SELECT ID, Firstname, Lastname, Email, Username, RegisteredAt, LastLogin
	FROM usr.Users
	WHERE ID = @id;";

        using IDbConnection connection = dapperContext.CreateConnection();
        UserResponse? user = await connection.QueryFirstOrDefaultAsync<UserResponse>(sqlString, new { ID });

        return user;
    }

    public async Task<(UserResponse? createdUser, string? errorMessage)> CreateUserAsync([FromForm] CreateUserRequest request)
    {
        DynamicParameters parameters = new DynamicParameters();
        parameters.Add("@Firstname", request.Firstname, DbType.String, ParameterDirection.Input, 128);
        parameters.Add("@Lastname", request.Lastname, DbType.String, ParameterDirection.Input, 128);
        parameters.Add("@Username", request.Username, DbType.String, ParameterDirection.Input, 128);
        parameters.Add("@Password", request.Password, DbType.String, ParameterDirection.Input, 128);
        parameters.Add("@Email", request.Email, DbType.String, ParameterDirection.Input, 255);
        parameters.Add("@result", dbType: DbType.String, direction: ParameterDirection.Output, size: int.MaxValue);
        parameters.Add("@userID", dbType: DbType.Int32, direction: ParameterDirection.Output);

        var sqlString = @"
DECLARE @registeredAt DATETIME = GETDATE()
BEGIN TRY
    IF EXISTS(
        SELECT 1
        FROM usr.Users
        WHERE Username = @username)
    BEGIN
        RAISERROR (N'User ""%s"" already exists on database!',
            16,
            1,
            @username
        )
    END

    INSERT INTO usr.Users(
        Firstname, Lastname, Username, [Password], Email, RegisteredAt
    )
    VALUES(
        @firstname, @lastname, @username, @password, @email, @registeredAt
    )
    
    SET @userID = SCOPE_IDENTITY()
    SET @result = 'OK'
END TRY
BEGIN CATCH
    SET @result = ERROR_MESSAGE()
END CATCH";

        using IDbConnection connection = dapperContext.CreateConnection();
        await connection.ExecuteAsync(sqlString, parameters);

        string result = parameters.Get<string>("@result");
        if (result != "OK")
            return (null, result);

        int userID = parameters.Get<int>("@userID");
        UserResponse? createdUser = await GetUserByIdAsync(userID);

        return (createdUser, null);
    }

    public async Task<(UserResponse? user, string? errorMessage)> LoginUserAsync([FromForm] LoginUserRequest request)
    {
        DynamicParameters parameters = new DynamicParameters();
        parameters.Add("@Username", request.Username, DbType.String, ParameterDirection.Input, 128);
        parameters.Add("@Password", request.Password, DbType.String, ParameterDirection.Input, 128);
        parameters.Add("@result", dbType: DbType.String, direction: ParameterDirection.Output, size: int.MaxValue);
        parameters.Add("@userID", dbType: DbType.Int32, direction: ParameterDirection.Output);

        var sqlString = @"
BEGIN TRY
    DECLARE @lastLogin DATETIME = GETDATE()
    
    IF NOT EXISTS(
        SELECT 1
        FROM usr.Users
        WHERE Username = @Username AND Password = @Password)
    BEGIN
        RAISERROR (N'Invalid username or password!', 16, 1)
    END

    UPDATE usr.Users
    SET LastLogin = @lastLogin
    WHERE Username = @Username AND Password = @Password

    SELECT @userID = ID
    FROM usr.Users
    WHERE Username = @Username AND Password = @Password

    SET @result = 'OK'
END TRY
BEGIN CATCH
    SET @result = ERROR_MESSAGE()
END CATCH";

        using IDbConnection connection = dapperContext.CreateConnection();
        await connection.ExecuteAsync(sqlString, parameters);

        string result = parameters.Get<string>("@result");
        if (result != "OK")
            return (null, result);

        int userID = parameters.Get<int>("@userID");
        UserResponse? user = await GetUserByIdAsync(userID);
        return (user, null);
    }

    public async Task<List<UserDataResponse>> GetUserDataAsync(int id)
    {
        var sqlString = @"
DECLARE @userEntID INT = (SELECT ID FROM [dbo].Entities WHERE Entity = 'User')

SELECT [ID]
        ,[EntityID]
        ,[RecordID]
        ,[DataName]
        ,[DataValue]
        ,[CreatedAt]
        ,[UpdatedAt]
FROM [DataValidation].[data].[Data]
WHERE EntityID = @userEntID
AND RecordID = @userID";

        using (var connection = dapperContext.CreateConnection())
        {
            var result = await connection.QueryAsync<UserDataResponse>(sqlString, new { userID = id });
            return result.ToList();
        }
    }

    public async Task<Dictionary<string, string>> GetRecommendationsAsync(int userId)
    {
        var data = await GetUserDataAsync(userId);

        var recommendations = new Dictionary<string, string>();

        foreach (var item in data)
        {
            recommendations.Add(item.DataName, item.DataValue);
        }

        return recommendations;
    }

    public async Task<string> InsertUserDataAsync(int userID, Dictionary<string, string> dataList)
    {
        var sqlString = @"
BEGIN TRY
    DECLARE @userEntID INT = (SELECT ID FROM dbo.Entities WHERE Entity = 'User')
    DECLARE @createdAt datetime = GETDATE()

    IF NOT EXISTS(
        SELECT 1
        FROM [data].[Data]
        WHERE RecordID = @userID 
            AND EntityID = @userEntID
            AND DataName = @dataName
            AND UserChanged = 1
    )
        BEGIN
             IF EXISTS(
                SELECT 1
                FROM [data].[Data]
                WHERE RecordID = @userID 
                    AND EntityID = @userEntID
                    AND DataName = @dataName)
                BEGIN
                    UPDATE [data].[Data]
                    SET DataValue = @dataValue,
                        UpdatedAt = @createdAt
                    WHERE RecordID = @userID 
                        AND EntityID = @userEntID
                        AND DataName = @dataName
                END
            ELSE
                BEGIN
                    INSERT INTO [data].[Data] (EntityID, RecordID, DataName, DataValue, CreatedAt)
                    VALUES (@userEntID, @userID, @dataName, @dataValue, @createdAt)
                END
        END

    SET @result = 'OK'
    SELECT @result AS Result
END TRY
BEGIN CATCH
    SET @result = ERROR_MESSAGE()
END CATCH";

        using var connection = dapperContext.CreateConnection();

        try
        {
            foreach (var keyValue in dataList)
            {
                var parameters = new DynamicParameters();
                parameters.Add("@userID", userID, DbType.Int32, ParameterDirection.Input);
                parameters.Add("@dataName", keyValue.Key, DbType.String, ParameterDirection.Input, 255);
                parameters.Add("@dataValue", keyValue.Value, DbType.String, ParameterDirection.Input, -1);
                parameters.Add("@result", dbType: DbType.String, direction: ParameterDirection.Output, size: int.MaxValue);

                await connection.ExecuteAsync(sqlString, parameters);

                string result = parameters.Get<string>("@result");
                if (result != "OK")
                    return result;
            }

            return "OK";
        }
        catch (Exception ex)
        {
            return ex.Message;
        }
    }

    public async Task<string> UpdateData(int dataID, string? value)
    {
        DynamicParameters parameters = new DynamicParameters();
        parameters.Add("@dataID", dataID, DbType.Int32, ParameterDirection.Input);
        parameters.Add("@value", value, DbType.String, ParameterDirection.Input, 128);
        parameters.Add("@result", dbType: DbType.String, direction: ParameterDirection.Output, size: int.MaxValue);

        var sqlString = @"
BEGIN TRY
    IF NOT EXISTS(
        SELECT 1
        FROM [data].[Data]
        WHERE ID = @dataID)
    BEGIN
        RAISERROR (N'Data with ID: %d does not exist!', 16, 1, @dataID)
    END

    UPDATE [data].[Data]
        SET DataValue = @value,
            UserChanged = 1
        WHERE ID = @dataID

    SET @result = 'OK'
END TRY
BEGIN CATCH
    SET @result = ERROR_MESSAGE()
END CATCH";

        using IDbConnection connection = dapperContext.CreateConnection();
        await connection.ExecuteAsync(sqlString, parameters);

        string result = parameters.Get<string>("@result");
        return result;
    }

    public async Task<string> DeleteData(int dataID)
    {
        DynamicParameters parameters = new DynamicParameters();
        parameters.Add("@dataID", dataID, DbType.Int32, ParameterDirection.Input);
        parameters.Add("@result", dbType: DbType.String, direction: ParameterDirection.Output, size: int.MaxValue);

        var sqlString = @"
BEGIN TRY
    IF NOT EXISTS(
        SELECT 1
        FROM [data].[Data]
        WHERE ID = @dataID)
    BEGIN
        RAISERROR (N'Data with ID: %d does not exist!', 16, 1, @dataID)
    END

    DELETE FROM [data].[Data]
        WHERE ID = @dataID

    SET @result = 'OK'
END TRY
BEGIN CATCH
    SET @result = ERROR_MESSAGE()
END CATCH";

        using IDbConnection connection = dapperContext.CreateConnection();
        await connection.ExecuteAsync(sqlString, parameters);

        string result = parameters.Get<string>("@result");
        return result;

    }

}
