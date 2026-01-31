"""Training Core Module."""

from abc import ABC, abstractmethod

from app.common.enums import (
    SupportedTrainingExtensions,
)


class Train(ABC):
    """Training runner abstract class."""

    def __init__(  # noqa: PLR0913
        self,
        user_id: str,
        account_id: str,
        source_id: str,
        source_type: SupportedTrainingExtensions,
        source_url: str,
        send_complete_event: bool = True,
    ):
        """Training runner abstract class constructor."""
        self.user_id: str = user_id
        self.account_id: str = account_id
        self.source_id: str = source_id
        self.source_type: SupportedTrainingExtensions = source_type
        self.source_url: str = source_url
        self.send_complete_event: bool = send_complete_event

    @abstractmethod
    def run(self):
        """Run the flow for training."""
        raise NotImplementedError("Subclasses must implement this method.")
