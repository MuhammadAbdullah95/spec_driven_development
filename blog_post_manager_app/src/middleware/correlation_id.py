"""Correlation ID middleware for request tracing."""

import uuid
from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from src.utils.logging import get_logger

logger = get_logger(__name__)


class CorrelationIdMiddleware(BaseHTTPMiddleware):
    """
    Middleware to add correlation ID to each request.

    The correlation ID is used for distributed tracing and log aggregation.
    It's generated for each request and included in response headers.
    """

    async def dispatch(
        self, request: Request, call_next: Callable
    ) -> Response:
        """
        Process the request and add correlation ID.

        Args:
            request: The incoming request
            call_next: The next middleware or route handler

        Returns:
            Response with X-Correlation-ID header
        """
        # Try to get correlation ID from request header, or generate new one
        correlation_id = request.headers.get("X-Correlation-ID") or str(uuid.uuid4())

        # Store correlation ID in request state for access in route handlers
        request.state.correlation_id = correlation_id

        # Log request with correlation ID
        logger.info(
            f"{request.method} {request.url.path}",
            extra={
                "correlation_id": correlation_id,
                "method": request.method,
                "path": request.url.path,
                "client_ip": request.client.host if request.client else None,
            },
        )

        # Process the request
        response = await call_next(request)

        # Add correlation ID to response headers
        response.headers["X-Correlation-ID"] = correlation_id

        return response
