using HackTukeAPI.Context;
using HackTukeAPI.Services;
using OpenAI;
using OpenAI.Chat;

var builder = WebApplication.CreateBuilder(args);

// addding cors policies
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()    
            .AllowAnyHeader() 
            .AllowAnyMethod(); 
    });
});

// Add services to the container.
builder.Services.AddSingleton<DapperContext>();
builder.Services.AddSingleton(provider =>
{
    var configuration = provider.GetRequiredService<IConfiguration>();
    var apiKey = configuration["OpenAPI:ApiKey"];
    return new OpenAIClient(apiKey: apiKey);
});

builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<OpenApiService>();

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// require swagger all the time (for frontend testing)
app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();

// use cors
app.UseCors();

app.UseAuthorization();

app.MapControllers();

app.Run();
