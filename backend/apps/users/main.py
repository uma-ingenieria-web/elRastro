from typing import Union
from bson import ObjectId
from fastapi import FastAPI, Body, HTTPException, status
from dotenv import load_dotenv
from pymongo import ReturnDocument
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

@app.post("/" + versionRoute + "/users", status_code=status.HTTP_201_CREATED, response_description="Create a user")
async def create_user(user: userModel.CreateUser = Body(...)):
    db.insert_one(user.model_dump(by_alias=True, exclude=["id"]))
    
@app.put("/" + versionRoute + "/users/{id}", status_code=status.HTTP_200_OK, response_description="Update a user")
async def update_user(id: str, user: userModel.UpdateUser = Body(...)):
    user = {
        u: v for u, v in user.model_dump(by_alias=True).items() if v is not None
    }

    if len(user) >= 1:
        update_result = db.find_one_and_update(
            {"_id": ObjectId(id)},
            {"$set": user},
            return_document=ReturnDocument.AFTER,
        )
        if update_result is not None:
            update_result['_id'] = str(update_result['_id'])
            return update_result
        else:
            raise HTTPException(status_code=404, detail=f"User {id} not found")
    else:
        raise HTTPException(status_code=400, detail=f"No fields specfied")