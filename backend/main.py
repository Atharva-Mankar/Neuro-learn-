from fastapi import FastAPI, Depends, HTTPException, File, UploadFile, status, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import timedelta
import uvicorn
import numpy as np
import cv2
import os

# ---------------- Import your local modules ----------------
from database import engine, get_db
from models import Base, User
from schemas import UserCreate, UserLogin, UserResponse, Token
from auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    get_current_user
)
from neuro_ai import extract_eye_features, predict_from_eye_data


# ---------------- Initialize Database ----------------
os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"
Base.metadata.create_all(bind=engine)


# ---------------- FastAPI App ----------------
app = FastAPI(title="NeuroLearn API", version="2.0.0")

# ---------------- CORS FIX ----------------
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Fallback handler for browsers sending OPTIONS preflight
@app.options("/{path:path}")
async def preflight_handler(path: str, request: Request):
    return {"ok": True}


# ---------------- ROUTES ----------------
@app.get("/")
async def root():
    return {"message": "Welcome to NeuroLearn API Backend!"}


@app.post("/register", response_model=UserResponse)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    try:
        db_user = db.query(User).filter(User.email == user.email).first()
        if db_user:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

        db_username = db.query(User).filter(User.username == user.username).first()
        if db_username:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already taken")

        hashed_password = get_password_hash(user.password)
        db_user = User(
            email=user.email,
            username=user.username,
            hashed_password=hashed_password,
            full_name=user.full_name
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    except Exception as e:
        print(f"❌ Register error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


@app.post("/login", response_model=Token)
async def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    try:
        user = db.query(User).filter(User.email == user_credentials.email).first()
        if not user or not verify_password(user_credentials.password, user.hashed_password):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")

        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer"}
    except Exception as e:
        print(f"❌ Login error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


@app.get("/users/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user


@app.get("/health")
async def health_check():
    return {"status": "healthy", "database": "connected"}


@app.post("/analyze_eye")
async def analyze_eye(file: UploadFile = File(...)):
    contents = await file.read()
    np_img = np.frombuffer(contents, np.uint8)
    frame = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

    landmarks = extract_eye_features(frame)
    if landmarks is None:
        return {"error": "No face detected"}

    result = predict_from_eye_data(landmarks)
    return result


# ---------------- RUN ----------------
if __name__ == "__main__":
    print("🚀 NeuroLearn Backend Starting on 127.0.0.1:8000 ...")
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
