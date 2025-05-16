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
oauth2_scheme = HTTPBearer()

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
    token: HTTPAuthorizationCredentials = Depends(oauth2_scheme)
) -> Dict[str, any]:
    """
    FastAPI dependency to verify the Auth0 Access Token.
    Extracts the token from the Authorization header (Bearer scheme).
    """
    if token is None:
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

    try:
        jwks_map = get_jwks() # This can now raise ValueError if domain not set, or HTTPException
        unverified_header = jwt.get_unverified_header(token_value)
        
        kid = unverified_header.get("kid")
        if not kid:
            print("Token header missing 'kid'")
            raise credentials_exception

        key_data = jwks_map.get(kid)
        if not key_data:
            print(f"'kid' {kid} not found in JWKS")
            # Attempt to refresh JWKS cache once if key not found
            get_jwks.cache_clear()
            jwks_map = get_jwks()
            key_data = jwks_map.get(kid)
            if not key_data:
                print(f"'kid' {kid} still not found in refreshed JWKS")
                raise credentials_exception


        # Construct RSA key from JWKS data
        rsa_key = {
            "kty": key_data.get("kty"),
            "kid": key_data.get("kid"),
            "use": key_data.get("use"),
            "n": key_data.get("n"),
            "e": key_data.get("e"),
        }
        
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
            print("Token payload missing 'sub' (subject) claim")
            raise credentials_exception

        return payload 

    except ExpiredSignatureError:
        print("Token has expired")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except JWTClaimsError as e:
        print(f"Token claims error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token claims invalid: {str(e)}", # Use str(e) for detail
            headers={"WWW-Authenticate": "Bearer"},
        )
    except JWTError as e:
        print(f"JWT processing error: {e}")
        raise credentials_exception
    except ValueError as e: # Catch configuration errors from get_jwks
        print(f"Configuration error for JWT validation: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Authentication configuration error: {str(e)}"
        )
    except Exception as e:
        print(f"Unexpected error during token validation: {type(e).__name__} - {e}")
        raise credentials_exception

