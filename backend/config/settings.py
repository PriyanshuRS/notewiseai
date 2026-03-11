from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "PDF AI Study Assistant"
    APP_VERSION: str = "0.1.0"

    API_PREFIX: str = "/api"

    QDRANT_HOST: str = "localhost"
    QDRANT_PORT: int = 6333

    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"

    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "gemma3:4b"

    CHUNK_SIZE: int = 500
    CHUNK_OVERLAP: int = 80

    class Config:
        env_file = ".env"


settings = Settings()