# backend/src/auth_utils.py
import json
import requests # Using requests for simplicity, httpx for async environments
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError, ExpiredSignatureError # JWTClaimsError will be imported from jose.exceptions
from jose.exceptions import JWTClaimsError # Corrected import for JWTClaimsError
from typing import Dict, Optional
from functools import lru_cache # For caching JWKS

from src.config import settings

# Scheme for bearer token authentication
oauth2_scheme = HTTPBearer(auto_error=False)  # Changed to not auto-error to handle manually

# --- JWKS (JSON Web Key Set) Caching ---
@lru_cache(maxsize=1)
def get_jwks() -> Dict[str, any]:
    """
    Fetches and caches the JSON Web Key Set (JWKS) from Auth0.
    """
    if not settings.AUTH0_DOMAIN:
        raise ValueError("AUTH0_DOMAIN is not configured.")
    
    jwks_url = f"https://{settings.AUTH0_DOMAIN}/.well-known/jwks.json"
    try:
        response = requests.get(jwks_url, timeout=10)
        response.raise_for_status()
        jwks = response.json()
        # Ensure 'keys' exists and is a list before processing
        if "keys" not in jwks or not isinstance(jwks["keys"], list):
            raise ValueError("Invalid JWKS format: 'keys' array not found.")
        return {key["kid"]: key for key in jwks["keys"] if "kid" in key} # Added check for "kid"
    except requests.exceptions.RequestException as e:
        print(f"Error fetching JWKS: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Could not fetch JWKS from authentication server."
        )
    except (KeyError, TypeError, ValueError) as e: # Added ValueError
        print(f"Invalid JWKS format or content: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Invalid JWKS format received from authentication server."
        )


# --- Token Verification Dependency ---
async def verify_token(
    token: Optional[HTTPAuthorizationCredentials] = Depends(oauth2_scheme)
) -> Dict[str, any]:
    """
    FastAPI dependency to verify the Auth0 Access Token.
    Extracts the token from the Authorization header (Bearer scheme).
    """
    print(f"DEBUG: verify_token called with token: {token is not None}")
    
    if token is None:
        print("DEBUG: No token provided")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token_value = token.credentials
    print(f"DEBUG: Token value length: {len(token_value) if token_value else 0}")

    try:
        # Check if we have required settings
        if not settings.AUTH0_DOMAIN or not settings.AUTH0_API_AUDIENCE:
            print(f"DEBUG: Missing Auth0 config - Domain: {bool(settings.AUTH0_DOMAIN)}, Audience: {bool(settings.AUTH0_API_AUDIENCE)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Authentication service configuration error"
            )
        
        jwks_map = get_jwks() # This can now raise ValueError if domain not set, or HTTPException
        unverified_header = jwt.get_unverified_header(token_value)
        print(f"DEBUG: Token header: {unverified_header}")
        
        kid = unverified_header.get("kid")
        if not kid:
            print("DEBUG: Token header missing 'kid'")
            raise credentials_exception

        key_data = jwks_map.get(kid)
        if not key_data:
            print(f"DEBUG: 'kid' {kid} not found in JWKS")
            # Attempt to refresh JWKS cache once if key not found
            get_jwks.cache_clear()
            jwks_map = get_jwks()
            key_data = jwks_map.get(kid)
            if not key_data:
                print(f"DEBUG: 'kid' {kid} still not found in refreshed JWKS")
                raise credentials_exception

        # Construct RSA key from JWKS data
        rsa_key = {
            "kty": key_data.get("kty"),
            "kid": key_data.get("kid"),
            "use": key_data.get("use"),
            "n": key_data.get("n"),
            "e": key_data.get("e"),
        }
        
        print(f"DEBUG: Verifying token with audience: {settings.AUTH0_API_AUDIENCE}")
        print(f"DEBUG: Verifying token with issuer: https://{settings.AUTH0_DOMAIN}/")
        
        # Verify and decode the token
        payload = jwt.decode(
            token_value,
            rsa_key,
            algorithms=["RS256"],
            audience=settings.AUTH0_API_AUDIENCE,
            issuer=f"https://{settings.AUTH0_DOMAIN}/"
        )
        
        user_id: Optional[str] = payload.get("sub")
        if user_id is None:
            print("DEBUG: Token payload missing 'sub' (subject) claim")
            raise credentials_exception

        print(f"DEBUG: Token validation successful for user: {user_id}")
        return payload 

    except ExpiredSignatureError:
        print("DEBUG: Token has expired")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except JWTClaimsError as e:
        print(f"DEBUG: Token claims error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token claims invalid: {str(e)}", # Use str(e) for detail
            headers={"WWW-Authenticate": "Bearer"},
        )
    except JWTError as e:
        print(f"DEBUG: JWT processing error: {e}")
        raise credentials_exception
    except ValueError as e: # Catch configuration errors from get_jwks
        print(f"DEBUG: Configuration error for JWT validation: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Authentication configuration error: {str(e)}"
        )
    except Exception as e:
        print(f"DEBUG: Unexpected error during token validation: {type(e).__name__} - {e}")
        raise credentials_exception

from sqlalchemy.orm import Session
from src.database import get_db
from src.crud import crud_users
from src import models

async def get_current_active_user(
    auth0_payload: Dict[str, any] = Depends(verify_token),
    db: Session = Depends(get_db)
) -> models.User:
    """
    FastAPI dependency to get the current active user from the database.
    Relies on verify_token to authenticate and get Auth0 user data,
    then fetches or creates the user in the local database.
    """
    if not auth0_payload: # Should not happen if verify_token is working correctly
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials, no payload from token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    auth0_id = auth0_payload.get("sub")
    if not auth0_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Auth0 ID (sub) missing from token payload.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        user = crud_users.get_or_create_user_from_auth0(db, auth0_payload)
        if user is None: # Should ideally be handled by get_or_create_user_from_auth0 raising an error
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Could not get or create user.",
            )
        return user
    except ValueError as ve: # Catch specific errors from crud_users if any (e.g., validation)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error processing user data: {str(ve)}",
        )
    except Exception as e: # Catch any other unexpected errors during DB operation
        print(f"Error in get_current_active_user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while fetching user information.",
        )
