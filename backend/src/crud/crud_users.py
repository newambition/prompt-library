from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional, Dict, Any
import datetime

from src.models import User
from src import schemas


def get_user_by_auth0_id(db: Session, auth0_id: str) -> Optional[User]:
    """Get user by Auth0 ID."""
    return db.query(User).filter(User.auth0_id == auth0_id).first()


def get_user_by_user_id(db: Session, user_id: int) -> Optional[User]:
    """Get user by internal user_id."""
    return db.query(User).filter(User.user_id == user_id).first()


def create_user(db: Session, user_data: schemas.UserCreate) -> User:
    """Create a new user."""
    db_user = User(
        auth0_id=user_data.auth0_id,
        email=user_data.email,
        username=user_data.username,
        tier="free",  # Default to free tier
        subscription_status="active"  # Free tier is considered "active"
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def update_user_subscription(
    db: Session, 
    user_id: int, 
    tier: str, 
    subscription_status: str,
    stripe_customer_id: Optional[str] = None,
    subscription_start_date: Optional[datetime.datetime] = None,
    subscription_end_date: Optional[datetime.datetime] = None
) -> Optional[User]:
    """Update user subscription information."""
    db_user = db.query(User).filter(User.user_id == user_id).first()
    if not db_user:
        return None
    
    db_user.tier = tier
    db_user.subscription_status = subscription_status
    
    if stripe_customer_id is not None:
        db_user.stripe_customer_id = stripe_customer_id
    if subscription_start_date is not None:
        db_user.subscription_start_date = subscription_start_date
    if subscription_end_date is not None:
        db_user.subscription_end_date = subscription_end_date
    
    db.commit()
    db.refresh(db_user)
    return db_user


def get_user_by_stripe_customer_id(db: Session, stripe_customer_id: str) -> Optional[User]:
    """Get user by Stripe customer ID."""
    return db.query(User).filter(User.stripe_customer_id == stripe_customer_id).first()


def get_user_tier_and_status(db: Session, user_id: int) -> Optional[Dict[str, str]]:
    """Get user's tier and subscription status."""
    db_user = db.query(User).filter(User.user_id == user_id).first()
    if not db_user:
        return None
    
    return {
        "tier": db_user.tier,
        "subscription_status": db_user.subscription_status
    }


def get_or_create_user_from_auth0(db: Session, auth0_user_data: Dict[str, Any]) -> User:
    """Get existing user or create new user from Auth0 data."""
    auth0_id = auth0_user_data.get("sub")
    if not auth0_id:
        raise ValueError("Auth0 ID (sub) is required")
    
    # Try to get existing user
    existing_user = get_user_by_auth0_id(db, auth0_id)
    if existing_user:
        return existing_user
    
    # Extract user data with fallbacks
    email = auth0_user_data.get("email")
    username = (
        auth0_user_data.get("nickname") or 
        auth0_user_data.get("name") or 
        auth0_user_data.get("preferred_username") or
        f"user_{auth0_id.split('|')[-1][:8]}"  # Fallback username from auth0_id
    )
    
    # Create new user
    user_create = schemas.UserCreate(
        auth0_id=auth0_id,
        email=email,  # Can be None now
        username=username
    )
    return create_user(db, user_create)


def count_user_prompts(db: Session, user_id: int) -> int:
    """Count the number of prompts for a user."""
    from src.models import PromptDB
    return db.query(func.count(PromptDB.id)).filter(PromptDB.user_id == user_id).scalar()


def count_prompt_versions(db: Session, user_id: int, prompt_id: str) -> int:
    """Count the number of versions for a specific prompt."""
    from src.models import PromptVersionDB, PromptDB
    return db.query(func.count(PromptVersionDB.id)).join(
        PromptDB, PromptVersionDB.prompt_id == PromptDB.id
    ).filter(
        PromptDB.user_id == user_id,
        PromptDB.prompt_id == prompt_id
    ).scalar() 