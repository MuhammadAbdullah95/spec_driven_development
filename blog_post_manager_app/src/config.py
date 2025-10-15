"""Application configuration using pydantic-settings."""

from typing import List

from pydantic import Field, PostgresDsn, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Database Configuration
    database_url: PostgresDsn = Field(
        ...,
        description="PostgreSQL connection URL with asyncpg driver",
        examples=["postgresql+asyncpg://blog_user:blog_password@localhost:5432/blog_db"],
    )

    # JWT Authentication
    jwt_secret_key: str = Field(
        ...,
        description="Secret key for JWT token signing (use openssl rand -hex 32)",
        min_length=32,
    )
    jwt_algorithm: str = Field(default="HS256", description="JWT signing algorithm")
    access_token_expire_minutes: int = Field(
        default=15, description="Access token expiration time in minutes", ge=1
    )
    refresh_token_expire_days: int = Field(
        default=7, description="Refresh token expiration time in days", ge=1
    )

    # CORS Configuration
    cors_origins: str = Field(
        default="http://localhost:3000,http://localhost:8000",
        description="Comma-separated list of allowed CORS origins",
    )

    @property
    def cors_origins_list(self) -> List[str]:
        """Get CORS origins as a list."""
        if isinstance(self.cors_origins, str):
            return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]
        return self.cors_origins

    # Application Settings
    environment: str = Field(
        default="development",
        description="Application environment",
        pattern="^(development|staging|production)$",
    )
    log_level: str = Field(
        default="INFO",
        description="Logging level",
        pattern="^(DEBUG|INFO|WARNING|ERROR|CRITICAL)$",
    )
    api_v1_prefix: str = Field(default="/api/v1", description="API v1 route prefix")

    # Database Connection Pool
    db_pool_size: int = Field(
        default=10, description="Database connection pool size", ge=1, le=50
    )
    db_max_overflow: int = Field(
        default=20, description="Maximum overflow connections", ge=0, le=100
    )

    # Rate Limiting
    rate_limit_per_minute: int = Field(
        default=100, description="Maximum requests per minute per user", ge=1
    )

    # Server Configuration
    host: str = Field(default="0.0.0.0", description="Server host")
    port: int = Field(default=8000, description="Server port", ge=1, le=65535)
    reload: bool = Field(
        default=False, description="Enable auto-reload (development only)"
    )

    @property
    def database_url_str(self) -> str:
        """Return database URL as string."""
        return str(self.database_url)

    @property
    def is_production(self) -> bool:
        """Check if running in production environment."""
        return self.environment == "production"

    @property
    def is_development(self) -> bool:
        """Check if running in development environment."""
        return self.environment == "development"


# Global settings instance
settings = Settings()
