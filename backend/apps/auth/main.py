from fastapi import FastAPI, Body, HTTPException, status, Query
from dotenv import load_dotenv
from pymongo.mongo_client import MongoClient
from bson.errors import InvalidId
from fastapi.middleware.cors import CORSMiddleware
from pymongo.errors import DuplicateKeyError
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from datetime import datetime, timedelta

from userModel import User, JwtInfo

import jwt
import random
import os

app = FastAPI()

load_dotenv()
uri = os.getenv('MONGODB_URI')

# Create a new client and connect to the server
client = MongoClient(uri)

# Set the desired db
db = client.elRastro

versionRoute = "api/v1"

origins = [
    "http://localhost:3000",
    "http://frontend:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"API": "REST"}

@app.post("/" + versionRoute + "/auth/jwt")
async def generate_jwt_token(account: JwtInfo):
    user_found = db.User.find_one({"email": account.email})
    id = None
    if user_found is None:
        username_suffix = '#' + ''.join((random.choice('abcdxyzpqr') for i in range(5)))
        user_found = db.User.insert_one(User(username=account.username + username_suffix, email=account.email, location={"lat": 0, "lon": 0}, rating=[]).model_dump(by_alias=True, exclude=["id"]))
        id = str(user_found.inserted_id)
    else:
        id = str(user_found['_id'])
    payload = {
        "sub": id,
        "exp": datetime.utcnow() + timedelta(days=1),
    }
    jwt_token = jwt.encode(payload, os.getenv('JWT_SECRET'), algorithm="HS256")

    return JSONResponse(content=jsonable_encoder({"jwt": jwt_token, "id": id}))

@app.post("/" + versionRoute + "/auth/verify")
async def validate_jwt_token(jwt: str):
    try:
        payload = jwt.decode(jwt, os.getenv('JWT_SECRET'), algorithms=["HS256"])
        return JSONResponse(content=jsonable_encoder({"valid": True}))
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Signature has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
