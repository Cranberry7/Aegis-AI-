"""Rate limiting Util."""

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address

from app.config import settings

GLOBAL_LIMIT = f"{settings.GLOBAL_RATE_LIMIT_COUNT}/{settings.GLOBAL_RATE_LIMIT_UNIT}"


limiter = Limiter(
    key_func=get_remote_address,
    default_limits=[GLOBAL_LIMIT],
)


def init_rate_limiter(app):
    """Initialize the rate limiter middleware."""
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    app.add_middleware(SlowAPIMiddleware)
