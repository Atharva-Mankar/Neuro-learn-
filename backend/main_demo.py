from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
from jose import JWTError, jwt
from typing import Optional
import uuid

app = FastAPI(title="NeuroLearn Demo API", version="1.0.0")

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT Configuration
SECRET_KEY = "demo_secret_key_for_neurolearn_do_not_use_in_production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# In-memory storage for demo
demo_users = {
    "demo@example.com": {
        "email": "demo@example.com",
        "password": "password123",
        "name": "Demo User"
    },
    "google_user@example.com": {
        "email": "google_user@example.com", 
        "name": "Google User"
    },
    "twitter_user@example.com": {
        "email": "twitter_user@example.com",
        "name": "Twitter User"
    }
}

# In-memory storage for password reset tokens
reset_tokens = {}

# Pydantic models
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    email: str
    name: str

class ForgotPasswordResponse(BaseModel):
    message: str
    reset_link: str

class ResetPasswordResponse(BaseModel):
    message: str

# Utility functions
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_demo_token_response(email: str, name: str):
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": email, "name": name}, 
        expires_delta=access_token_expires
    )
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": {"email": email, "name": name}
    }

@app.get("/")
async def root():
    return {"message": "NeuroLearn Demo API - Authentication endpoints ready!"}

@app.post("/login")
async def demo_login(login_data: LoginRequest):
    """Demo login endpoint - checks seeded user credentials"""
    user = demo_users.get(login_data.email)
    
    if not user or user.get("password") != login_data.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return create_demo_token_response(user["email"], user["name"])

@app.post("/forgot-password", response_model=ForgotPasswordResponse)
async def demo_forgot_password(request: ForgotPasswordRequest):
    """Demo forgot password - generates reset token and link"""
    
    # Generate UUID token
    reset_token = str(uuid.uuid4())
    
    # Store token in memory (in real app, would be in database with expiry)
    reset_tokens[reset_token] = {
        "email": request.email,
        "created_at": datetime.utcnow(),
        "used": False
    }
    
    # Generate reset link (for frontend)
    reset_link = f"http://localhost:5173/reset-password?token={reset_token}"
    
    return ForgotPasswordResponse(
        message="Password reset link generated (demo mode - no email sent)",
        reset_link=reset_link
    )

@app.post("/reset-password", response_model=ResetPasswordResponse)
async def demo_reset_password(request: ResetPasswordRequest):
    """Demo reset password - validates token and updates password"""
    
    # Check if token exists
    token_data = reset_tokens.get(request.token)
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    # Check if token was already used
    if token_data["used"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset token has already been used"
        )
    
    # Check if token is expired (1 hour demo expiry)
    if datetime.utcnow() - token_data["created_at"] > timedelta(hours=1):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset token has expired"
        )
    
    # Update password in memory (in real app, would update database)
    email = token_data["email"]
    if email in demo_users:
        demo_users[email]["password"] = request.new_password
    
    # Mark token as used
    reset_tokens[request.token]["used"] = True
    
    return ResetPasswordResponse(message="Password successfully updated")

@app.get("/auth/google/demo")
async def demo_google_login():
    """Demo Google OAuth - returns JWT with Google user data"""
    google_user = demo_users["google_user@example.com"]
    return create_demo_token_response(google_user["email"], google_user["name"])

@app.get("/auth/twitter/demo")
async def demo_twitter_login():
    """Demo Twitter OAuth - returns JWT with Twitter user data"""
    twitter_user = demo_users["twitter_user@example.com"]
    return create_demo_token_response(twitter_user["email"], twitter_user["name"])

@app.get("/verify-token")
async def verify_token(token: str):
    """Endpoint to verify JWT token validity"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        name: str = payload.get("name")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return {"email": email, "name": name, "valid": True}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.get("/health")
async def health_check():
    return {
        "status": "healthy", 
        "demo_mode": True,
        "available_endpoints": [
            "POST /login",
            "POST /forgot-password", 
            "POST /reset-password",
            "GET /auth/google/demo",
            "GET /auth/twitter/demo"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)