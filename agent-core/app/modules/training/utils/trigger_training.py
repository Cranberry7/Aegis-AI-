"""Trigger training for a given resource."""

from app.common.constants import READABLE_EXTENSIONS, VIDEO_EXTENSIONS
from app.common.enums import (
    EventActionType,
    SupportedTrainingExtensions,
    TrainingEventActions,
    TrainingResourceType,
)
from app.modules.bg_process import celery_app
from app.modules.db.vector_db import remove_knowledge
from app.modules.training import Train
from app.modules.training.markdown import MarkdownTrain
from app.modules.training.pdf import PDFTrain
from app.modules.training.scraper import URLTrain
from app.modules.training.sitemap import SitemapTrain
from app.modules.training.training_types import (
    EventMetadata,
    TrainingContent,
    TrainingDataObject,
)
from app.modules.training.utils.send_events import complete_training_event_sync
from app.modules.training.video import VideoTrain
from app.utils.logger import logger
from app.utils.s3 import fetch_file_from_s3


def route_by_training_file_type(
    file_extension: SupportedTrainingExtensions,
) -> type[Train] | None:
    """Route the training event by file extension type."""
    match file_extension:
        case SupportedTrainingExtensions.MARKDOWN | SupportedTrainingExtensions.TEXT:
            logger.info(f"{file_extension.value} trainer runner running")
            return MarkdownTrain

        case SupportedTrainingExtensions.PDF:
            logger.info("PDF trainer runner running")
            return PDFTrain

        case extension if extension in VIDEO_EXTENSIONS:
            logger.info("Video trainer runner running")
            return VideoTrain

        case _:
            logger.error(f"Extension '{file_extension}' not supported.")
            return None


@celery_app.task(name="run_file_training_task")
def run_file_training_task(  # noqa: PLR0913
    user_id: str,
    account_id: str,
    source_id: str,
    source_name: str,
    source_type: SupportedTrainingExtensions,
    source_content: str | bytes,
    source_url: str,
) -> None:
    """Run file-based training in background."""
    try:
        trainer_class: type[Train] | None = route_by_training_file_type(
            SupportedTrainingExtensions(source_type)
        )
        if not trainer_class:
            raise ValueError(f"Unsupported source type: {source_type}")  # noqa: TRY301

        trainer: Train = trainer_class(
            user_id=user_id,
            account_id=account_id,
            source_id=source_id,
            source_name=source_name,  # type: ignore[call-arg]
            source_content=source_content,  # type: ignore[call-arg]
            source_url=source_url,
        )
        trainer.run()
    except Exception as e:
        logger.exception(f"Unable to complete training task (File) - {e}")
        complete_training_event_sync(
            user_id,
            account_id,
            source_id,
            EventActionType.FAILED,
        )


@celery_app.task(name="run_url_training_task")
def run_url_training_task(
    user_id: str, account_id: str, source_id: str, url: str, is_media: bool
) -> None:
    """Run URL-based training in background."""
    try:
        if is_media:
            video_trainer = VideoTrain(
                user_id=user_id,
                account_id=account_id,
                source_id=source_id,
                source_content=url,
                source_url=url,
            )
            video_trainer.run()
        else:
            url_trainer: URLTrain = URLTrain(
                user_id=user_id,
                account_id=account_id,
                source_id=source_id,
                source_content=url,
                source_url=url,
            )
            url_trainer.run()
    except Exception as e:
        logger.exception(f"Unable to complete training task (URL) - {e}")
        complete_training_event_sync(
            user_id,
            account_id,
            source_id,
            EventActionType.FAILED,
        )


@celery_app.task(name="run_sitemap_training_task")
def run_sitemap_training_task(
    user_id: str,
    account_id: str,
    source_id: str,
    url: str,
) -> None:
    """Run Sitemap-based training in background."""
    try:
        trainer = SitemapTrain(
            user_id=user_id,
            account_id=account_id,
            source_id=source_id,
            source_content=url,
        )
        trainer.run()
    except Exception as e:
        logger.exception(f"Unable to complete training task (File) - {e}")
        complete_training_event_sync(
            user_id,
            account_id,
            source_id,
            EventActionType.FAILED,
        )


async def route_by_training_resource(
    event_content: TrainingContent, event_metadata: EventMetadata
):
    """Route by training resource type."""
    data = event_content.metadata

    match event_content.resource_type:
        case TrainingResourceType.FILE.value:
            file, file_url = fetch_file_from_s3(data)
            file_extension = SupportedTrainingExtensions(
                file.filename.lower().split(".")[-1]
            )

            file_content: bytes = (
                await file.read() if file_extension in READABLE_EXTENSIONS else ""
            )

            # Queue the training task
            run_file_training_task.delay(
                user_id=event_metadata.user_id,
                account_id=event_metadata.account_id,
                source_id=data.source_id,
                source_name=file.filename.lower(),
                source_type=file_extension,
                source_content=file_content,
                source_url=file_url,
            )

        case TrainingResourceType.URL.value:
            run_url_training_task.delay(
                user_id=event_metadata.user_id,
                account_id=event_metadata.account_id,
                source_id=data.source_id,
                url=data.url,
                is_media=data.is_media,
            )
        case TrainingResourceType.SITEMAP.value:
            run_sitemap_training_task.delay(
                user_id=event_metadata.user_id,
                account_id=event_metadata.account_id,
                source_id=data.source_id,
                url=data.url,
            )
        case _:
            logger.error(
                f"Not a valid training resource type = {event_content.resource_type}"
            )


async def route_training_events(
    event: TrainingDataObject, event_metadata: EventMetadata
) -> None:
    """Routing to different types of training."""
    try:
        match event.action:
            case TrainingEventActions.NEW.value:
                return await route_by_training_resource(event.content, event_metadata)

            case TrainingEventActions.DELETE.value:
                remove_knowledge(event.content.metadata.source_id)
            case _:
                logger.error(f"Not a valid training operation = {event.action}")

    except Exception as e:
        logger.exception(f"Unable to complete training task - {e}")
        complete_training_event_sync(
            event_metadata.user_id,
            event_metadata.account_id,
            event.content.metadata.source_id,
            EventActionType.FAILED,
        )
