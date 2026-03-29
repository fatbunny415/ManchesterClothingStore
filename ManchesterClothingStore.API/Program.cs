using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

using ManchesterClothingStore.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

// Controllers
builder.Services.AddControllers();

// Swagger + JWT (Authorize en Swagger)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Ingrese el token así: Bearer {tu_token}"
    });

    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Services
builder.Services.AddHttpClient<ManchesterClothingStore.Application.Interfaces.IRecaptchaService, ManchesterClothingStore.Infrastructure.Services.RecaptchaService>();

// DbContext MongoDB
var mongoConnectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? "mongodb://localhost:27017";
var mongoDatabase = builder.Configuration["MongoDbSettings:DatabaseName"] ?? "ManchesterClothingDb";
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMongoDB(mongoConnectionString, mongoDatabase)
);

// JWT
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var key = builder.Configuration["Jwt:Key"]!;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),

            // Recomendado para evitar problemas por reloj (opcional)
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

// Se ejecuta el seed de la base de datos
DbInitializer.Initialize(app.Services);

// Swagger solo en Development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// ✅ Evita el warning: solo redirigir a HTTPS fuera de Development
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

// Auth antes de Authorization
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();