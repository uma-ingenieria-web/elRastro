from bson import ObjectId
from fastapi import FastAPI, Body, HTTPException, status, Query
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

@app.get(versionRoute + "/users/",
         response_description="Returns all the users",
         summary="Find a user list",
         tags=["User"])
async def get_users(page: int = Query(1, ge=1), page_size: int = Query(10, le=20)):
    skip = (page - 1) * page_size
    users = db.find().skip(skip).limit(page_size)
    return users

@app.get("/" + versionRoute + "/user/{id}",
        response_description="The user with the given id",
        summary="Find a user with a certain id",
        status_code=status.HTTP_200_OK,
        tags=["User"])
async def read_user(id: str):
    user = db.find_one({"_id": ObjectId(id)})
    
    if user is not None:
        user['_id'] = str(user['_id'])
        return user
    else:
        raise HTTPException(status_code=404, detail=f"User {id} not found")
    

@app.get("/" + versionRoute + "/user/{user_id}/products",
        response_description="Finds the user products sorted by date",
        summary="Get the user products",
        status_code=status.HTTP_200_OK,
        tags=["User"])
async def get_user_products(user_id: str):
    user = db.aggregate([
    {
        "$match": { "_id": ObjectId(user_id) }
    },
    {
        "$project": {
            "_id": 0,
            "products": 1,
        }
    },
    {
        "$unwind": "$products"
    },
    {
        "$sort": { "products.date": -1 }
    },
    {
        "$group": {
            "_id": "$_id",
            "products": { "$push": "$products" }
        }
    }
    ])
    if user is not None:
        user_products = user.next()["products"]
        for product in user_products:
            product['_id'] = str(product['_id'])
        return user_products
    else:
        raise HTTPException(status_code=404, detail=f"User {id} not found")

@app.post("/" + versionRoute + "/user", 
        status_code=status.HTTP_201_CREATED,
        response_description="Create a user",
        tags=["User"])
async def create_user(user: userModel.CreateUser = Body(...)):
    db.insert_one(user.model_dump(by_alias=True, exclude=["id"]))
    
@app.put("/" + versionRoute + "/user/{id}",
         status_code=status.HTTP_200_OK,
         response_description="Update a user",
         tags=["User"])
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

@app.delete("/" + versionRoute + "/user/{id}",
        status_code=status.HTTP_204_NO_CONTENT,
        response_description="Delete a user",
        tags=["User"])
async def delete_user(id: str):
    result = db.delete_one({"_id": ObjectId(id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail=f"User {id} not found")
    else:
        return None
