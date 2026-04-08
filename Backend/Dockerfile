FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copiar archivos de proyecto y restaurar (optimizado para cacheo de capas)
COPY ["ManchesterClothingStore.API/ManchesterClothingStore.API.csproj", "ManchesterClothingStore.API/"]
COPY ["ManchesterClothingStore.Application/ManchesterClothingStore.Application.csproj", "ManchesterClothingStore.Application/"]
COPY ["ManchesterClothingStore.Domain/ManchesterClothingStore.Domain.csproj", "ManchesterClothingStore.Domain/"]
COPY ["ManchesterClothingStore.Infrastructure/ManchesterClothingStore.Infrastructure.csproj", "ManchesterClothingStore.Infrastructure/"]
RUN dotnet restore "ManchesterClothingStore.API/ManchesterClothingStore.API.csproj"

# Copiar código fuente
COPY . .
WORKDIR "/src/ManchesterClothingStore.API"
RUN dotnet build "ManchesterClothingStore.API.csproj" -c Release -o /app/build

# Publicar ejecutables
FROM build AS publish
RUN dotnet publish "ManchesterClothingStore.API.csproj" -c Release -o /app/publish

# Imagen limpia de solo ejecución (sin SDK, minimiza tamaño y riesgos)
FROM mcr.microsoft.com/dotnet/aspnet:9.0-alpine AS runtime
WORKDIR /app
COPY --from=publish /app/publish .

# Previene el error Status 139 (SegFault) en la capa Free de Render (512mb RAM)
ENV DOTNET_gcServer=0
ENV DOTNET_EnableDiagnostics=0

# Configurar puertos para Render (Render busca el puerto 8080 u otros dinámicos)
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "ManchesterClothingStore.API.dll"]
