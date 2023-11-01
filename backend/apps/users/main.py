from fastapi import FastAPI, Body, HTTPException, status
from dotenv import load_dotenv
from bson import ObjectId
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

@app.get("/" + versionRoute + "/user/{id}",
        response_description="The user with the given id",
        summary="Find a user with a certain id",
        status_code=status.HTTP_200_OK,)
async def read_user(id: str):
    user = db.find_one({"_id": ObjectId(id)})
    
    if user is not None:
        user['_id'] = str(user['_id'])
        return user
    else:
        raise HTTPException(status_code=404, detail=f"User {id} not found")


@app.post("/" + versionRoute + "/user",
        status_code=status.HTTP_201_CREATED,)
async def create_user(user: userModel.CreateUser = Body(...)):
    db.insert_one(user.model_dump(by_alias=True, exclude=["id"]))


@app.delete("/" + versionRoute + "/user/{id}",
        status_code=status.HTTP_204_NO_CONTENT,)
async def create_user(id: str):
    result = db.delete_one({"_id": ObjectId(id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail=f"User {id} not found")
    else:
        return None
