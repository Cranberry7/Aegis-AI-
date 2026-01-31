"""Knowledge Bases for Agents."""

from agno.embedder.google import GeminiEmbedder
from agno.knowledge.agent import AgentKnowledge

from app.config import settings
from app.modules.db.mod_milvus import ModMilvus
from app.utils.logger import logger

EMBEDDING_MODEL: str = settings.EMBEDDING_MODEL
VECTOR_DIMENSIONS: int = settings.VECTOR_DIMENSIONS
TEXT_COLLECTION_NAME: str = settings.TEXT_COLLECTION_NAME
VIDEO_COLLECTION_NAME: str = settings.VIDEO_COLLECTION_NAME
VECTOR_DB_URI: str = settings.VECTOR_DB_URI
VECTOR_DB_TOKEN: str = settings.VECTOR_DB_TOKEN
LLM_API_KEY: str = settings.LLM_API_KEY
RERANK_DOCS_LIMIT: int = settings.RERANK_DOCS_LIMIT
TEXT_KNOWLEDGE_N_DOCS: int = settings.TEXT_KNOWLEDGE_N_DOCS
VIDEO_KNOWLEDGE_N_DOCS: int = settings.VIDEO_KNOWLEDGE_N_DOCS

embedding_model = GeminiEmbedder(
    api_key=LLM_API_KEY,
    id=EMBEDDING_MODEL,
    dimensions=VECTOR_DIMENSIONS,
)


# VectorDB / Knowledge Base Client for Text based Agent
text_knowledge_base = AgentKnowledge(
    num_documents=TEXT_KNOWLEDGE_N_DOCS,
    vector_db=ModMilvus(
        uri=VECTOR_DB_URI,
        token=VECTOR_DB_TOKEN,
        collection=TEXT_COLLECTION_NAME,
        embedder=embedding_model,
        rerank_docs=RERANK_DOCS_LIMIT,
    ),
)

logger.debug(
    f"[Agent] Text Knowledge Base {text_knowledge_base.vector_db.collection} is ready."
)


video_knowledge_base = AgentKnowledge(
    num_documents=VIDEO_KNOWLEDGE_N_DOCS,
    vector_db=ModMilvus(
        uri=VECTOR_DB_URI,
        token=VECTOR_DB_TOKEN,
        collection=VIDEO_COLLECTION_NAME,
        embedder=embedding_model,
        rerank_docs=RERANK_DOCS_LIMIT,
    ),
)

logger.debug(
    f"[Agent] Video Knowledge Base {video_knowledge_base.vector_db.collection} is ready."  # noqa: E501
)
