"""Modified Milvus VectorDB Class."""

import asyncio
from time import time
from typing import Any

from agno.document import Document
from agno.vectordb.milvus import Milvus
from onnxruntime import InferenceSession
from pydantic import BaseModel
from transformers import AutoTokenizer

from app.config import settings
from app.utils.json_utils import json_dumps, json_loads
from app.utils.logger import logger

KB_SEARCH_LIMIT: int = settings.KB_SEARCH_LIMIT
MODEL_NAME = settings.RERANKER_MODEL
ONNX_PATH = settings.RERANKER_ONNX_PATH


class RerankResult(BaseModel):
    """Rerank result."""

    index: int
    score: float
    document: Any


class ModMilvus(Milvus):
    """Modified Milvus VectorDB Client."""

    def __init__(self, rerank_docs: int = 5, **kwargs):
        """Mod milvus vector database."""
        super().__init__(**kwargs)
        self.rerank_docs: int = rerank_docs
        self.tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
        self.session = InferenceSession(ONNX_PATH)

    def find(self, expr: str = "", output_fields: list[str] | None = None):
        """Find documents in the database."""
        if self.client:
            return self.client.query(
                collection_name=self.collection,
                filter=expr,
                output_fields=output_fields,
            )
        return []

    def bulk_delete(
        self,
        ids: list | str | int | None = None,
        filter_expr: str | None = None,
    ) -> int:
        """Delete documents from the database using Ids."""
        if self.client:
            response = self.client.delete(
                collection_name=self.collection, ids=ids, filter=filter_expr
            )
            return response["delete_count"]
        return 0

    def bulk_insert(self, documents: list[dict[str, Any]]) -> int:
        """Insert documents into the database."""
        logger.info(f"Inserting {len(documents)} documents")

        response = self.client.insert(
            collection_name=self.collection,
            data=documents,
        )

        return response["insert_count"]

    def rerank(self, query: str, documents: list) -> list[RerankResult]:
        """Rerank documents using the reranker."""
        if not documents:
            logger.warning("No documents provided")
            return []

        docs_to_score = documents[: self.rerank_docs]

        inputs = [f"{query} [SEP] {doc}" for doc in docs_to_score]
        tokenized = self.tokenizer(
            inputs, padding=True, truncation=True, return_tensors="np"
        )

        ort_inputs = dict(tokenized.items())
        logits = self.session.run(None, ort_inputs)[0].squeeze(-1)

        results = [
            RerankResult(index=i, score=float(score), document=docs_to_score[i])
            for i, score in enumerate(logits)
        ]

        # Sort descending by score
        results.sort(key=lambda x: x.score, reverse=True)
        return results

    async def basic_search(
        self, query: str, limit: int = 3, filters: dict[str, Any] | None = None
    ) -> list[Document]:
        """Search using vectors.

        This method is used to search the knowledge base for the given query.
        query must be present, limit should always be an integer or
        should not be provided when calling this method.
        """
        logger.debug(f"[{self.collection}] Basic search invoked {query=}")
        query_embedding = self.embedder.get_embedding(query)
        if query_embedding is None:
            logger.error(f"Error getting embedding for Query: {query}")
            return []

        results = await self.async_client.search(
            collection_name=self.collection,
            data=[query_embedding],
            filter=self._build_expr(filters),
            output_fields=["id", "keywords", "content", "meta_data"],
            limit=limit,
        )

        # Build search results
        search_results: list[Document] = [
            Document(
                id=result["id"],
                name=result["entity"].get("name", None),
                meta_data=result["entity"].get("meta_data", {}),
                content=result["entity"].get("content", ""),
                usage=result["entity"].get("usage", None),
            )
            for result in results[0]
        ]

        return search_results

    async def async_search(
        self,
        query: str,
        user_id: str | None = None,
        filters: dict[str, Any] | None = None,
    ) -> list[Document]:
        """Search synchronously method for agent compatibility.

        This method is used to search the knowledge base for the given query.
        query must be present. The `filters` parameter is for advanced use and
        should be ignored. Do not provide the `filters` parameter when you call
        this tool. An additional process of re-ranking the results is also done.
        """
        logger.debug(
            f"[{self.collection}] Asynchronous search wrapper invoked {query=}"
        )

        # Get embeddings and search
        query_embedding = await asyncio.to_thread(self.embedder.get_embedding, query)
        if query_embedding is None:
            logger.error(f"Error getting embedding for Query: {query}")
            return []

        # 2) Raw Milvus search
        start_time = time()
        results = await self.async_client.search(
            collection_name=self.collection,
            data=[query_embedding],
            filter=self._build_expr(filters),
            output_fields=["id", "keywords", "content", "meta_data"],
            limit=KB_SEARCH_LIMIT,
        )
        logger.debug(f"Searched vector db in {time() - start_time} seconds")

        # 3) Rerank
        start_time = time()
        raw_entities = [json_dumps(res["entity"]) for res in results[0]]
        reranked = await asyncio.to_thread(self.rerank, query, raw_entities)
        reranked = [json_loads(r.document) for r in reranked]  # type: ignore
        logger.debug("Re-ranked results in %.3fs", time() - start_time)

        # 4) Build Document objects
        search_results: list[Document] = [
            Document(
                id=record["id"],
                name=record.get("name"),
                meta_data=record.get("meta_data", {}),
                content=record.get("content", ""),
                usage=record.get("usage"),
            )
            for record in reranked
        ]

        logger.debug(f"[{user_id}] Returning final response")
        return search_results or []
