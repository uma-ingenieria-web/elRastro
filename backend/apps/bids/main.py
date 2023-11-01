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

uri = f"mongodb+srv://{os.getenv('MONGODB_USER')}:{os.getenv('MONGODB_PASSWORD')}@{os.getenv('MONGODB_CLUSTER')}.mongodb.net/?retryWrites=true&w=majority"

# Create a new client and connect to the server
client = MongoClient(uri)

# Send a ping to confirm a successful connection
try:
    client.admin.command('ping')
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

def save_bid(bid : Bid):
    new_bid = db.Bid.insert_one(bid)
    craeted_bid = db.Bid.find_one({'_id': new_bid.inserted_id})
    return craeted_bid

@app.post("/" + versionRoute + "/bids", response_description= "Add new bid", summary="Create a new bid with the desired amount",
        response_model=Bid, status_code=status.HTTP_201_CREATED)
def craete_bid(bid : Bid):
    response = save_bid(bid.model_dump())
    if response:
        return response
    raise HTTPException(status_code=400, detail='Something went wrong')

@app.put("/" + versionRoute + "/bids/{id}", response_description="Update bid", summary="Update the values of a bid",
        response_model=Bid)
def update_bid(id:str, new_bid : Bid):
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

@app.delete("/" + versionRoute + "/bids/{id}", response_description="Delete a bid", 
        summary="Delete the bid from the database", status_code=204)
def delete_bid(id: str):
    try:    
        
        result = db.Bid.delete_one({"_id": ObjectId(id)})
        if result.deleted_count == 1:
            return Response(status_code=status.HTTP_204_NO_CONTENT)
        raise HTTPException(status_code=404, detail="Bid not found")
    
    except InvalidId as e:
        raise HTTPException(status_code=400, detail="Invalid ObjectId format")
    
@app.get("/" + versionRoute + "/bids", response_description="List all bids", summary="Get all bids stored")
def get_bids():
    bids = []
    bids_cursor = db.Bid.find({})  # Get the MongoDB cursor
    for document in bids_cursor:
        bids.append(Bid(**document))
    return bids

@app.get("/" + versionRoute + "/bids/{id}", response_model=Bid, response_description="Get one bid", 
        summary="Get the bid with the same id")
def get_bid(id):
    try:
        
        bid = db.Bid.find_one({'_id': ObjectId(id)})
        if bid:
            return Bid(**bid)
        raise HTTPException(404, 'Bid not found')
    
    except InvalidId as e:
        raise HTTPException(status_code=400, detail="Invalid ObjectId format")
