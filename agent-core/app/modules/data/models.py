"""Training DB Dataclasses."""

from dataclasses import dataclass


@dataclass
class DocMetadata:
    """Metadata Object for Web Docs."""

    chunk_index: int
    headers: str
    source: str
    source_id: str
    source_url: str
