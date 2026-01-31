"""Application Config and settings."""

from pathlib import Path
from typing import ClassVar, Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class AppSettings(BaseSettings):
    """Application Settings."""

    env_file: ClassVar = Path(__file__).parent.parent.parent / ".env"
    model_config = SettingsConfigDict(env_file=env_file, env_file_encoding="utf-8")

    # Application
    ENVIRONMENT: Literal["PROD", "DEV"] = "DEV"
    AGENT_CORE_PORT: int = 9001
    BACKEND_URL: str = "http://localhost:7082/agent-backend"
    CORS_ORIGINS: str
    NUM_WORKERS: int = 4

    # S3 Creds
    AWS_REGION: str
    AWS_S3_BUCKET_NAME: str
    AWS_ACCESS_KEY_ID: str
    AWS_SECRET_ACCESS_KEY: str

    # Celery
    CELERY_BROKER: str

    # Redis (Streaming)
    REDIS_HOST: str
    REDIS_PORT: int = 6379
    REDIS_MEMORY_DB: int = 1
    # Maximum number of retries for publishing messages
    REDIS_PUBLISH_MAX_RETRIES: int = 5

    # LLM, agents
    LLM_API_KEY: str
    LLM_MODEL_NAME: str
    ENABLE_VIDEO_SEARCH: bool

    # RabbitMQ (Events)
    RABBITMQ_URL: str
    PREFETCH_COUNT: int = 5

    # VectorDB (Knowledge Base)
    TEXT_COLLECTION_NAME: str = "text_docs"
    VIDEO_COLLECTION_NAME: str = "videos"
    EMBEDDING_MODEL: str = "gemini-embedding-exp-03-07"
    KB_SEARCH_LIMIT: int = 20
    TEXT_KNOWLEDGE_N_DOCS: int = 25
    VIDEO_KNOWLEDGE_N_DOCS: int = 20

    RERANKER_MODEL: str = "cross-encoder/ms-marco-MiniLM-L-4-v2"
    RERANK_DOCS_LIMIT: int = 10
    RERANKER_ONNX_PATH: str = "./models/minilm-l4-crossencoder.quant.onnx"

    ## Config
    VECTOR_DIMENSIONS: int = 1536
    VECTOR_DB_URI: str
    VECTOR_DB_TOKEN: str

    # Training
    TRAINING_BATCH_SIZE: int = 10
    CHUNK_SIZE: int = 1500
    CHUNK_OVERLAP: int = 300

    # Logging
    JSON_LOGS: bool = False
    DEBUG_LOGS: bool = False

    # Mistral OCR
    MISTRAL_API_KEY: str

    # Langfuse
    LANGFUSE_PUBLIC_KEY: str = ""
    LANGFUSE_SECRET_KEY: str = ""
    LANGFUSE_HOST: str = "https://cloud.langfuse.com/api/public/otel"

    # Tracing
    ENABLE_TRACING: bool = True

    # Shlink
    SHLINK_API_KEY: str
    SHLINK_BASE_URL: str

    # Rate Limit
    GLOBAL_RATE_LIMIT_COUNT: int = 60
    GLOBAL_RATE_LIMIT_UNIT: str = "minute"

    CHAT_RATE_LIMIT_COUNT: int = 30
    CHAT_RATE_LIMIT_UNIT: str = "minute"


settings = AppSettings()
