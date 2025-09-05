from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# User registration schema
class UserCreate(BaseModel):
    email: str
    username: str
    password: str
    full_name: Optional[str] = None

# User login schema
class UserLogin(BaseModel):
    email: str
    password: str

# User response schema
class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    full_name: Optional[str] = None
    is_active: bool
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Token schema
class Token(BaseModel):
    access_token: str
    token_type: str

# Token data schema
class TokenData(BaseModel):
    email: Optional[str] = None
