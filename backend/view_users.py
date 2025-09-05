#!/usr/bin/env python3
"""
Script to view all users in the NeuroLearn database
"""

from database import SessionLocal
from models import User

def view_all_users():
    """Display all users in the database"""
    db = SessionLocal()
    try:
        users = db.query(User).all()
        
        if not users:
            print("No users found in the database.")
            return
        
        print(f"\n{'='*60}")
        print(f"NEUROLEARN DATABASE - TOTAL USERS: {len(users)}")
        print(f"{'='*60}")
        
        for i, user in enumerate(users, 1):
            print(f"\nUser #{i}:")
            print(f"  ID: {user.id}")
            print(f"  Username: {user.username}")
            print(f"  Email: {user.email}")
            print(f"  Full Name: {user.full_name or 'Not provided'}")
            print(f"  Active: {'Yes' if user.is_active else 'No'}")
            print(f"  Verified: {'Yes' if user.is_verified else 'No'}")
            print(f"  Created: {user.created_at}")
            print(f"  Updated: {user.updated_at or 'Never'}")
            print(f"  {'-'*40}")
            
    except Exception as e:
        print(f"Error accessing database: {e}")
    finally:
        db.close()

def view_user_stats():
    """Display user statistics"""
    db = SessionLocal()
    try:
        total_users = db.query(User).count()
        active_users = db.query(User).filter(User.is_active == True).count()
        verified_users = db.query(User).filter(User.is_verified == True).count()
        
        print(f"\n{'='*40}")
        print("USER STATISTICS")
        print(f"{'='*40}")
        print(f"Total Users: {total_users}")
        print(f"Active Users: {active_users}")
        print(f"Verified Users: {verified_users}")
        print(f"Unverified Users: {total_users - verified_users}")
        
    except Exception as e:
        print(f"Error getting statistics: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    print("NeuroLearn Database Viewer")
    print("=" * 30)
    
    view_user_stats()
    view_all_users()
    
    print(f"\n{'='*60}")
    print("Database file location:")
    print("C:\\Users\\ASUS\\Neuro-learn-\\backend\\neurolearn.db")
    print(f"{'='*60}")
