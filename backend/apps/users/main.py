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
db = client.elRastro

versionRoute = "api/v1"


@app.get(versionRoute + "/users/",
         response_description="Returns all the users",
         summary="Find a user list",
         tags=["User"])
async def get_users(page: int = Query(1, ge=1), page_size: int = Query(10, le=20)):
    skip = (page - 1) * page_size
    users = db.User.find().skip(skip).limit(page_size)
    return users


@app.get("/" + versionRoute + "/user/{id}",
         response_description="The user with the given id",
         response_model=userModel.UserBasicInfo,
         summary="Find a user with a certain id",
         status_code=status.HTTP_200_OK,
         tags=["User"])
async def read_user(id: str):
    user = db.User.find_one({"_id": ObjectId(id)})

    if user is not None:
        return user
    else:
        raise HTTPException(status_code=404, detail=f"User {id} not found")


@app.get("/" + versionRoute + "/user/username/{username}/",
         response_description="The user with the given username",
         summary="Find the user with the given username",
         status_code=status.HTTP_200_OK,
         tags=["User"],
         response_model=userModel.UserBasicInfo)
async def read_user_username(username: str):
    user = db.User.find_one({"username": username})

    if user is not None:
        return user
    else:
        raise HTTPException(
            status_code=404, detail=f"User {username} not found")


@app.get("/" + versionRoute + "/user/{user_id}/products",
         response_description="Finds the user products sorted by date",
         response_model=userModel.ProductCollection,
         summary="Get the user products",
         status_code=status.HTTP_200_OK,
         tags=["User"])
async def get_user_products(user_id: str):
    user = db.User.aggregate([
        {
            "$match": {"_id": ObjectId(user_id)}
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
            "$sort": {"products.date": -1}
        },
        {
            "$group": {
                "_id": "$_id",
                "products": {"$push": "$products"}
            }
        }
    ])
    if user is not None:
        user_products = user.next()["products"]
        return {"products": user_products}
    else:
        raise HTTPException(status_code=404, detail=f"User {id} not found")


@app.post("/" + versionRoute + "/user",
          status_code=status.HTTP_201_CREATED,
          response_description="Create a user",
          tags=["User"])
async def create_user(user: userModel.CreateUser = Body(...)):
    result = db.User.insert_one(user.model_dump(by_alias=True, exclude=["id"]))
    if result.inserted_id is not None:
        return result.inserted_id
    else:
        raise HTTPException(status_code=404, detail=f"User could not be created")
    

@app.put("/" + versionRoute + "/user/{id}",
         status_code=status.HTTP_200_OK,
         response_description="Update a user",
         tags=["User"],
         response_model=userModel.UserBasicInfo)
async def update_user(id: str, user: userModel.UpdateUser = Body(...)):
    userOptions = {
        k: v for k, v in user.model_dump(by_alias=True).items() if v is not None
    }
    print(userOptions)
    if len(userOptions) >= 1:
        update_result = db.User.find_one_and_update(
            {"_id": ObjectId(id)},
            {"$set": userOptions},
            return_document=ReturnDocument.AFTER,
        )
        db.User.update_many(
            {"products.buyer._id": ObjectId(id)},
            {"$set": {"products.buyer.username": user.username}}
        )
        client.db.Product.update_many(
            {"owner._id": ObjectId(id)},
            {"$set": {"owner.username": user.username, "owner.location": user.location}}
        )
        client.db.Product.update_many(
            {"buyer._id": ObjectId(id)},
            {"$set": {"buyer.username": user.username}}
        )
        client.db.Product.update_many(
            {"bids.bidder._id": ObjectId(id)},
            {"$set": {"bids.bidder.username": user.username}}
        )
        client.db.Bid.update_many(
            {"owner._id": ObjectId(id)},
            {"$set": {"owner.username": user.username}}
        )
        client.db.Bid.update_many(
            {"bidder._id": ObjectId(id)},
            {"$set": {"bidder.username": user.username}}
        )
        if update_result is not None:
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
    result = db.User.delete_one({"_id": ObjectId(id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail=f"User {id} not found")
    else:
        return None


@app.get("/" + versionRoute + "/user/{username}/buyers",
         response_description="Finds the user's products buyers",
         response_model=userModel.UserBasicInfoCollection,
         summary="Get the user's products buyers",
         status_code=status.HTTP_200_OK,
         tags=["User"])
async def get_user_buyers(username: str):
    user = db.User.aggregate([
        {
            "$match": {"username": username}
        },
        {
            "$project": {
                "_id": 0,
                "products.buyer": 1
            }
        },
        {
            "$unwind": "$products"
        },
        {
            "$group": {
                "_id": "$_id",
                "buyers": {"$push": "$products.buyer"}
            }
        }
    ])
    if user is not None:
        return {"users": user.next()["buyers"]}
    else:
        raise HTTPException(status_code=404, detail=f"User {id} not found")