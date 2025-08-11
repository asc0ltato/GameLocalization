FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["backend/GameLocalization.Api/GameLocalization.Api.csproj", "backend/GameLocalization.Api/"]
COPY ["backend/GameLocalization.Core/GameLocalization.Core.csproj", "backend/GameLocalization.Core/"]
COPY ["backend/GameLocalization.Infrastructure/GameLocalization.Infrastructure.csproj", "backend/GameLocalization.Infrastructure/"]
COPY ["backend/GameLocalization.Modules.Languages/GameLocalization.Modules.Languages.csproj", "backend/GameLocalization.Modules.Languages/"]
COPY ["backend/GameLocalization.Modules.Localization/GameLocalization.Modules.Localization.csproj", "backend/GameLocalization.Modules.Localization/"]
RUN dotnet restore "backend/GameLocalization.Api/GameLocalization.Api.csproj"
COPY . .
WORKDIR "/src/backend/GameLocalization.Api"
RUN dotnet build "./GameLocalization.Api.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./GameLocalization.Api.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM build AS migrate
WORKDIR "/src/backend/GameLocalization.Infrastructure"
RUN dotnet tool install --global dotnet-ef
ENV PATH="$PATH:/root/.dotnet/tools"
RUN dotnet ef database update --project ../GameLocalization.Infrastructure/GameLocalization.Infrastructure.csproj --startup-project ../GameLocalization.Api/GameLocalization.Api.csproj

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "GameLocalization.Api.dll"]
