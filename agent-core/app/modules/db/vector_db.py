"""Training VectorDB Module."""

from app.common.enums import KnowledgeType, SupportedTrainingExtensions
from app.modules.core.knowledge_bases import text_knowledge_base, video_knowledge_base
from app.modules.data.embeddings import generate_embedding
from app.modules.data.models import DocMetadata
from app.modules.db.mod_milvus import ModMilvus
from app.utils.logger import logger


def insert_chunks(
    documents: list[dict],
    knowledge_type: KnowledgeType = KnowledgeType.TEXT,
):
    """Insert a processed chunks into VectorDB."""
    try:
        knowledge_collection: dict[KnowledgeType, ModMilvus] = {
            KnowledgeType.TEXT: text_knowledge_base.vector_db,
            KnowledgeType.MEDIA: video_knowledge_base.vector_db,
        }

        collection: ModMilvus = knowledge_collection[knowledge_type]

        if collection:
            insert_count: int = collection.bulk_insert(documents)

        logger.info(f"Inserted {insert_count} documents successfully.")
    except Exception as e:
        logger.error(f"Error inserting chunk: {e}")


def add_chunks_to_vector_db(
    chunked_texts: list[str],
    metadatas: list[DocMetadata] | list[dict],
    file_type: SupportedTrainingExtensions,
    file_name: str,
    knowledge_type: KnowledgeType,
):
    """Add chunks in vector db. For chunks whose header level is present."""
    # Get embeddings for all chunks
    embeddings: list[list[float]] = generate_embedding(chunked_texts)

    insert_chunks(
        [
            {
                "vector": embedding,
                "meta_data": metadata.__dict__,
                "content": chunked_text,
            }
            for embedding, chunked_text, metadata in zip(
                embeddings, chunked_texts, metadatas, strict=False
            )
        ],
        knowledge_type,
    )
    logger.info(f"Successfully added '{file_name} | {file_type.value}' to vector DB")


def remove_knowledge(source_id: str) -> None:
    """Remove knowledge from the VectorDB for given source_id."""
    text_collection: ModMilvus = text_knowledge_base.vector_db
    text_deleted_count: int = text_collection.bulk_delete(
        filter_expr=f'meta_data["source_id"] == "{source_id}"'
    )

    logger.info(f"Knowledge Deleted [Text], Total - {text_deleted_count}")

    video_collection: ModMilvus = video_knowledge_base.vector_db
    video_deleted_count: int = video_collection.bulk_delete(
        filter_expr=f'meta_data["source_id"] == "{source_id}"'
    )

    logger.info(f"Knowledge Deleted [Video], Total - {video_deleted_count}")
