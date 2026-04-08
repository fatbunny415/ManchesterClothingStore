# -----------------------
# ETAPA 1: BUILD
# -----------------------
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copiar csproj con la ruta REAL
COPY Backend/ManchesterClothingStore.API/ManchesterClothingStore.API.csproj ./Backend/ManchesterClothingStore.API/

# Restaurar dependencias
RUN dotnet restore ./Backend/ManchesterClothingStore.API/ManchesterClothingStore.API.csproj

# Copiar todo el código
COPY . .

# Publicar
RUN dotnet publish ./Backend/ManchesterClothingStore.API/ManchesterClothingStore.API.csproj -c Release -o /app/publish

# -----------------------
# ETAPA 2: RUNTIME
# -----------------------
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

# SSL
RUN apt-get update && apt-get install -y ca-certificates && update-ca-certificates

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "ManchesterClothingStore.API.dll"]