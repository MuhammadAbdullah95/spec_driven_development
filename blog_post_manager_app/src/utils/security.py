"""Security utilities for password hashing and JWT token management."""

from datetime import datetime, timedelta, timezone
from typing import Any, Dict

from jose import jwt
import bcrypt
import hashlib

from src.config import settings

# We'll implement password hashing directly using bcrypt with a SHA-256
# pre-hash. This avoids passlib/backend detection issues and removes the
# 72-byte limitation by hashing the SHA-256 digest (32 bytes) with bcrypt.


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against a hashed password.

    Args:
        plain_password: The plain text password to verify
        hashed_password: The bcrypt hashed password to compare against

    Returns:
        True if password matches, False otherwise
    """
    # Compute SHA-256 digest of the provided password (deterministic 32 bytes)
    # and use bcrypt.checkpw against the stored hash.
    pw_bytes = plain_password.encode("utf-8")
    digest = hashlib.sha256(pw_bytes).digest()

    try:
        # bcrypt.checkpw expects bytes for both args
        return bcrypt.checkpw(digest, hashed_password.encode("utf-8"))
    except Exception:
        # Any error -> treat as non-match
        return False


def get_password_hash(password: str) -> str:
    """
    Hash a password using bcrypt.

    Args:
        password: The plain text password to hash

    Returns:
        The bcrypt hashed password
    """
    # Hash the SHA-256 digest of the utf-8 password using bcrypt. This makes
    # the input to bcrypt a fixed 32 bytes (the digest), avoiding the 72-byte
    # limitation while preserving strong hashing via bcrypt.
    pw_bytes = password.encode("utf-8")
    digest = hashlib.sha256(pw_bytes).digest()
    hashed = bcrypt.hashpw(digest, bcrypt.gensalt())
    return hashed.decode("utf-8")


def create_access_token(
    data: Dict[str, Any], expires_delta: timedelta | None = None
) -> str:
    """
    Create a JWT access token.

    Args:
        data: Dictionary of claims to encode in the token (should include 'sub' for user ID)
        expires_delta: Optional custom expiration time, defaults to settings value

    Returns:
        Encoded JWT access token string

    Example:
        ```python
        token = create_access_token(data={"sub": str(user.id)})
        ```
    """
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.access_token_expire_minutes
        )

    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(
        to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm
    )
    return encoded_jwt


def create_refresh_token(
    data: Dict[str, Any], expires_delta: timedelta | None = None
) -> str:
    """
    Create a JWT refresh token.

    Args:
        data: Dictionary of claims to encode in the token (should include 'sub' for user ID)
        expires_delta: Optional custom expiration time, defaults to settings value

    Returns:
        Encoded JWT refresh token string

    Example:
        ```python
        token = create_refresh_token(data={"sub": str(user.id)})
        ```
    """
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            days=settings.refresh_token_expire_days
        )

    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(
        to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm
    )
    return encoded_jwt


def decode_token(token: str) -> Dict[str, Any]:
    """
    Decode and verify a JWT token.

    Args:
        token: The JWT token to decode

    Returns:
        Dictionary of decoded token claims

    Raises:
        JWTError: If token is invalid or expired
    """
    payload = jwt.decode(
        token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm]
    )
    return payload
