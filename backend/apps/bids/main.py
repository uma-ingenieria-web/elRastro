from typing import List
from fastapi import FastAPI, HTTPException, Response, status
from dotenv import load_dotenv
from pymongo import ReturnDocument
from pymongo.mongo_client import MongoClient
from bidModel import Bid
from productModel import Product
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
    created_bid = db.Bid.find_one({"_id": new_bid.inserted_id})
    return created_bid


@app.post(
    "/" + versionRoute + "/bids",
    summary="Add new bid",
    response_description="Create a new bid with the desired amount",
    response_model=Bid,
    status_code=status.HTTP_201_CREATED,
)
def create_bid(bid: Bid):
    bid.product.id = ObjectId(bid.product.id)
    bid.owner.id = ObjectId(bid.owner.id)
    response = save_bid(bid.model_dump(by_alias=True, exclude={"id"}))
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
        if len(new_bid.model_dump(by_alias=True, exclude={'id'})) >= 1:
            new_bid.product.id = ObjectId(new_bid.product.id)
            new_bid.owner.id = ObjectId(new_bid.owner.id)
            update_result = db.Bid.find_one_and_update(
                {"_id": ObjectId(id)},
                {"$set": new_bid.model_dump(by_alias=True, exclude={'id'})},
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
    response_description="Get all bids stored, can be sorted by date (order), between a minnimum and maximum price (minPrice, maxPrice), by product (product) or by owner (username)",
    response_model=List[Bid]
)
def get_bids(order: int = -1, minPrice: float = None, maxPrice: float = None, product: str = "", username: str = ""):
    bids = []
    bids_cursor = db.Bid.find()
    if bids_cursor is not None:
        for document in bids_cursor:
            bids.append(Bid(**document))
    
    if minPrice or maxPrice:
        bids = get_bids_by_price(minPrice, maxPrice, bids)
    
    if product:
        bids = get_bids_by_product(product, bids)
        
    if username:
        bids = get_bids_by_username(username, bids)
        
    if (order):
        bids = get_bids_sorted_by_date(order, bids)
        
    return bids

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


def get_bids_by_price(minPrice: float, maxPrice: float, bids: List[Bid]):
    bids_by_price = []
    
    for bid in bids:
        if (not minPrice or bid.amount >= minPrice) and (not maxPrice or bid.amount <= maxPrice):
            bids_by_price.append(bid)
    return bids_by_price

def get_bids_sorted_by_date(order: int, bids: List[Bid]):
    if order == 1:
        bids.sort(key=lambda bid: bid.timestamp, reverse=True)
    else:
        bids.sort(key=lambda bid: bid.timestamp, reverse=False)
    return bids

def get_bids_by_product(product: str, bids: List[Bid]):
    bids_by_product = []
    for bid in bids:
        if product in bid.product.name:
            bids_by_product.append(bid)
    return bids_by_product


def get_bids_by_username(username: str, bids: List[Bid]):
    bids_by_username = []
    for bid in bids:
        if username in bid.owner.username:
            bids_by_username.append(bid)
    return bids_by_username

@app.get(
    "/" + versionRoute + "/bids/{id}/products/",
    summary="List all products of the owner of a bid ",
    response_description="Get all products of the owner of a bid",
)
def get_products_by_bid(id: str):
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
