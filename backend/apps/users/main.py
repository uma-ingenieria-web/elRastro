from bson import ObjectId
from fastapi import Depends, FastAPI, Body, HTTPException, Header, status, Query
from dotenv import load_dotenv
import httpx
from pymongo import ReturnDocument
from pymongo.mongo_client import MongoClient
from bson.errors import InvalidId
from fastapi.middleware.cors import CORSMiddleware
from pymongo.errors import DuplicateKeyError

import os
import json

import userModel
import errors

app = FastAPI()

load_dotenv()
uri = os.getenv('MONGODB_URI')

# Create a new client and connect to the server
client = MongoClient(uri)

# Set the desired db
db = client.elRastro2

versionRoute = "api/v1"

origins = [
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def get_token(authorization: str = Header(...)):
    scheme, token = authorization.split()
    if scheme.lower() != "bearer":
        raise HTTPException(status_code=403, detail="Invalid authentication scheme")
    try:
        async with httpx.AsyncClient() as client:
            url = os.getenv("AUTH_URL")
            headers = {"Content-Type": "application/json", "Authorization": f"Bearer {token}"}
            response = await client.post(url, headers=headers)

            if response.status_code == 200:
                json_content = response.text
                return json.loads(json_content)
            else:
                return False
    except Exception:
        return False


@app.get("/")
def read_root():
    return {"API": "REST"}


@app.get("/" + versionRoute + "/users/",
         summary="Find a user list",
         response_description="Returns all the users",
         response_model=userModel.UserBasicInfoCollection,
         status_code=status.HTTP_200_OK,
         tags=["User"])
async def get_users(page: int = Query(1, ge=1), page_size: int = Query(10, le=20)):
    skip = (page - 1) * page_size
    users = db.User.find(None, {"username": 1}).skip(skip).limit(page_size)
    return {"users": list(users)}



@app.get("/" + versionRoute + "/user/me",
         summary="Get information for the sender user",
         response_description="The user with the given id and location details",
         response_model=userModel.UserPersonalInfo,
         status_code=status.HTTP_200_OK,
         responses={404: errors.error_404, 422: errors.error_422},
         tags=["User"])
async def read_user_me(token: dict = Depends(get_token)):
    if not token:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    try:
        user = db.User.find_one({"_id": ObjectId(token["id"])})
    except InvalidId:
            raise HTTPException(status_code=422, detail=f"User id is invalid") 
    if user is not None:
        return user
    else:
        raise HTTPException(status_code=404, detail=f"User not found")

@app.get("/" + versionRoute + "/user/{id}",
         summary="Find a user with a certain id",
         response_description="The user with the given id",
         response_model=userModel.UserBasicInfo,
         status_code=status.HTTP_200_OK,
         responses={404: errors.error_404, 422: errors.error_422},
         tags=["User"])
async def read_user(id: str):
    try:
        user = db.User.find_one({"_id": ObjectId(id)})
    except InvalidId:
            raise HTTPException(status_code=422, detail=f"User id is invalid") 
    if user is not None:
        return user
    else:
        raise HTTPException(status_code=404, detail=f"User {id} not found")
    

@app.get("/" + versionRoute + "/user/username/{username}/",
         summary="Find the user with the given username",
         response_description="The user with the given username",
         response_model=userModel.UserBasicInfo,
         status_code=status.HTTP_200_OK,
         responses={400: errors.error_400, 404: errors.error_404},
         tags=["User"])
async def read_user_username(username: str):
    user = db.User.find_one({"username": username})

    if user is not None:
        return user
    else:
        raise HTTPException(
            status_code=404, detail=f"User {username} not found")


@app.get("/" + versionRoute + "/user/{user_id}/products",
         summary="Get the user products",
         response_description="Finds the user products sorted by date",
         response_model=userModel.ProductCollection,
         status_code=status.HTTP_200_OK,
         responses={400: errors.error_400, 404: errors.error_404, 422: errors.error_422},
         tags=["User"])

async def get_user_products(user_id: str):
    try:
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
                "$sort": {"products.closeDate": -1}
            },
            {
                "$group": {
                    "_id": "$_id",
                    "products": {"$push": "$products"}
                }
            }
        ])
    except InvalidId:
        raise HTTPException(status_code=422, detail=f"User id is invalid") 

    if user is not None:
        user_products = user.next()["products"]
        return {"products": user_products}
    else:
        raise HTTPException(status_code=404, detail=f"User {id} not found")


""" @app.post("/" + versionRoute + "/user",
          summary="Create a user",
          response_description="User created",
          status_code=status.HTTP_201_CREATED,
          responses={409: errors.error_409},
          tags=["User"])
async def create_user(user: userModel.CreateUser = Body(...)):
    try:
        result = db.User.insert_one(user.model_dump(by_alias=True, exclude=["id"]))
    except DuplicateKeyError:
        raise HTTPException(status_code=409, detail=f"Username already taken")
    if result.inserted_id is not None:
        return str(result.inserted_id)
    else:
        raise HTTPException(status_code=404, detail=f"User could not be created")
     """

@app.put("/" + versionRoute + "/user",
         summary="Update user's field",
         status_code=status.HTTP_201_CREATED,
         response_description="Update username of a user ",
         response_model=userModel.UserBasicInfo,
         tags=["User"])
async def update_user(user: userModel.UpdateUser = Body(...), token: dict = Depends(get_token)):
    if not token:
        raise HTTPException(status_code=401, detail="Invalid token")
    id = token["id"]

    userOptions = {}
    model_dump = user.model_dump(by_alias=True)

    for k, v in model_dump.items():
        if v is not None:
            if isinstance(v, dict):
                for sub_key, sub_value in v.items():
                    userOptions[f"{k}.{sub_key}"] = sub_value
            else:
                userOptions[k] = v
    try:
        if len(userOptions) >= 1:
            update_result = db.User.find_one_and_update(
                {"_id": ObjectId(id)},
                {"$set": userOptions},
                return_document=ReturnDocument.AFTER,
            )
            update_users(id, user)
            
            if update_result is not None:
                return update_result
            else:
                raise HTTPException(status_code=404, detail=f"User {id} not found")
        else:
            raise HTTPException(status_code=400, detail=f"No fields specfied")
    except HTTPException as err:
        raise err
    except DuplicateKeyError:
        raise HTTPException(status_code=409, detail=f"Username already taken")
    except InvalidId:
        raise HTTPException(status_code=422, detail=f"User id is invalid")

def update_users(id, user : userModel.UpdateUser):
    if user.username:
        db.User.update_many(
            {"products.buyer._id": ObjectId(id)},
            {"$set": {"products.buyer.username": user.username}}
        )
        db.Product.update_many(
            {"bids.bidder._id": ObjectId(id)},
            {"$set": {"bids.bidder.username": user.username}}
        )
        db.Bid.update_many(
            {"owner._id": ObjectId(id)},
            {"$set": {"owner.username": user.username}}
        )
        db.Bid.update_many(
            {"bidder._id": ObjectId(id)},
            {"$set": {"bidder.username": user.username}}
        )
    if user.username or user.location:
        update_owner(id, user)
        update_buyer(id, user)

def update_buyer(id, user):
    update_query_buyer = {}
    if user.username:
        update_query_buyer["buyer.username"] = user.username
    if user.location:
        update_query_buyer["buyer.location.lat"] = user.location.lat
        update_query_buyer["buyer.location.lon"] = user.location.lon
    db.Product.update_many(
            {"buyer._id": ObjectId(id)},
            {"$set": update_query_buyer}
        )

def update_owner(id, user):
    update_query_owner = {}
    if user.username:
        update_query_owner["owner.username"] = user.username
    if user.location:
        update_query_owner["owner.location.lat"] = user.location.lat
        update_query_owner["owner.location.lon"] = user.location.lon
    db.Product.update_many(
            {"owner._id": ObjectId(id)},
            {"$set": update_query_owner}
        )


""" @app.delete("/" + versionRoute + "/user/{id}",
            summary="Delete a user",
            response_description="Delete a user",
            status_code=status.HTTP_204_NO_CONTENT,
            responses={404: errors.error_404},
            tags=["User"])
async def delete_user(id: str, token: dict = Depends(get_token)):
    if not token:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    try:
        result = db.User.delete_one({"_id": ObjectId(id)})
    except InvalidId:
        raise HTTPException(status_code=422, detail=f"User id is invalid")
    if result.deleted_count != 0:
        return None
    else:
        raise HTTPException(status_code=404, detail=f"User {id} not found")
 """

@app.get("/" + versionRoute + "/user/{username}/buyers",
         summary="Get the user's products buyers",
         response_description="Finds the user's products buyers",
         response_model=userModel.UserBasicInfoCollection,
         status_code=status.HTTP_200_OK,
         responses={404: errors.error_404},
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