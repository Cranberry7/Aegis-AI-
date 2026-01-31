"""S3 utilities."""

import os
from io import BytesIO

import boto3
import requests
from fastapi import UploadFile

from app.config import settings
from app.modules.training.training_types import FileTrainingMetadata

AWS_S3_BUCKET_NAME = settings.AWS_S3_BUCKET_NAME
AWS_REGION = settings.AWS_REGION
AWS_ACCESS_KEY_ID = settings.AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY = settings.AWS_SECRET_ACCESS_KEY

s3_client = boto3.resource(
    "s3",
    region_name=AWS_REGION,
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
)


def get_s3_url(data: FileTrainingMetadata) -> str:
    """Get a S3 URL."""
    file_name: str = data.file_name or ""
    return f"https://s3.{AWS_REGION}.amazonaws.com/{AWS_S3_BUCKET_NAME}/{data.folder}/{data.source_id}/{file_name}"


def fetch_file_from_s3(data: FileTrainingMetadata) -> tuple[UploadFile, str]:
    """Fetch file from S3."""
    file_name: str = data.original_name or ""
    file_url = get_s3_url(data)
    response = requests.get(file_url)
    file_stream = BytesIO(response.content)
    return UploadFile(filename=file_name, file=file_stream), file_url


def store_media_to_s3(file: bytes, file_path: str) -> str:
    """Store media to S3."""
    obj = s3_client.Object(AWS_S3_BUCKET_NAME, file_path)
    obj.put(Body=file)
    metadata = FileTrainingMetadata(
        folder=os.path.dirname(file_path).rsplit("/", 1)[0],
        source_id=os.path.dirname(file_path).rsplit("/", 1)[1],
        original_name=os.path.basename(file_path),
        file_name=os.path.basename(file_path),
        size=len(file),
        mimetype=(
            "application/pdf"
            if file_path.endswith(".pdf")
            else "application/octet-stream"
        ),
    )

    return get_s3_url(metadata)
