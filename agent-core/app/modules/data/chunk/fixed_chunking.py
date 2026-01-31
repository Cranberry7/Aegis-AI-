"""Module for fixed chunking."""

import json
import re
from typing import Any

from app.config import settings
from app.modules.data.models import DocMetadata
from app.utils.shlink import shorten_url

CHUNK_SIZE: int = settings.CHUNK_SIZE
CHUNK_OVERLAP: int = settings.CHUNK_OVERLAP


def chunk_markdown(  # noqa: PLR0913
    text: str,
    source: str,
    source_id: str,
    source_url: str,
    chunk_size: int = CHUNK_SIZE,
    overlap_size: int = CHUNK_OVERLAP,
):
    """Split a given markdown text into fixed-size chunks while preserving headers."""
    header_pattern = re.compile(r"^(#{1,})\s(.+)$", re.MULTILINE)
    lines = text.split("\n")
    chunks = []
    metadata: list[DocMetadata] = []

    current_chunk = ""
    # Stores headers for the current chunk
    current_headers: list[dict[str, Any]] = []

    short_url = shorten_url(source_url)

    for line in lines:
        line_stripped: str = line.strip()

        # Check if the line is a header or subheader
        header_match = header_pattern.match(line_stripped)

        if header_match:
            level, title = header_match.groups()

            # If current chunk is near max size
            # adding this header would exceed it, save the chunk
            if current_chunk and len(current_chunk) + len(line_stripped) > chunk_size:
                # Store the current chunk and its metadata
                chunks.append(current_chunk)
                metadata.append(
                    DocMetadata(
                        chunk_index=len(chunks) - 1,
                        headers=json.dumps(current_headers),
                        source=source,
                        source_id=source_id,
                        source_url=short_url,
                    )
                )

                # Create overlap for the next chunk
                # and reset headers, carry over the header
                current_chunk = current_chunk[-overlap_size:] + f"\n{line_stripped}"
                current_headers = [
                    {"level": len(level), "title": title, "full_text": line_stripped}
                ]

            else:
                # Otherwise, just add the header to the current chunk
                if current_chunk:
                    current_chunk += f"\n {line_stripped}"
                else:
                    current_chunk = line_stripped

                # Add header to metadata
                current_headers.append(
                    {"level": len(level), "title": title, "full_text": line_stripped}
                )

        # Add non-header line to the current chunk
        elif len(current_chunk) + len(line_stripped) <= chunk_size:
            if current_chunk:
                current_chunk += f"\n {line_stripped}"
            else:
                current_chunk = line_stripped

        else:
            # If adding this line exceeds chunk size, save the current chunk
            chunks.append(current_chunk)
            metadata.append(
                DocMetadata(
                    chunk_index=len(chunks) - 1,
                    headers=json.dumps(current_headers),
                    source=source,
                    source_id=source_id,
                    source_url=short_url,
                )
            )

            # Start new chunk with overlap
            current_chunk = current_chunk[-overlap_size:] + f"\n{line_stripped}"
            current_headers = current_headers[:]  # Carry over previous headers

    # Append any remaining chunk
    if current_chunk:
        chunks.append(current_chunk)
        metadata.append(
            DocMetadata(
                chunk_index=len(chunks) - 1,
                headers=json.dumps(current_headers),
                source=source,
                source_id=source_id,
                source_url=short_url,
            )
        )

    return chunks, metadata
