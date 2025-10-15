"""FastAPI application entry point."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_client import make_asgi_app
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from src import __version__
from src.config import settings
from src.database import close_db
from src.middleware.correlation_id import CorrelationIdMiddleware
from src.middleware.error_handler import ErrorHandlerMiddleware
from src.schemas.common import HealthResponse
from src.utils.logging import get_logger, setup_logging

# Setup logging
setup_logging()
logger = get_logger(__name__)

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events.

    Args:
        app: FastAPI application instance
    """
    # Startup
    logger.info(
        f"Starting {app.title} v{app.version}",
        extra={"environment": settings.environment},
    )
    yield
    # Shutdown
    logger.info("Shutting down application")
    await close_db()


# Create FastAPI application
app = FastAPI(
    title="Blog Post Manager API",
    description="Production-ready FastAPI blog post management system with authentication, search, and tagging",
    version=__version__,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url=f"{settings.api_v1_prefix}/openapi.json",
    lifespan=lifespan,
)

# Add rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add custom middleware (order matters - first added is outermost)
app.add_middleware(ErrorHandlerMiddleware)
app.add_middleware(CorrelationIdMiddleware)


@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check() -> HealthResponse:
    """
    Health check endpoint.

    Returns:
        HealthResponse: Application health status
    """
    return HealthResponse(
        status="healthy",
        version=__version__,
        database="connected",  # TODO: Add actual database health check
    )


# Mount Prometheus metrics endpoint
metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)


# Include API routers
from src.api.v1 import auth, posts, search, tags

app.include_router(
    auth.router, prefix=f"{settings.api_v1_prefix}/auth", tags=["Authentication"]
)
app.include_router(posts.router, prefix=f"{settings.api_v1_prefix}/posts", tags=["Posts"])
app.include_router(search.router, prefix=f"{settings.api_v1_prefix}/search", tags=["Search"])
app.include_router(tags.router, prefix=f"{settings.api_v1_prefix}/tags", tags=["Tags"])


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "src.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.reload,
        log_level=settings.log_level.lower(),
    )
