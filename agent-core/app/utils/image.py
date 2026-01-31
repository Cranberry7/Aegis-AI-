"""Image Utils."""

import base64
import hashlib
import io
from io import BytesIO

from pdf2image import convert_from_path
from PIL import Image

from app.utils.logger import logger
from app.utils.s3 import store_media_to_s3

MAX_PX = 1000  # size in px of largest side
MAX_IMAGE_SIZE = 1024 * 100  # 100KB
IMAGE_QUALITY_CHANGE = 5  # unit for changing image quality


def pdf_to_base64(pdf_path):
    """Pdf pages to base64 images."""
    try:
        logger.debug("Converting Pdf pages to images.")
        images = convert_from_path(pdf_path)
        if images:
            image_base64 = []
            for image in images:
                # Get original dimensions
                width, height = image.size
                # Calculate new dimensions maintaining aspect ratio with max side 1000px
                if width > height:
                    new_width = MAX_PX
                    new_height = int((height / width) * MAX_PX)
                else:
                    new_height = MAX_PX
                    new_width = int((width / height) * MAX_PX)
                # Resize image maintaining aspect ratio
                resized_image = image.resize(
                    (new_width, new_height), Image.Resampling.LANCZOS
                )
                # Convert to base64
                buffered = BytesIO()
                resized_image.save(buffered, format="PNG")
                img_str = base64.b64encode(buffered.getvalue()).decode()
                image_base64.append(img_str)
            return image_base64
    except Exception as e:
        logger.error(f"Error converting pdf to base64 images: {e}")
        return []
    else:
        return []


# TODO: Not used since it only supports JPEG for now.
def compress_base64_image(base64_string, max_size=MAX_IMAGE_SIZE):
    """Compresses a base64 encoded image to be below specified max size in bytes."""
    try:
        logger.debug("Compressing image...")
        if base64_string.startswith("data:"):
            base64_string = base64_string.split("base64,")[1]

        # Decode base64
        image_bytes = base64.b64decode(base64_string)
        # Load image
        image = Image.open(io.BytesIO(image_bytes))

        quality = 95
        compressed_base64_string = base64_string

        while (
            len(compressed_base64_string) > max_size and quality > IMAGE_QUALITY_CHANGE
        ):
            output_buffer = io.BytesIO()

            image.save(output_buffer, format="JPEG", quality=quality)
            compressed_image_bytes = output_buffer.getvalue()
            compressed_base64_string = base64.b64encode(compressed_image_bytes).decode(
                "utf-8"
            )
            quality -= IMAGE_QUALITY_CHANGE

    except Exception as e:
        logger.error(f"Error compressing image: {e}")
        return base64_string
    else:
        return compressed_base64_string


def save_base64_image(base64_image: str, location: str, image_name: str) -> str:
    """Save base64 image."""
    image_name = image_name.replace(" ", "_")
    image_bytes = base64.b64decode(compress_base64_image(base64_image))

    return store_media_to_s3(image_bytes, f"{location}/{image_name}")


def generate_image_hash(base64_image: str):
    """Generate image hash from base64."""
    if base64_image.startswith("data:"):
        base64_image = base64_image.split("base64,")[1]
    image_bytes = base64.b64decode(base64_image)

    hasher = hashlib.new("md5")
    hasher.update(image_bytes)

    return hasher.hexdigest()
