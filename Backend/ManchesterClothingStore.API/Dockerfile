# -----------------------
# ETAPA 1: BUILD
# -----------------------
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app

# Copiar todo el proyecto
COPY . .

# Restaurar dependencias
RUN dotnet restore

# Publicar aplicación
RUN dotnet publish ./Backend/ManchesterClothingStore.API/ManchesterClothingStore.API.csproj

# -----------------------
# ETAPA 2: RUNTIME
# -----------------------
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

# 🔥 IMPORTANTE: instalar certificados SSL (SOLUCIONA error MongoDB)
RUN apt-get update && apt-get install -y ca-certificates && update-ca-certificates

# Copiar build desde la etapa anterior
COPY --from=build /app/publish .

# Configuración para Render
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

# Optimización opcional
ENV DOTNET_gcServer=0
ENV DOTNET_EnableDiagnostics=0

# Ejecutar app
ENTRYPOINT ["dotnet", "ManchesterClothingStore.API.dll"]