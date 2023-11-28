from typing import List
from fastapi import FastAPI, HTTPException, Query, Response, status
from dotenv import load_dotenv
from pymongo import ReturnDocument
from pymongo.mongo_client import MongoClient
from bidModel import Bid, UpdateBid, BidBasicInfo
from productModel import Product
from bson import ObjectId
from fastapi.middleware.cors import CORSMiddleware
from bson.errors import InvalidId
import errors
import re

import os

app = FastAPI()

load_dotenv()
# uri of the connection
uri = os.getenv("MONGODB_URI")

# Create a new client and connect to the server
client = MongoClient(uri)

# Set the desired db
db = client.elRastro2

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


# Auxiliary function to save a bid
def save_bid(bid: BidBasicInfo, idProduct: str, idBidder: str):
    product = db.Product.find_one({"_id": ObjectId(idProduct)})
    bidder = db.User.find_one({"_id": ObjectId(idBidder)})

    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")

    if product["closeDate"] < bid["timestamp"]:
        raise HTTPException(
            status_code=400, detail="Bid cannot be placed after the close date"
        )

    if bidder is None:
        raise HTTPException(status_code=404, detail="Bidder not found")

    owner = db.User.find_one({"_id": ObjectId(product["owner"]["_id"])})

    bid["product"] = {
        "_id": product["_id"],
        "title": product["title"],
    }

    bid["owner"] = {"_id": owner["_id"], "username": owner["username"]}

    bid["bidder"] = {"_id": bidder["_id"], "username": bidder["username"]}

    new_bid = db.Bid.insert_one(bid)
    created_bid = db.Bid.find_one({"_id": new_bid.inserted_id})

    return created_bid


# Create a new bid
@app.post(
    "/" + versionRoute + "/bids/{idProduct}/{idBidder}",
    summary="Add new bid",
    response_description="Create a new bid with the desired amount",
    response_model=Bid,
    status_code=status.HTTP_201_CREATED,
    responses={422: errors.error_422, 400: errors.error_400, 404: errors.error_404},
    tags=["Bids"],
)
def create_bid(bid: BidBasicInfo, idProduct: str, idBidder: str):
    try:
        product = db.Product.find_one({"_id": ObjectId(idProduct)})
        if product is not None and product["owner"]["_id"] == ObjectId(idBidder):
            raise HTTPException(
                status_code=400, detail="Owner cannot bid on his own product"
            )

        new_bid = bid.model_dump(by_alias=True, exclude={"id"})

        if len(product["bids"]) > 0:
            last_bid = product["bids"][-1]
            if last_bid is not None and last_bid["amount"] >= new_bid["amount"]:
                raise HTTPException(
                    status_code=400, detail="Bid must be higher than the last one"
                )

        response = save_bid(new_bid, idProduct, idBidder)

        if response:
            db.Product.find_one_and_update(
                {"_id": ObjectId(response["product"]["_id"])},
                {
                    "$push": {
                        "bids": {
                            "_id": response["_id"],
                            "amount": response["amount"],
                            "timestamp": response["timestamp"],
                            "bidder": {
                                "_id": response["bidder"]["_id"],
                                "username": response["bidder"]["username"],
                            },
                        }
                    }
                },
            )

            db.User.find_one_and_update(
                {"_id": ObjectId(response["bidder"]["_id"])},
                {
                    "$push": {
                        "bids": {
                            "_id": response["_id"],
                            "amount": response["amount"],
                            "timestamp": response["timestamp"],
                            "product": {
                                "_id": response["product"]["_id"],
                                "title": response["product"]["title"],
                            },
                        }
                    }
                },
            )

            return response
        raise HTTPException(status_code=400, detail="Something went wrong")
    except InvalidId as e:
        raise HTTPException(status_code=400, detail="Invalid ObjectId format")


# Update a bid
@app.put(
    "/" + versionRoute + "/bids/{id}",
    summary="Update bid",
    response_description="Update the values of a bid",
    response_model=Bid,
    status_code=status.HTTP_200_OK,
    responses={
        404: errors.error_404,
        400: errors.error_400,
        422: errors.error_422,
    },
    tags=["Bids"],
)
def update_bid(id: str, new_bid: UpdateBid):
    try:
        if len(new_bid.model_dump(by_alias=True, exclude={"id"})) >= 1:
            update_result = db.Bid.find_one_and_update(
                {"_id": ObjectId(id)},
                {"$set": new_bid.model_dump(by_alias=True, exclude={"id"})},
                return_document=ReturnDocument.AFTER,
            )

            db.Product.find_one_and_update(
                {"bids._id": ObjectId(id)},
                {
                    "$set": {
                        "bids.$.amount": new_bid.amount,
                    }
                },
            )

            db.User.find_one_and_update(
                {"bids._id": ObjectId(id)},
                {
                    "$set": {
                        "bids.$.amount": new_bid.amount,
                    }
                },
            )

            if update_result is not None:
                return update_result
            else:
                raise HTTPException(status_code=404, detail=f"Bid {id} not found")

        if (existing_bid := db.Bid.find_one({"_id": id})) is not None:
            return existing_bid
        raise HTTPException(status_code=404, detail=f"Bid {id} not found")

    except InvalidId as e:
        raise HTTPException(status_code=400, detail="Invalid ObjectId format")


# Delete a bid
@app.delete(
    "/" + versionRoute + "/bids/{id}",
    summary="Delete a bid",
    response_description="Delete the bid from the database",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={
        204: {
            "description": "Bid deleted successfully",
            "headers": {"message": "Bid deleted successfully"},
        },
        404: errors.error_404,
        400: errors.error_400,
        422: errors.error_422,
    },
    tags=["Bids"],
)
def delete_bid(id: str):
    try:
        result = db.Bid.delete_one({"_id": ObjectId(id)})

        db.Product.update_many(
            {"bids._id": ObjectId(id)}, {"$pull": {"bids": {"_id": ObjectId(id)}}}
        )

        db.User.update_many(
            {"bids._id": ObjectId(id)}, {"$pull": {"bids": {"_id": ObjectId(id)}}}
        )

        if result.deleted_count == 1:
            return Response(
                status_code=status.HTTP_204_NO_CONTENT,
                media_type="application/json",
                headers={"message": "Bid deleted successfully"},
            )
        raise HTTPException(status_code=404, detail="Bid not found")

    except InvalidId as e:
        raise HTTPException(status_code=400, detail="Invalid ObjectId format")


# Get all bids
@app.get(
    "/" + versionRoute + "/bids",
    summary="List all bids",
    response_description="Get all bids stored, can be sorted by date (order), between a minimum and maximum price (minPrice, maxPrice), by product (product), by owner (username) or by bidder (bidder)",
    response_model=List[Bid],
    status_code=status.HTTP_200_OK,
    responses={
        422: errors.error_422,
    },
    tags=["Bids"],
)
def get_bids(
    order: int = Query(-1, description="1 for ascending, -1 for descending"),
    minPrice: float = Query(None, description="Minimum price filter"),
    maxPrice: float = Query(None, description="Maximum price filter"),
    product: str = Query("", description="Product filter"),
    username: str = Query("", description="Username filter"),
    bidder: str = Query("", description="Bidder filter"),
):
    filter_params = {}

    if minPrice is not None:
        filter_params["amount"] = {"$gte": minPrice}
    if maxPrice is not None:
        filter_params.setdefault("amount", {})["$lte"] = maxPrice
    if product:
        regex_pattern = re.compile(f".*{re.escape(product)}.*", re.IGNORECASE)
        filter_params["product.title"] = {"$regex": regex_pattern}
    if username:
        regex_pattern = re.compile(f".*{re.escape(username)}.*", re.IGNORECASE)
        filter_params["owner.username"] = {"$regex": regex_pattern}
    if bidder:
        regex_pattern = re.compile(f".*{re.escape(bidder)}.*", re.IGNORECASE)
        filter_params["bidder.username"] = {"$regex": regex_pattern}

    bids_cursor = db.Bid.find(filter_params).sort("timestamp", order)
    bids = []
    if bids_cursor is not None:
        for document in bids_cursor:
            bids.append(Bid(**document))

    return bids


# Get one bid
@app.get(
    "/" + versionRoute + "/bids/{id}",
    response_model=Bid,
    summary="Get one bid",
    response_description="Get the bid with the same id",
    status_code=status.HTTP_200_OK,
    responses={
        404: errors.error_404,
        400: errors.error_400,
        422: errors.error_422,
    },
    tags=["Bids"],
)
def get_bid(id):
    try:
        bid = db.Bid.find_one({"_id": ObjectId(id)})
        if bid:
            return Bid(**bid)
        raise HTTPException(404, "Bid not found")

    except InvalidId as e:
        raise HTTPException(status_code=400, detail="Invalid ObjectId format")


# Get the products of a bid's owner
@app.get(
    "/" + versionRoute + "/bids/{id_bid}/products/",
    summary="List all products of bid's Product's owner",
    response_description="Get all products of a user in which he's the owner of given bid id",
    response_model=List[Product],
    status_code=status.HTTP_200_OK,
    responses={400: errors.error_400, 422: errors.error_422, 404: errors.error_404},
    tags=["Bids"],
)
def get_products_by_bid(id_bid: str):
    try:
        products = []

        bid = db.Bid.find_one({"_id": ObjectId(id_bid)})

        if bid is None:
            raise HTTPException(status_code=404, detail="Bid not found")

        products_cursor = db.Bid.aggregate(
            [
                {"$match": {"_id": ObjectId(id_bid)}},
                {
                    "$lookup": {
                        "from": "Product",
                        "localField": "owner.username",
                        "foreignField": "owner.username",
                        "as": "products",
                    }
                },
                {"$unwind": "$products"},
            ]
        )
        if products_cursor is not None:
            for document in products_cursor:
                products.append(Product(**document["products"]))
            return products
        else:
            return []

    except InvalidId as e:
        raise HTTPException(status_code=400, detail="Invalid ObjectId format")
