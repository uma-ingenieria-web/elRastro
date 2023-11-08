from typing import List
from fastapi import FastAPI, HTTPException, Query, Response, status
from dotenv import load_dotenv
from pymongo import ReturnDocument
from pymongo.mongo_client import MongoClient
from bidModel import Bid, UpdateBid, BidBasicInfo
from productModel import Product
from bson import ObjectId
from bson.errors import InvalidId
import errors
import re

import os

load_dotenv()

app = FastAPI()

load_dotenv()

# uri of the connection
uri = os.getenv("MONGODB_URI")

# Create a new client and connect to the server
client = MongoClient(uri)

# Send a ping to confirm a successful connection
try:
    client.admin.command("ping")
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)

# Set the desired db
db = client.elRastro

# Show collections
print(db.list_collection_names())

versionRoute = "api/v1"


@app.get("/")
def read_root():
    return {"API": "REST"}


# Auxiliary function to save a bid
def save_bid(bid: BidBasicInfo, idProduct: str, idBidder: str):
    product = db.Product.find_one({"_id": ObjectId(idProduct)})
    owner = db.User.find_one({"_id": ObjectId(product["owner"]["_id"])})
    bidder = db.User.find_one({"_id": ObjectId(idBidder)})

    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")

    if bidder is None:
        raise HTTPException(status_code=404, detail="Bidder not found")

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
    "/" + versionRoute + "/bids/{idProduct}/{idBidder}}",
    summary="Add new bid",
    response_description="Create a new bid with the desired amount",
    response_model=Bid,
    status_code=status.HTTP_201_CREATED,
    responses={422: errors.error_422, 400: errors.error_400, 404: errors.error_404},
)
def create_bid(bid: BidBasicInfo, idProduct: str, idBidder: str):
    try:
        response = save_bid(
            bid.model_dump(by_alias=True, exclude={"id"}), idProduct, idBidder
        )

        if response:
            product = db.Product.find_one({"_id": ObjectId(response["product"]["_id"])})

            if product:
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
                            "product": {
                                "_id": response["product"]["_id"],
                                "title": response["product"]["title"],
                                "timestamp": product["timestamp"],
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
    responses={
        404: errors.error_404,
        400: errors.error_400,
        422: errors.error_422,
    },
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
    status_code=204,
    responses={
        204: {
            "description": "Bid deleted successfully",
            "headers": {"message": "Bid deleted successfully"},
        },
        404: errors.error_404,
        400: errors.error_400,
        422: errors.error_422,
    },
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
    responses={
        422: errors.error_422,
    },
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
    responses={
        404: errors.error_404,
        400: errors.error_400,
        422: errors.error_422,
    },
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
    "/" + versionRoute + "/bids/{id}/products/",
    summary="List all products of a bid's owner",
    response_description="Get all products of a bid's owner",
    response_model=List[Product],
    responses={400: errors.error_400, 422: errors.error_422, 404: errors.error_404},
)
def get_products_by_bid(id: str):
    try:
        products = []

        bid = db.Bid.find_one({"_id": ObjectId(id)})

        if bid is None:
            raise HTTPException(status_code=404, detail="Bid not found")

        products_cursor = db.Bid.aggregate(
            [
                {"$match": {"_id": ObjectId(id)}},
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
