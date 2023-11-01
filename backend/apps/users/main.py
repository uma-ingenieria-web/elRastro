from typing import Union
from fastapi import FastAPI, Body, HTTPException, status
from dotenv import load_dotenv
from pymongo.mongo_client import MongoClient

import os
import userModel

app = FastAPI()

load_dotenv()

# load_dotenv()
uri = os.getenv('MONGODB_URI')

# Create a new client and connect to the server
client = MongoClient(uri)

# Set the desired db
db = client.elRastro.User

versionRoute = "api/v1"

@app.get("/" + versionRoute + "/users/{user_id}")
async def read_root():
    return {"Hello": "World"}


@app.post("/" + versionRoute + "/users",
        status_code=status.HTTP_201_CREATED,)
async def create_user(user: userModel.CreateUser = Body(...)):
    db.insert_one(user.model_dump(by_alias=True, exclude=["id"]))
    


@app.get("/items/{item_id}")
async def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}