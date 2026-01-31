"""Embedding Module."""

from app.config import settings
from app.modules.core.knowledge_bases import embedding_model
from app.utils.logger import logger

EMBEDDING_MODEL = settings.EMBEDDING_MODEL


def generate_embedding(texts: str | list[str]) -> list[list[float]]:
    """Get embedding vector from OpenAI."""
    try:
        # NOTE: Workaround to get the embedding vector from Gemini for list of strings.
        if isinstance(texts, str):
            texts = [texts]

        embs = embedding_model.client.models.embed_content(
            contents=texts,
            model=EMBEDDING_MODEL,
            config={"output_dimensionality": embedding_model.dimensions},
        ).embeddings
        return [emb.values for emb in embs]

    except Exception as e:
        logger.error(f"Error getting embedding: {e}")
        return [[0.0] * embedding_model.dimensions]
