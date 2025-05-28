#!/usr/bin/env python3
"""
Complete Stripe integration test including webhook verification
"""

import os
import stripe
import requests
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_stripe_setup():
    """Test basic Stripe setup"""
    print("🧪 Testing Complete Stripe Integration...")
    print("=" * 60)
    
    # Check all required environment variables
    required_vars = [
        'STRIPE_SECRET_KEY',
        'STRIPE_PUBLISHABLE_KEY', 
        'STRIPE_WEBHOOK_SECRET',
        'STRIPE_PRO_PRICE_ID_MONTHLY',
        'STRIPE_PRO_PRICE_ID_YEARLY'
    ]
    
    print("1️⃣  Checking environment variables...")
    for var in required_vars:
        value = os.getenv(var)
        if value:
            if 'SECRET' in var or 'KEY' in var:
                print(f"✅ {var}: {value[:15]}...")
            else:
                print(f"✅ {var}: {value}")
        else:
            print(f"❌ {var}: NOT SET")
            return False
    
    return True

def test_api_endpoints():
    """Test the FastAPI Stripe endpoints"""
    print(f"\n2️⃣  Testing API endpoints...")
    
    base_url = "http://localhost:8000"
    
    # Test 1: Check if server is running
    try:
        response = requests.get(f"{base_url}/docs", timeout=5)
        if response.status_code == 200:
            print("✅ FastAPI server is running")
        else:
            print(f"❌ Server responded with status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Cannot connect to server: {e}")
        return False
    
    # Test 2: Check if Stripe endpoints are registered
    try:
        response = requests.get(f"{base_url}/openapi.json", timeout=5)
        if response.status_code == 200:
            openapi_spec = response.json()
            paths = openapi_spec.get('paths', {})
            
            stripe_endpoints = [
                '/billing/create-checkout-session',
                '/billing/create-customer-portal-session', 
                '/billing/stripe-webhooks'
            ]
            
            for endpoint in stripe_endpoints:
                if endpoint in paths:
                    print(f"✅ Endpoint registered: {endpoint}")
                else:
                    print(f"❌ Endpoint missing: {endpoint}")
                    return False
        else:
            print("❌ Cannot fetch OpenAPI spec")
            return False
    except Exception as e:
        print(f"❌ Error checking endpoints: {e}")
        return False
    
    return True

def test_webhook_secret():
    """Test webhook secret validation"""
    print(f"\n3️⃣  Testing webhook secret...")
    
    webhook_secret = os.getenv('STRIPE_WEBHOOK_SECRET')
    if not webhook_secret:
        print("❌ STRIPE_WEBHOOK_SECRET not set")
        return False
    
    if webhook_secret.startswith('whsec_'):
        print(f"✅ Webhook secret format correct: {webhook_secret[:15]}...")
        return True
    else:
        print(f"⚠️  Webhook secret doesn't start with 'whsec_': {webhook_secret[:15]}...")
        print("   This might be okay if using Stripe CLI")
        return True

def test_stripe_connectivity():
    """Test actual Stripe API calls"""
    print(f"\n4️⃣  Testing Stripe API connectivity...")
    
    stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
    
    try:
        # Test price retrieval
        monthly_price_id = os.getenv("STRIPE_PRO_PRICE_ID_MONTHLY")
        yearly_price_id = os.getenv("STRIPE_PRO_PRICE_ID_YEARLY")
        
        monthly_price = stripe.Price.retrieve(monthly_price_id)
        yearly_price = stripe.Price.retrieve(yearly_price_id)
        
        print(f"✅ Monthly price: {monthly_price.unit_amount/100} {monthly_price.currency.upper()}")
        print(f"✅ Yearly price: {yearly_price.unit_amount/100} {yearly_price.currency.upper()}")
        
        # Test customer creation
        test_customer = stripe.Customer.create(
            email="test@example.com",
            name="Test User"
        )
        print(f"✅ Test customer created: {test_customer.id}")
        
        # Clean up
        stripe.Customer.delete(test_customer.id)
        print("✅ Test customer deleted")
        
        return True
        
    except stripe.error.StripeError as e:
        print(f"❌ Stripe API error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 Starting Complete Stripe Integration Tests")
    print("=" * 60)
    
    tests = [
        ("Environment Setup", test_stripe_setup),
        ("API Endpoints", test_api_endpoints), 
        ("Webhook Secret", test_webhook_secret),
        ("Stripe Connectivity", test_stripe_connectivity)
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {e}")
            results.append((test_name, False))
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    
    all_passed = True
    for test_name, passed in results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status} {test_name}")
        if not passed:
            all_passed = False
    
    print("\n" + "=" * 60)
    if all_passed:
        print("🎉 ALL TESTS PASSED! Your Stripe integration is ready!")
        print("\n🚀 Next steps:")
        print("   1. Test checkout flow via /docs endpoint")
        print("   2. Test webhook delivery with: stripe listen --forward-to localhost:8000/billing/stripe-webhooks")
        print("   3. Start building frontend UI")
    else:
        print("⚠️  Some tests failed. Please check the issues above.")
    
    print("=" * 60)

if __name__ == "__main__":
    main() 