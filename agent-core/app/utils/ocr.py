"""OCR utilities."""

from mistralai import Mistral, OCRPageObject
from mistralai.extra import response_format_from_pydantic_model

from app.common.constants import ERROR_MESSAGES
from app.config import settings
from app.modules.training.training_types import (
    ExtractedImage,
)
from app.utils.exceptions import TrainingError
from app.utils.retry import retry_on_exception

MISTRAL_API_KEY = settings.MISTRAL_API_KEY

client = Mistral(api_key=MISTRAL_API_KEY)


def is_rate_limited(e) -> bool:
    """Identify if Exception is rate limited."""
    return hasattr(e, "type") and e.type == "rate_limited"


@retry_on_exception(retry_condition=is_rate_limited)
def ocr_read_image(
    pdf_base64_image: str,
    include_annotation: bool = False,
    include_images: bool = False,
) -> OCRPageObject:
    """Read a single image using OCR, retry if rate limited."""
    try:
        return client.ocr.process(
            model="mistral-ocr-latest",
            document={
                "type": "image_url",
                "image_url": f"data:image/jpeg;base64,{pdf_base64_image}",
            },
            bbox_annotation_format=(
                response_format_from_pydantic_model(ExtractedImage)
                if include_annotation
                else None
            ),
            include_image_base64=include_images,
        )
    except Exception as e:
        # Only retry on rate limited error
        if not is_rate_limited(e):
            raise TrainingError(ERROR_MESSAGES.OCR_FAILED) from e
