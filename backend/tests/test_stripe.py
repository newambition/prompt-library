#!/usr/bin/env python3
"""
Simple Stripe integration test script
Tests basic Stripe functionality without Auth0 authentication
"""

import os
import stripe
from dotenv import load_dotenv

# Load environment variables explicitly from .env file in current directory
env_path = '.env'
load_dotenv(dotenv_path=env_path)

def test_stripe_connection():
    """Test basic Stripe API connection"""
    print("🧪 Testing Stripe Integration...")
    print("=" * 50)
    
    # Debug: Show which .env file we're loading from
    print(f"📁 Loading .env from: {os.path.abspath(env_path)}")
    print(f"📁 .env file exists: {os.path.exists(env_path)}")
    
    # Set up Stripe
    stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
    
    if not stripe.api_key:
        print("❌ STRIPE_SECRET_KEY not found in environment")
        return False
    
    # Debug: Show key info without exposing the actual key
    print(f"🔑 Key length: {len(stripe.api_key)}")
    print(f"🔑 Key starts with: {stripe.api_key[:15]}...")
    
    if not stripe.api_key.startswith("sk_test_"):
        print("⚠️  Warning: Not using test key (should start with sk_test_)")
    
    try:
        # Test 1: List products (should work with any valid key)
        print("1️⃣  Testing Stripe API connection...")
        products = stripe.Product.list(limit=1)
        print("✅ Stripe API connection successful")
        
        # Test 2: Check if your price IDs exist
        monthly_price_id = os.getenv("STRIPE_PRO_PRICE_ID_MONTHLY")
        yearly_price_id = os.getenv("STRIPE_PRO_PRICE_ID_YEARLY")
        
        print(f"\n2️⃣  Testing price IDs...")
        print(f"Monthly Price ID: {monthly_price_id}")
        print(f"Yearly Price ID: {yearly_price_id}")
        
        if monthly_price_id:
            try:
                price = stripe.Price.retrieve(monthly_price_id)
                print(f"✅ Monthly price exists: {price.unit_amount/100} {price.currency.upper()}")
            except stripe.error.InvalidRequestError:
                print(f"❌ Monthly price ID '{monthly_price_id}' not found")
        
        if yearly_price_id:
            try:
                price = stripe.Price.retrieve(yearly_price_id)
                print(f"✅ Yearly price exists: {price.unit_amount/100} {price.currency.upper()}")
            except stripe.error.InvalidRequestError:
                print(f"❌ Yearly price ID '{yearly_price_id}' not found")
        
        # Test 3: Create a test customer (will be deleted)
        print(f"\n3️⃣  Testing customer creation...")
        test_customer = stripe.Customer.create(
            email="test@example.com",
            name="Test User"
        )
        print(f"✅ Test customer created: {test_customer.id}")
        
        # Clean up - delete test customer
        stripe.Customer.delete(test_customer.id)
        print("✅ Test customer deleted")
        
        print(f"\n🎉 All Stripe tests passed!")
        return True
        
    except stripe.error.AuthenticationError:
        print("❌ Stripe authentication failed - check your secret key")
        return False
    except stripe.error.StripeError as e:
        print(f"❌ Stripe error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def test_checkout_session_creation():
    """Test creating a checkout session (without actual payment)"""
    print(f"\n4️⃣  Testing checkout session creation...")
    
    stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
    monthly_price_id = os.getenv("STRIPE_PRO_PRICE_ID_MONTHLY")
    
    if not monthly_price_id:
        print("❌ No monthly price ID set - skipping checkout test")
        return False
    
    try:
        # Create a test customer first
        customer = stripe.Customer.create(
            email="test@example.com",
            name="Test User"
        )
        
        # Create checkout session
        checkout_session = stripe.checkout.Session.create(
            customer=customer.id,
            payment_method_types=['card'],
            line_items=[{
                'price': monthly_price_id,
                'quantity': 1,
            }],
            mode='subscription',
            success_url='http://localhost:3000/success',
            cancel_url='http://localhost:3000/cancel',
        )
        
        print(f"✅ Checkout session created: {checkout_session.id}")
        print(f"🔗 Checkout URL: {checkout_session.url}")
        
        # Clean up
        stripe.Customer.delete(customer.id)
        print("✅ Test customer deleted")
        
        return True
        
    except stripe.error.StripeError as e:
        print(f"❌ Checkout session creation failed: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Starting Stripe Integration Tests")
    print("=" * 50)
    
    success = test_stripe_connection()
    if success:
        test_checkout_session_creation()
    
    print("\n" + "=" * 50)
    print("✨ Test complete!") 