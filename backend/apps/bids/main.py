from typing import List
from fastapi import FastAPI, HTTPException, Query, Response, status
from dotenv import load_dotenv
from pymongo import ReturnDocument
from pymongo.mongo_client import MongoClient
from bidModel import Bid
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


def save_bid(bid: Bid):
    new_bid = db.Bid.insert_one(bid)
    created_bid = db.Bid.find_one({"_id": new_bid.inserted_id})
    return created_bid


@app.post(
    "/" + versionRoute + "/bids",
    summary="Add new bid",
    response_description="Create a new bid with the desired amount",
    response_model=Bid,
    status_code=status.HTTP_201_CREATED,
    responses={422: errors.error_422},
)
def create_bid(bid: Bid):
    bid.product.id = ObjectId(bid.product.id)
    bid.owner.id = ObjectId(bid.owner.id)
    bid.bidder.id = ObjectId(bid.bidder.id)
    response = save_bid(bid.model_dump(by_alias=True, exclude={"id"}))
    
    if response:
        
        product = db.Product.find_one({"_id": ObjectId(bid.product.id)})
        
        if product:
            
            db.Product.find_one_and_update(
                {"_id": ObjectId(bid.product.id)},
                {"$push": {"bids": {
                    "_id": response["_id"],
                    "amount": response["amount"],
                    "bidder": {
                        "_id": response["bidder"]["_id"],
                        "username": response["bidder"]["username"]
                    }
                }}}
            )            
        
        db.User.find_one_and_update(
            {"_id": ObjectId(bid.bidder.id)},
            {"$push": {"bids": {
                "_id": response["_id"],
                "amount": response["amount"],
                "product": {
                    "_id": response["product"]["_id"],
                    "title": response["product"]["title"],
                    "date": product["timestamp"],
                    "buyer": product["buyer"]
                }
            }}}
        )
        
        return response
    raise HTTPException(status_code=400, detail="Something went wrong")


@app.put(
    "/" + versionRoute + "/bids/{id}",
    summary="Update bid",
    response_description="Update the values of a bid",
    response_model=Bid,
    responses={404: errors.error_404, 400: errors.error_400, 422: errors.error_422},
)
def update_bid(id: str, new_bid: Bid):
    try:
        if len(new_bid.model_dump(by_alias=True, exclude={"id"})) >= 1:
            new_bid.product.id = ObjectId(new_bid.product.id)
            new_bid.owner.id = ObjectId(new_bid.owner.id)
            new_bid.bidder.id = ObjectId(new_bid.bidder.id)
            update_result = db.Bid.find_one_and_update(
                {"_id": ObjectId(id)},
                {"$set": new_bid.model_dump(by_alias=True, exclude={"id"})},
                return_document=ReturnDocument.AFTER,
            )
            
            
            
            db.Product.find_one_and_update(
                {"bids._id": ObjectId(id)},
                {"$set": {
                    "bids.$.amount": new_bid.amount,
                    "bids.$.bidder": {
                        "_id": new_bid.bidder.id,
                        "username": new_bid.bidder.username
                    }
                }}
            )
            
            db.User.find_one_and_update(
                {"bids._id": ObjectId(id)},
                {"$set": {
                    "bids.$.amount": new_bid.amount,
                    "bids.$.product": {
                        "_id": new_bid.product.id,
                        "title": new_bid.product.title,
                        "date": new_bid.timestamp,
                        "buyer": new_bid.owner.model_dump(by_alias=True)
                    }
                }}
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
            {"bids._id": ObjectId(id)},
            {"$pull": {"bids": {"_id": ObjectId(id)}}}
        )
        
        db.User.update_many(
            {"bids._id": ObjectId(id)},
            {"$pull": {"bids": {"_id": ObjectId(id)}}}
        )
        
        if result.deleted_count == 1:
            return Response(status_code=status.HTTP_204_NO_CONTENT, media_type="application/json", headers={"message": "Bid deleted successfully"})
        raise HTTPException(status_code=404, detail="Bid not found")

    except InvalidId as e:
        raise HTTPException(status_code=400, detail="Invalid ObjectId format")


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

@app.get(
    "/" + versionRoute + "/bids/{id}/products/",
    summary="List all products of a bid's owner",
    response_description="Get all products of a bid's owner",
    response_model=List[Product],
    responses={400: errors.error_400, 422: errors.error_422},
)
def get_products_by_bid(id: str):
    try:
        products = []
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
