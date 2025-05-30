#!/usr/bin/env python3
"""
Test script to verify robust user lookup functionality
"""
import os
import sys
from pathlib import Path

# Add the backend directory to Python path and set up environment
backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

from src.database import SessionLocal, check_database_health
from src.crud.crud_users import get_user_by_auth0_id

def test_user_lookups():
    """Test user lookups with different Auth0 IDs to ensure robustness."""
    print("Testing database health...")
    health = check_database_health()
    print(f"Database health: {'✅ Connected' if health else '❌ Disconnected'}")
    
    if not health:
        print("Database connection failed. Please check your configuration.")
        return False
    
    # Test Auth0 IDs from your error logs
    test_auth0_ids = [
        "google-oauth2|111168358197683852185",  # Your Google account
        "google-oauth2|113113592992204243775",  # Another Google account
        "github|201711546",  # GitHub account from error
        "nonexistent|12345"  # Test nonexistent user
    ]
    
    print("\nTesting user lookups...")
    
    db = SessionLocal()
    try:
        for auth0_id in test_auth0_ids:
            print(f"\nLooking up user: {auth0_id}")
            try:
                user = get_user_by_auth0_id(db, auth0_id)
                if user:
                    print(f"  ✅ Found user: ID={user.user_id}, tier={user.tier}, status={user.subscription_status}")
                else:
                    print(f"  ⚠️  User not found (this is expected for nonexistent users)")
            except Exception as e:
                print(f"  ❌ Error looking up user: {e}")
                return False
        
        print("\n✅ All user lookups completed successfully!")
        return True
        
    finally:
        db.close()

if __name__ == "__main__":
    success = test_user_lookups()
    exit(0 if success else 1) 