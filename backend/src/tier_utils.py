from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import Dict, Optional
from functools import wraps

from src.crud import crud_users
from src import schemas

# Tier limits based on [subs] reference in deployment_plan.md
TIER_LIMITS = {
    "free": {
        "max_prompts": 20,
        "max_versions_per_prompt": 3,
        "playground_tests": None,  # Unlimited (BYOK model)
    },
    "pro": {
        "max_prompts": None,  # Unlimited
        "max_versions_per_prompt": None,  # Unlimited
        "playground_tests": None,  # Unlimited
    }
}


def get_tier_limits(tier: str) -> schemas.TierLimits:
    """Get the limits for a specific tier."""
    limits = TIER_LIMITS.get(tier, TIER_LIMITS["free"])
    return schemas.TierLimits(
        max_prompts=limits["max_prompts"],
        max_versions_per_prompt=limits["max_versions_per_prompt"]
    )


def check_user_tier_info(db: Session, user_id: int) -> schemas.UserTierInfo:
    """Get comprehensive tier information for a user."""
    # Get user's tier and subscription status
    tier_info = crud_users.get_user_tier_and_status(db, user_id)
    if not tier_info:
        # Default to free tier for unknown users
        tier_info = {"tier": "free", "subscription_status": "active"}
    
    tier = tier_info["tier"]
    subscription_status = tier_info["subscription_status"]
    
    # Count current prompts
    prompt_count = crud_users.count_user_prompts(db, user_id)
    
    # Get tier limits
    limits = get_tier_limits(tier)
    
    # Determine if user can create prompts/versions
    can_create_prompt = True
    can_create_version = True
    
    # Check if subscription is active (for pro users)
    if tier == "pro" and subscription_status not in ["active"]:
        # Pro user with inactive subscription - treat as free tier
        tier = "free"
        limits = get_tier_limits("free")
    
    # Check prompt limits
    if limits.max_prompts is not None and prompt_count >= limits.max_prompts:
        can_create_prompt = False
    
    return schemas.UserTierInfo(
        tier=tier,
        subscription_status=subscription_status,
        prompt_count=prompt_count,
        prompt_limit=limits.max_prompts,
        can_create_prompt=can_create_prompt,
        can_create_version=can_create_version
    )


def enforce_prompt_creation_limit(db: Session, user_id: int):
    """Enforce prompt creation limits for the user's tier."""
    tier_info = check_user_tier_info(db, user_id)
    
    if not tier_info.can_create_prompt:
        if tier_info.prompt_limit:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Prompt limit reached. {tier_info.tier.title()} tier allows up to {tier_info.prompt_limit} prompts. Upgrade to Pro for unlimited prompts."
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot create prompt due to subscription status."
            )


def enforce_version_creation_limit(db: Session, user_id: int, prompt_id: str):
    """Enforce version creation limits for the user's tier."""
    tier_info = check_user_tier_info(db, user_id)
    
    # Get tier limits
    limits = get_tier_limits(tier_info.tier)
    
    if limits.max_versions_per_prompt is not None:
        version_count = crud_users.count_prompt_versions(db, user_id, prompt_id)
        
        if version_count >= limits.max_versions_per_prompt:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Version limit reached. {tier_info.tier.title()} tier allows up to {limits.max_versions_per_prompt} versions per prompt. Upgrade to Pro for unlimited versions."
            )


def require_tier(required_tier: str):
    """Decorator to require a specific tier for an endpoint."""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Extract db and current_user from kwargs
            db = kwargs.get('db')
            current_user = kwargs.get('current_user')
            
            if not db or not current_user:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Missing required dependencies for tier check"
                )
            
            auth0_id = current_user.get("sub")
            if not auth0_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="User ID not found in token"
                )
            
            user = crud_users.get_user_by_auth0_id(db, auth0_id)
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not found"
                )
            
            tier_info = check_user_tier_info(db, user.user_id)
            
            if required_tier == "pro" and tier_info.tier != "pro":
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="This feature requires a Pro subscription. Please upgrade your account."
                )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator


def get_user_from_auth0_id(db: Session, auth0_id: str) -> Optional[int]:
    """Helper function to get user_id from auth0_id."""
    user = crud_users.get_user_by_auth0_id(db, auth0_id)
    return user.user_id if user else None 