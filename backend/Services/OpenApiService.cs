using HackTukeAPI.Services.Settings;
using OpenAI;
using OpenAI.Assistants;
using OpenAI.Files;
using System.ClientModel;
using System.Text;
using System.Text.Encodings.Web;
using System.Text.Json;

namespace HackTukeAPI.Services;

// suspends problems with Assistant (OpenAI.NET only problem 🥲🥲🥲)
#pragma warning disable OPENAI001

public class OpenApiService(OpenAIClient _client, IConfiguration _config, UserService _userService)
{
    public async Task<(string? response, string ID)> UploadFile(
        int userID,
        string? documentName,
        IFormFile documentFile,
        IFormFile? instructionsFile,
        IFormFile? referenceFile
    )
    {
        // process files
        var fileStream = documentFile.OpenReadStream();

        using var streamReader = new StreamReader(fileStream);

        OpenAIFileClient fileClient = _client.GetOpenAIFileClient();

        var fileIds = new List<string>();

        var documentOpenAiFile = (await fileClient.UploadFileAsync(
            fileStream, documentFile.FileName, FileUploadPurpose.Assistants)).Value;
        fileIds.Add(documentOpenAiFile.Id);

        if (instructionsFile != null)
        {
            var instructionsOpenAiFile = (await fileClient.UploadFileAsync(
                               instructionsFile.OpenReadStream(), instructionsFile.FileName, FileUploadPurpose.Assistants)).Value;
            fileIds.Add(instructionsOpenAiFile.Id);
        }

        if (referenceFile != null)
        {
            var referenceOpenAiFile = (await fileClient.UploadFileAsync(
                referenceFile.OpenReadStream(), referenceFile.FileName, FileUploadPurpose.Assistants)).Value;
            fileIds.Add(referenceOpenAiFile.Id);
        }

        // getting assistentclient and generating new assistant options
        AssistantClient assistantClient = _client.GetAssistantClient();
        AssistantCreationOptions assistantOptions = new()
        {
            
            Name = AssistantDefaultOptions.Name,
            Temperature = AssistantDefaultOptions.Temperature,
            Instructions = AssistantDefaultOptions.Instructions,
            Tools =
            {
                new FileSearchToolDefinition(),
                new CodeInterpreterToolDefinition(),
            },
            ToolResources = new()
            {
                FileSearch = new()
                {
                    NewVectorStores =
                    {
                        new VectorStoreCreationHelper(fileIds),
                    }
                }
            },
        };

        // creating assistant
        Assistant assistant = await assistantClient.CreateAssistantAsync("gpt-4o", assistantOptions);
        
        // creating prompts
        StringBuilder promptBuilder = new();
        if (instructionsFile == null) {
            promptBuilder.AppendLine("The instructions are sadly not provided to you, try to search for them on the internet, if you won't be able to find any, please let me know and I'll try to find them myself after");
        }
        else
        {
            promptBuilder.AppendLine("The instructions for the document correctness and completion are provided to you, please, read through them carefully and use them for the analysis of the document");
        }

        if (referenceFile != null)
        {
            promptBuilder.AppendLine($"A reference document has been provided to you, use this document instead of the previous reference document FileName: {referenceFile.FileName}");
        }

        if (documentName == null) {
            promptBuilder.AppendLine("The document name is NOT provided to you, you will have to scan the first page and try to find the name yourself. You're smart, I'm sure you can easily complete this task!");
        }
        else
        {
            promptBuilder.AppendLine($"The document name is provided to you, please use: {documentName} as document name");
        }
        promptBuilder.AppendLine("Based on what you know about the structure, you need to fill it in this manner:\r\n\r\n- Please, scan through the documents multiple times and then check the rest\r\n- If you don't find document name on the first page or it is not provided to you, count that as error in \"error\", set it as true and tell me about it in \"errorResponse\"\r\n- If you don't find any instructions or it is not provided to you, count that as error in \"error\", set it as true and tell me about it in \"errorResponse\"\r\n- If you have everything you need, scan through the document and analyze it using the instructions, check everything that could be wrong, for example if you have field \"Rodné číslo\" that is mandatory and must be exactly 10 digits, if it is not 10 digits or it is not filled, count that as mistake and report it in \"mistakes\"\r\n- Everything that is against the rules of the instructions document is considered as a mistake and should be reported in \"mistakes\"\r\n- If you are at any point unsure about something in the document, please report it in \"notSureAbout\" don't be shy, if you are unsure, tell me about it or ask me questions in that field\r\n- If you don't find any mistakes, please consider the document as \"100%\" complete and write that result in \"completeness\" field\r\n- If you find some mistakes, please compare the amount of mistakes to the rules and calculate the completion percentage and report it in \"completeness\"");

        // adding recommendations if needed
        var recommendations = await _userService.GetRecommendationsAsync(userID);
        if (recommendations.Count > 0)
        {
            // serialize with encoding
            var jsonRecommendations = JsonSerializer.Serialize(recommendations, new JsonSerializerOptions { Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping, WriteIndented = true });
            promptBuilder.AppendLine($"Recommendations: {jsonRecommendations}");
        }

        // adding prompt for the client
        ThreadCreationOptions threadOptions = new()
        {
            InitialMessages = { promptBuilder.ToString() }
        };

        ThreadRun threadRun = await assistantClient.CreateThreadAndRunAsync(assistant.Id, threadOptions);
        
        // run the client
        do
        {
            Thread.Sleep(TimeSpan.FromSeconds(1));
            threadRun = await assistantClient.GetRunAsync(threadRun.ThreadId, threadRun.Id);
        } while (!threadRun.Status.IsTerminal);

        // collect and process messages
        CollectionResult<ThreadMessage> messages
            = assistantClient.GetMessages(threadRun.ThreadId, new MessageCollectionOptions() { Order = MessageCollectionOrder.Ascending });

        string response = string.Empty;

        foreach (ThreadMessage message in messages)
        {
            Console.Write($"[{message.Role.ToString().ToUpper()}]: ");
            foreach (MessageContent contentItem in message.Content)
            {

                if (string.IsNullOrEmpty(contentItem.Text))
                    Console.WriteLine();

                if (message.Role == MessageRole.Assistant)
                {
                    response += contentItem.Text;
                }
                Console.WriteLine($"{contentItem.Text}");

                if (contentItem.TextAnnotations.Count > 0)
                {
                    Console.WriteLine();
                }

            }

            Console.WriteLine();
        }

        Console.WriteLine(assistant.Id);
        return (response, assistant.Id);
    }

    public async Task<(string? response, string ID)> AskQuestion(
        string? documentName,
        string assistantID,
        string? userPrompt,
        IFormFile? documentFile,
        IFormFile? instructionsFile,
        IFormFile? referenceFile
    )
    {

        OpenAIFileClient fileClient = _client.GetOpenAIFileClient();

        List<string> files = [];

        if (documentFile != null)
        {
            var documentOpenAiFile = (await fileClient.UploadFileAsync(
                documentFile.OpenReadStream(), documentFile.FileName, FileUploadPurpose.Assistants)).Value;
            files.Add(documentOpenAiFile.Id);
        }


        if (instructionsFile != null)
        {
            var instructionsOpenAiFile = (await fileClient.UploadFileAsync(
                instructionsFile?.OpenReadStream(), instructionsFile?.FileName, FileUploadPurpose.Assistants)).Value;
            files.Add(instructionsOpenAiFile.Id);
        }

        if (referenceFile != null)
        {
            var referenceOpenAiFile = (await fileClient.UploadFileAsync(
                referenceFile?.OpenReadStream(), referenceFile?.FileName, FileUploadPurpose.Assistants)).Value;
            files.Add(referenceOpenAiFile.Id);
        }

        AssistantClient assistantClient = _client.GetAssistantClient();
        Assistant assistant = await assistantClient.GetAssistantAsync(assistantID);

        // If there is a document or instructions file, create a new vector store with given data
        if (documentFile is not null || instructionsFile is not null)
        {
            var newVectorStoreId = await CreateVectorStore(files.ToArray());
            await ModifyAssistantWithVectorStore(assistantID, newVectorStoreId);
        }

        StringBuilder promptBuilder = new();
        if (instructionsFile != null) {
            promptBuilder.AppendLine("New instruction document has been provided to you");
        }

        if (referenceFile != null)
        {
            promptBuilder.AppendLine($"New reference document has been provided to you, use this document instead of the previous reference document FileName: {referenceFile.FileName}");
        }

        if (documentFile != null)
        {
            promptBuilder.AppendLine($"New document has been provided to you, use this document instead of the previous document FileName: {documentFile.FileName}");
        }

        if (documentName != null)
        {
            promptBuilder.AppendLine(
                $"New document name has been provided to you: {documentName}");
        }

        promptBuilder.AppendLine(userPrompt);

        ThreadCreationOptions threadOptions = new()
        {
            InitialMessages = { promptBuilder.ToString() }
        };

        ThreadRun threadRun = await assistantClient.CreateThreadAndRunAsync(assistant.Id, threadOptions);

        do
        {
            Thread.Sleep(TimeSpan.FromSeconds(1));
            threadRun = await assistantClient.GetRunAsync(threadRun.ThreadId, threadRun.Id);
        } while (!threadRun.Status.IsTerminal);

        CollectionResult<ThreadMessage> messages
            = assistantClient.GetMessages(threadRun.ThreadId, new MessageCollectionOptions() { Order = MessageCollectionOrder.Ascending });

        string response = null;

        foreach (ThreadMessage message in messages)
        {
            Console.Write($"[{message.Role.ToString().ToUpper()}]: ");
            foreach (MessageContent contentItem in message.Content)
            {

                if (string.IsNullOrEmpty(contentItem.Text))
                    Console.WriteLine();

                if (message.Role == MessageRole.Assistant)
                {
                    response += contentItem.Text;
                }
                Console.WriteLine($"{contentItem.Text}");

                if (contentItem.TextAnnotations.Count > 0)
                {
                    Console.WriteLine();
                }

            }

            Console.WriteLine();
        }

        Console.WriteLine(assistant.Id);
        return (response, assistant.Id);

    }

    public async Task<string> CreateVectorStore(string[] fileIds, string? name = null)
    {
        using var client = new HttpClient();
        client.DefaultRequestHeaders.Add("Authorization", $"Bearer {_config["OpenAPI:ApiKey"]}");
        client.DefaultRequestHeaders.Add("OpenAI-Beta", "assistants=v2");

        var requestBody = new
        {
            file_ids = fileIds,
            name = name
        };

        var content = new StringContent(
            JsonSerializer.Serialize(requestBody, new JsonSerializerOptions 
            { 
                DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull 
            }),
            Encoding.UTF8,
            "application/json"
        );

        var response = await client.PostAsync(
            "https://api.openai.com/v1/vector_stores",
            content
        );

        response.EnsureSuccessStatusCode();
        var responseString = await response.Content.ReadAsStringAsync();
        var responseJson = JsonSerializer.Deserialize<JsonElement>(responseString);
        return responseJson.GetProperty("id").GetString()!;
    }
    
    public async Task<string> ModifyAssistantWithVectorStore(string assistantId, string vectorStoreId)
    {
        using var client = new HttpClient();
        client.DefaultRequestHeaders.Add("Authorization", $"Bearer {_config["OpenAPI:ApiKey"]}");
        client.DefaultRequestHeaders.Add("OpenAI-Beta", "assistants=v2");

        var requestBody = new
        {
            tools = new[] { new { type = "file_search" } },
            tool_resources = new
            {
                file_search = new
                {
                    vector_store_ids = new[] { vectorStoreId }
                }
            }
        };

        var content = new StringContent(
            JsonSerializer.Serialize(requestBody),
            Encoding.UTF8,
            "application/json"
        );

        var response = await client.PostAsync(
            $"https://api.openai.com/v1/assistants/{assistantId}",
            content
        );

        response.EnsureSuccessStatusCode();
        return await response.Content.ReadAsStringAsync();
    }

}
