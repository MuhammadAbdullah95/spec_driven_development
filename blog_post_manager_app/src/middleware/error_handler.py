"""Global error handling middleware."""

from typing import Callable

from fastapi import Request, Response, status
from fastapi.responses import JSONResponse
from jose import JWTError
from sqlalchemy.exc import IntegrityError
from starlette.middleware.base import BaseHTTPMiddleware

from src.utils.logging import get_logger

logger = get_logger(__name__)


class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    """
    Middleware to handle exceptions globally and return structured error responses.

    Catches unhandled exceptions and converts them to proper JSON error responses
    with appropriate HTTP status codes.
    """

    async def dispatch(
        self, request: Request, call_next: Callable
    ) -> Response:
        """
        Process the request and handle any exceptions.

        Args:
            request: The incoming request
            call_next: The next middleware or route handler

        Returns:
            Response or error response
        """
        try:
            response = await call_next(request)
            return response

        except IntegrityError as exc:
            # Database integrity errors (unique constraints, foreign keys, etc.)
            logger.error(
                "Database integrity error",
                extra={
                    "correlation_id": getattr(request.state, "correlation_id", None),
                    "error": str(exc),
                },
                exc_info=True,
            )

            # Parse the error to provide user-friendly message
            error_msg = str(exc.orig) if hasattr(exc, "orig") else str(exc)

            if "unique constraint" in error_msg.lower():
                message = "A record with this information already exists"
            elif "foreign key constraint" in error_msg.lower():
                message = "Referenced record does not exist"
            else:
                message = "Database constraint violation"

            return JSONResponse(
                status_code=status.HTTP_409_CONFLICT,
                content={
                    "error": "IntegrityError",
                    "message": message,
                    "details": {"database_error": error_msg},
                },
            )

        except JWTError as exc:
            # JWT token validation errors
            logger.warning(
                "JWT validation error",
                extra={
                    "correlation_id": getattr(request.state, "correlation_id", None),
                    "error": str(exc),
                },
            )

            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={
                    "error": "AuthenticationError",
                    "message": "Invalid or expired token",
                    "details": None,
                },
                headers={"WWW-Authenticate": "Bearer"},
            )

        except ValueError as exc:
            # Validation errors from business logic
            logger.warning(
                "Validation error",
                extra={
                    "correlation_id": getattr(request.state, "correlation_id", None),
                    "error": str(exc),
                },
            )

            return JSONResponse(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                content={
                    "error": "ValidationError",
                    "message": str(exc),
                    "details": None,
                },
            )

        except Exception as exc:
            # Catch-all for unexpected errors
            logger.error(
                "Unexpected error",
                extra={
                    "correlation_id": getattr(request.state, "correlation_id", None),
                    "error": str(exc),
                    "type": type(exc).__name__,
                },
                exc_info=True,
            )

            # In production, don't expose internal error details
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={
                    "error": "InternalServerError",
                    "message": "An unexpected error occurred",
                    "details": None,
                },
            )
