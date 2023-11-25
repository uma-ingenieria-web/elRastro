from typing import List
from fastapi import FastAPI, HTTPException, Query, Response, status
from dotenv import load_dotenv
from pymongo import ReturnDocument
from pymongo.mongo_client import MongoClient
from fastapi.middleware.cors import CORSMiddleware
from bson import ObjectId
from bson.errors import InvalidId
from ratingModel import Rating, RatingBasicInfo
import errors
import os

app = FastAPI()

load_dotenv()
# uri of the connection
uri = os.getenv("MONGODB_URI")

# Create a new client and connect to the server
client = MongoClient(uri)

# Set the desired db
db = client.elRastro

versionRoute = "api/v2"

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


# Get all ratings of an user
@app.get(
    "/" + versionRoute + "/users/{id}/ratings",
    summary="List all ratings of an user",
    response_description="List all ratings of an user stored in the database",
    response_model=List[Rating],
    status_code=status.HTTP_200_OK,
    responses={
        422: errors.error_422,
    },
    tags=["Ratings"],
)
def get_ratings(id: str):
    try:
        user = db.User.find_one({"_id": ObjectId(id)})

        if user is None:
            raise HTTPException(status_code=404, detail=f"User {id} not found")

        ratings = []

        if "ratings" in user:
            for rating in user["ratings"]:
                ratings.append(Rating(**rating))

        return ratings

    except InvalidId:
        raise HTTPException(400, "Invalid Id")


# Auxiliarity function to insert a new algo
def insert_rating(new_rating: RatingBasicInfo, product_id: str, user_id: str):
    try:
        product = db.Product.find_one({"_id": ObjectId(product_id)})
        user = db.User.find_one({"_id": ObjectId(user_id)})

        if product is None:
            raise HTTPException(
                status_code=404, detail=f"Product {product_id} not found"
            )

        if product["buyer"] is None:
            raise HTTPException(
                status_code=400, detail=f"Product {product_id} has no buyer"
            )

        buyer_id = product["buyer"]["_id"]
        owner_id = product["owner"]["_id"]

        if buyer_id != ObjectId(user_id) and owner_id != ObjectId(user_id):
            raise HTTPException(
                status_code=400,
                detail=f"User {user_id} is not the buyer nor the owner of the product {product_id}",
            )

        if new_rating["value"] < 0 or new_rating["value"] > 5:
            raise HTTPException(
                status_code=400, detail=f"Rating value must be between 0 and 5"
            )

        if buyer_id == ObjectId(user_id):
            rated_id = owner_id
        else:
            rated_id = buyer_id

        new_rating["product"] = {"_id": ObjectId(product_id)}
        new_rating["user"] = {"_id": ObjectId(user_id), "username": user["username"]}

        existing_rating = db.User.find_one(
            {
                "_id": ObjectId(rated_id),
                "ratings.product._id": ObjectId(product_id),
                "ratings.user._id": ObjectId(user_id),
            }
        )

        if existing_rating is not None:
            raise HTTPException(
                status_code=400,
                detail=f"User has already rated the user for the product",
            )

        result = db.User.update_one(
            {"_id": ObjectId(rated_id)}, {"$push": {"ratings": new_rating}}
        )

        if result.modified_count == 1:
            return new_rating
        else:
            raise HTTPException(status_code=400, detail="Something went wrong")

    except InvalidId:
        raise HTTPException(400, "Invalid id")


# Insert
@app.put(
    "/" + versionRoute + "/users/{product_id}/{user_id}/ratings",
    summary="Insert a new rating for an user",
    response_description="Create a new rating and store it in the database",
    response_model=Rating,
    status_code=status.HTTP_201_CREATED,
    responses={422: errors.error_422, 400: errors.error_400, 404: errors.error_404},
    tags=["Ratings"],
)
def create_rating(product_id: str, user_id: str, rating: RatingBasicInfo):
    response = insert_rating(
        rating.model_dump(by_alias=True, exclude={"id"}), product_id, user_id
    )

    if response:
        return response
    raise HTTPException(status_code=400, detail="Something went wrong")


# Gets the overall rating of an user
@app.get(
    "/" + versionRoute + "/users/{id}/rating",
    summary="Get the overall rating of an user",
    response_description="Get the overall rating of an user stored in the database",
    response_model=float,
    status_code=status.HTTP_200_OK,
    responses={
        422: errors.error_422,
    },
    tags=["Ratings"],
)
def get_overall_rating(id: str):
    try:
        
        pipeline = [
            {"$match": {"_id": ObjectId(id)}},
            {
                "$project": {
                    "_id": 0,
                    "ratings": 1,
                }
            },
            {"$unwind": "$ratings"},
            {"$group": {"_id": "$_id", "mean": {"$avg": "$ratings.value"}}},
        ]

        user = db.User.aggregate(pipeline)

        if user is None:
            raise HTTPException(status_code=404, detail=f"User {id} not found")

        return user.next()["mean"]

    except InvalidId:
        raise HTTPException(400, "Invalid Id")
