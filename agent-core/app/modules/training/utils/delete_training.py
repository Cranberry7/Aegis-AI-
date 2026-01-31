"""Delete training data from the knowledge base."""

from app.modules.db.vector_db import remove_knowledge
from app.modules.training.training_types import DeleteKnowledgeEvent
from app.utils.logger import logger


async def delete_training_data(event: DeleteKnowledgeEvent):
    """Delete training data from the database."""
    remove_knowledge(event.data.document_id)
    logger.info(f"Deleted training data for {event.data.document_id}")
