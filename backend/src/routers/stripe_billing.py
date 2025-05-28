# backend/src/routers/stripe_billing.py
from fastapi import APIRouter, HTTPException, status, Depends, Request, Header
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from typing import Dict, Optional
import stripe
import hmac
import hashlib
import json

from src.database import get_db
from src.config import settings
from src import schemas
from src.crud import crud_users
from src.auth_utils import verify_token

# Configure Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

router = APIRouter(prefix="/billing", tags=["Billing"])


@router.post("/create-checkout-session", response_model=schemas.StripeCheckoutResponse)
async def create_checkout_session(
    request: schemas.StripeCheckoutRequest,
    current_user: Dict = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """Create a Stripe Checkout session for subscription upgrade."""
    if not settings.STRIPE_SECRET_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Stripe is not configured"
        )
    
    auth0_id = current_user.get("sub")
    if not auth0_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User ID not found in token"
        )
    
    # Get or create user in our database
    user = crud_users.get_or_create_user_from_auth0(db, current_user)
    
    try:
        # Create Stripe customer if doesn't exist
        if not user.stripe_customer_id:
            stripe_customer = stripe.Customer.create(
                email=user.email,
                metadata={
                    "user_id": str(user.user_id),
                    "auth0_id": auth0_id
                }
            )
            # Update user with Stripe customer ID
            crud_users.update_user_subscription(
                db, user.user_id, user.tier, user.subscription_status,
                stripe_customer_id=stripe_customer.id
            )
            customer_id = stripe_customer.id
        else:
            customer_id = user.stripe_customer_id
        
        # Create checkout session
        success_url = request.success_url or f"{settings.FRONTEND_URL}/billing/success"
        cancel_url = request.cancel_url or f"{settings.FRONTEND_URL}/billing/cancel"
        
        checkout_session = stripe.checkout.Session.create(
            customer=customer_id,
            payment_method_types=['card'],
            line_items=[{
                'price': request.price_id,
                'quantity': 1,
            }],
            mode='subscription',
            success_url=success_url + "?session_id={CHECKOUT_SESSION_ID}",
            cancel_url=cancel_url,
            metadata={
                "user_id": str(user.user_id),
                "auth0_id": auth0_id
            }
        )
        
        return schemas.StripeCheckoutResponse(checkout_url=checkout_session.url)
        
    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Stripe error: {str(e)}"
        )


@router.post("/create-customer-portal-session", response_model=schemas.StripeCustomerPortalResponse)
async def create_customer_portal_session(
    request: schemas.StripeCustomerPortalRequest,
    current_user: Dict = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """Create a Stripe Customer Portal session for subscription management."""
    if not settings.STRIPE_SECRET_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Stripe is not configured"
        )
    
    auth0_id = current_user.get("sub")
    if not auth0_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User ID not found in token"
        )
    
    user = crud_users.get_user_by_auth0_id(db, auth0_id)
    if not user or not user.stripe_customer_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No subscription found for this user"
        )
    
    try:
        return_url = request.return_url or f"{settings.FRONTEND_URL}/settings"
        
        portal_session = stripe.billing_portal.Session.create(
            customer=user.stripe_customer_id,
            return_url=return_url,
        )
        
        return schemas.StripeCustomerPortalResponse(portal_url=portal_session.url)
        
    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Stripe error: {str(e)}"
        )


@router.post("/stripe-webhooks")
async def handle_stripe_webhook(
    request: Request,
    stripe_signature: str = Header(None, alias="stripe-signature"),
    db: Session = Depends(get_db)
):
    """Handle Stripe webhook events."""
    if not settings.STRIPE_WEBHOOK_SECRET:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Stripe webhook secret not configured"
        )
    
    payload = await request.body()
    
    try:
        # Verify webhook signature
        event = stripe.Webhook.construct_event(
            payload, stripe_signature, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid payload"
        )
    except stripe.error.SignatureVerificationError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid signature"
        )
    
    # Handle the event
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        await _handle_checkout_completed(db, session)
    
    elif event['type'] == 'customer.subscription.updated':
        subscription = event['data']['object']
        await _handle_subscription_updated(db, subscription)
    
    elif event['type'] == 'customer.subscription.deleted':
        subscription = event['data']['object']
        await _handle_subscription_deleted(db, subscription)
    
    elif event['type'] == 'invoice.payment_succeeded':
        invoice = event['data']['object']
        await _handle_payment_succeeded(db, invoice)
    
    elif event['type'] == 'invoice.payment_failed':
        invoice = event['data']['object']
        await _handle_payment_failed(db, invoice)
    
    return {"status": "success"}


async def _handle_checkout_completed(db: Session, session):
    """Handle successful checkout completion."""
    customer_id = session.get('customer')
    if not customer_id:
        return
    
    user = crud_users.get_user_by_stripe_customer_id(db, customer_id)
    if not user:
        return
    
    # Update user to Pro tier
    crud_users.update_user_subscription(
        db, user.user_id, "pro", "active",
        stripe_customer_id=customer_id
    )


async def _handle_subscription_updated(db: Session, subscription):
    """Handle subscription updates."""
    customer_id = subscription.get('customer')
    status = subscription.get('status')
    
    if not customer_id:
        return
    
    user = crud_users.get_user_by_stripe_customer_id(db, customer_id)
    if not user:
        return
    
    # Map Stripe status to our status
    if status == 'active':
        tier = "pro"
        subscription_status = "active"
    elif status in ['past_due', 'unpaid']:
        tier = "pro"  # Keep pro but mark as past due
        subscription_status = "past_due"
    elif status in ['canceled', 'incomplete_expired']:
        tier = "free"
        subscription_status = "cancelled"
    else:
        tier = user.tier  # Keep current tier
        subscription_status = status
    
    crud_users.update_user_subscription(
        db, user.user_id, tier, subscription_status
    )


async def _handle_subscription_deleted(db: Session, subscription):
    """Handle subscription cancellation."""
    customer_id = subscription.get('customer')
    
    if not customer_id:
        return
    
    user = crud_users.get_user_by_stripe_customer_id(db, customer_id)
    if not user:
        return
    
    # Downgrade to free tier
    crud_users.update_user_subscription(
        db, user.user_id, "free", "cancelled"
    )


async def _handle_payment_succeeded(db: Session, invoice):
    """Handle successful payment."""
    customer_id = invoice.get('customer')
    
    if not customer_id:
        return
    
    user = crud_users.get_user_by_stripe_customer_id(db, customer_id)
    if not user:
        return
    
    # Ensure user is active if payment succeeded
    if user.subscription_status in ['past_due', 'unpaid']:
        crud_users.update_user_subscription(
            db, user.user_id, "pro", "active"
        )


async def _handle_payment_failed(db: Session, invoice):
    """Handle failed payment."""
    customer_id = invoice.get('customer')
    
    if not customer_id:
        return
    
    user = crud_users.get_user_by_stripe_customer_id(db, customer_id)
    if not user:
        return
    
    # Mark as past due
    crud_users.update_user_subscription(
        db, user.user_id, user.tier, "past_due"
    ) 