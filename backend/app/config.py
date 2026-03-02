"""Application configuration from environment variables."""
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"  # Ignore extra env vars (e.g. DB_USER, GRAFANA_PASSWORD)
    )

    # Database
    database_url: str = "sqlite:///./test.db"
    db_pool_size: int = 10
    db_max_overflow: int = 20

    # Security
    jwt_secret_key: str = "dev-secret-key-please-change-in-production-min-32-chars"
    jwt_algorithm: str = "HS256"
    jwt_expiration_seconds: int = 3600

    # Argon2
    argon2_time_cost: int = 2
    argon2_memory_cost: int = 65536
    argon2_parallelism: int = 4

    # CORS
    frontend_url: str = "http://localhost:5500"
    allowed_origins: str = "http://localhost:5500,http://127.0.0.1:5500"

    # File Upload
    upload_dir: str = "./uploads"
    max_file_size_mb: int = 10

    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = False

    # Rate Limiting
    rate_limit_enabled: bool = True

    # Password Policy
    password_min_length: int = 8
    password_require_uppercase: bool = True
    password_require_number: bool = True
    password_require_special: bool = True

    # Logging
    log_level: str = "INFO"
    log_format: str = "json"  # "json" or "text"

    # Admin seeding
    admin_username: str = "admin"
    admin_password: str = "Admin@CyberSec2026!"

    @property
    def allowed_origins_list(self) -> List[str]:
        """Parse comma-separated allowed origins into a list."""
        return [origin.strip() for origin in self.allowed_origins.split(",")]

    @property
    def max_file_size_bytes(self) -> int:
        """Convert MB to bytes."""
        return self.max_file_size_mb * 1024 * 1024

    def validate_jwt_secret(self):
        """Validate JWT secret key is not a placeholder."""
        if "your" in self.jwt_secret_key.lower() or len(self.jwt_secret_key) < 32:
            import warnings
            warnings.warn(
                "JWT_SECRET_KEY appears to be a placeholder or is too short (min 32 chars). "
                "Generate a secure key with: python -c \"import secrets; print(secrets.token_urlsafe(32))\"",
                UserWarning,
                stacklevel=2
            )


settings = Settings()
settings.validate_jwt_secret()
