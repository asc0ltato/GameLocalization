using System.Text.Json.Serialization;
using GameLocalization.Core.Interfaces;
using GameLocalization.Infrastructure.Data;
using GameLocalization.Modules.Languages;
using GameLocalization.Modules.Localization;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:3000",    
                "http://frontend:3000"     
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials()
            .SetPreflightMaxAge(TimeSpan.FromMinutes(10));
    });
});
builder.Services.AddControllers()
    .AddJsonOptions(options => {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddScoped<ILanguageRepository, LanguageRepository>();
builder.Services.AddScoped<ITranslationRepository, TranslationRepository>();

var app = builder.Build();

app.Use(async (context, next) => {
    Console.WriteLine($"Request: {context.Request.Method} {context.Request.Path}");
    await next();
});

try
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}
catch (Exception ex)
{
    var logger = app.Logger;
    logger.LogError(ex, "Migration failed!");
}

app.UseCors("ReactFrontend");

app.UseSwagger();
app.UseSwaggerUI();

app.UseAuthorization();
app.MapControllers();

app.Run();