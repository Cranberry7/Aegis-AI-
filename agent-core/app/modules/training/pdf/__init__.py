"""PDF training module."""

import json
from collections.abc import Generator
from typing import override

from mistralai import OCRPageObject, OCRResponse

from app.common.enums import SupportedTrainingExtensions
from app.config import settings
from app.modules.training.markdown import MarkdownTrain
from app.modules.training.training_types import StoredImageObject, StoredImages
from app.modules.training.utils import get_batches
from app.utils.image import generate_image_hash, pdf_to_base64, save_base64_image
from app.utils.logger import logger
from app.utils.ocr import ocr_read_image
from app.utils.shlink import shorten_url

TRAINING_BATCH_SIZE: int = settings.TRAINING_BATCH_SIZE


class PDFTrain(MarkdownTrain):
    """PDF training runner."""

    def __init__(  # noqa: PLR0913
        self,
        user_id: str,
        account_id: str,
        source_id: str,
        source_name: str,
        source_content: str,
        source_url: str,
        send_complete_event: bool = True,
    ):
        """PDF training runner constructor."""
        super().__init__(
            user_id,
            account_id,
            source_id,
            source_name,
            source_content,  # This is not used for PDF
            source_url,
            send_complete_event,
        )

        self.source_type = SupportedTrainingExtensions.PDF

    def replace_images_in_markdown(
        self, markdown_str: str, images_dict: StoredImages
    ) -> str:
        """Replace image placeholders in markdown with base64-encoded images."""
        for img_name, img_value in images_dict.items():
            markdown_str = markdown_str.replace(
                f"![{img_name}]({img_name})",
                f"![{img_value.annotation}]({img_value.path})",
            )
        return markdown_str

    def add_images_in_markdown(self, ocr_page: OCRPageObject, pdf_name: str) -> str:
        """Combine OCR text and images into markdown documents."""
        # Extract images from page
        image_data: StoredImages = {}
        for img in ocr_page.images:
            # Convert base64 to image and save
            image_hash = generate_image_hash(img.image_base64)

            image_url = save_base64_image(
                img.image_base64,
                f"{self.account_id}/{self.user_id}/{self.source_id}",
                f"image_{image_hash}.jpeg",  # OCR always returns jpeg images
            )
            short_url = shorten_url(image_url)

            try:
                # Store image path instead of base64
                image_data[img.id] = StoredImageObject(
                    path=short_url,
                    annotation=json.loads(img.image_annotation).get("description"),
                )
            except (json.JSONDecodeError, AttributeError, TypeError) as e:
                logger.error(f"Invalid annotation for {short_url}: {e}")
                image_data[img.id] = StoredImageObject(path=short_url, annotation="")

        # Replace image placeholders with actual images
        return self.replace_images_in_markdown(ocr_page.markdown, image_data)

    def ocr_read_pages(
        self, pdf_base64_images: list[str], batch_number: int, pdf_name: str
    ) -> list[str]:
        """Read pdf using ocr with images."""
        markdown_pages: list[str] = []

        for i, pdf_base64_image in enumerate(pdf_base64_images):
            ocr_result: OCRResponse = ocr_read_image(
                pdf_base64_image, include_annotation=True, include_images=True
            )
            ocr_result.pages[0].index = (batch_number * 10) + (
                i + 1
            )  # Set page index as page number

            # Add images to markdown
            markdown_page = self.add_images_in_markdown(ocr_result.pages[0], pdf_name)
            markdown_pages.append(markdown_page)

        return markdown_pages

    @override
    def get_content_in_markdown(self) -> Generator:
        # Get pdf pages as base64 images
        pdf_base64_images = pdf_to_base64(self.source_url)
        logger.info(f"Batching total pdf pages - {len(pdf_base64_images)}")

        for batch_number, pdf_base64_images_batch in enumerate(
            get_batches(pdf_base64_images)
        ):
            logger.info(f"Processing Pdf batch - {batch_number}")

            pdf_name = self.source_name.split(".pdf")[0].replace(" ", "_")
            markdown_content: list[str] = self.ocr_read_pages(
                pdf_base64_images_batch, batch_number, pdf_name
            )
            yield "#### Page no: " + "\n---\n#### Page no: ".join(
                f"{(batch_number * TRAINING_BATCH_SIZE) + (i + 1)}\n{content}"
                for i, content in enumerate(markdown_content)
            )
