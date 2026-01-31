"""Video Utils."""

from io import BytesIO

import requests
from agno.tools.youtube import YouTubeTools
from fastapi import UploadFile

youtube_tools = YouTubeTools()


def get_video_from_url(url: str):
    """Get video file from video url."""
    response = requests.get(url)
    file_stream = BytesIO(response.content)
    return UploadFile(file=file_stream)
