from typing import Union
from fastapi import FastAPI, HTTPException, Response, status
from dotenv import load_dotenv
from pymongo import ReturnDocument
from pymongo.mongo_client import MongoClient
from bidModel import Bid
from bson import ObjectId
from bson.errors import InvalidId

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
    craeted_bid = db.Bid.find_one({"_id": new_bid.inserted_id})
    return craeted_bid


@app.post(
    "/" + versionRoute + "/bids",
    summary="Add new bid",
    response_description="Create a new bid with the desired amount",
    response_model=Bid,
    status_code=status.HTTP_201_CREATED,
)
def craete_bid(bid: Bid):
    response = save_bid(bid.model_dump())
    if response:
        return response
    raise HTTPException(status_code=400, detail="Something went wrong")


@app.put(
    "/" + versionRoute + "/bids/{id}",
    summary="Update bid",
    response_description="Update the values of a bid",
    response_model=Bid,
)
def update_bid(id: str, new_bid: Bid):
    try:
        if len(new_bid.model_dump()) >= 1:
            update_result = db.Bid.find_one_and_update(
                {"_id": ObjectId(id)},
                {"$set": new_bid.model_dump()},
                return_document=ReturnDocument.AFTER,
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
)
def delete_bid(id: str):
    try:
        result = db.Bid.delete_one({"_id": ObjectId(id)})
        if result.deleted_count == 1:
            return Response(status_code=status.HTTP_204_NO_CONTENT)
        raise HTTPException(status_code=404, detail="Bid not found")

    except InvalidId as e:
        raise HTTPException(status_code=400, detail="Invalid ObjectId format")

@app.get(
    "/" + versionRoute + "/bids",
    summary="List all bids",
    response_description="Get all bids stored",
)
def get_bids():
    bids = []
    bids_cursor = db.Bid.find({})
    if bids_cursor is not None:
        for document in bids_cursor:
            bids.append(Bid(**document))
        return bids
    else:
        return []


@app.get(
    "/" + versionRoute + "/bids/{id}",
    response_model=Bid,
    summary="Get one bid",
    response_description="Get the bid with the same id",
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
    "/" + versionRoute + "/bids/price/",
    summary="List all bids in a price range",
    response_description="Get all bids stored that are in the price range if specified",
)
def get_bids_by_price(minPrice: float = None, maxPrice: float = None):
    bids = []
    
    if minPrice is not None and maxPrice is not None:
        bids_cursor = db.Bid.find({"amount": {"$gte": minPrice, "$lte": maxPrice}})
    elif minPrice is not None:
        bids_cursor = db.Bid.find({"amount": {"$gte": minPrice}})
    elif maxPrice is not None:
        bids_cursor = db.Bid.find({"amount": {"$lte": maxPrice}})
    else:
        bids_cursor = db.Bid.find({})

    if bids_cursor is not None:
        for document in bids_cursor:
            bids.append(Bid(**document))
        return bids
    else:
        return []

@app.get(
    "/" + versionRoute + "/bids/date/",
    summary="List all bids sorted by date",
    response_description="Get all bids stored sorted by date",
)
def get_bids_by_date(order: int = -1):
    bids = []
    bids_cursor = db.Bid.find({}).sort("timestamp", order)
    if bids_cursor is not None:
        for document in bids_cursor:
            bids.append(Bid(**document))
        return bids
    else:
        return []


@app.get(
    "/" + versionRoute + "/bids/product/{name}",
    summary="List bids of a product",
    response_description="Get all bids stored whose product matches a certain name",
)
def get_bids_by_name(name: str):
    bids = []
    bids_cursor = db.Bid.find({"product.name": {"$regex": name, "$options": "i"}})
    if bids_cursor is not None:
        for document in bids_cursor:
            bids.append(Bid(**document))
        return bids
    else:
        return []


@app.get(
    "/" + versionRoute + "/bids/owner/{username}",
    summary="List all bids of a user",
    response_description="Get all bids stored whose owner matches a certain username",
)
def get_bids_by_username(username: str):
    bids = []
    bids_cursor = db.Bid.find({"owner.username": {"$regex": username, "$options": "i"}})
    if bids_cursor is not None:
        for document in bids_cursor:
            bids.append(Bid(**document))
        return bids
    else:
        return []
