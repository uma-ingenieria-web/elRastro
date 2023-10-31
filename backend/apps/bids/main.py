from typing import Union
from fastapi import FastAPI, HTTPException, 
from dotenv import load_dotenv
from pymongo.mongo_client import MongoClient
from bidModel import Bid, Product, Owner
from bson import ObjectId

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

@app.get("/" + versionRoute + "/")
def read_root():
    return {"Hello": "Worl"}

def save_bid(bid : Bid):
    new_bid = db.Bid.insert_one(bid)
    craeted_bid = db.Bid.find_one({'_id': new_bid.inserted_id})
    return craeted_bid

@app.post("/" + versionRoute + "/bids", response_description= "Add new bid", response_model=Bid)
def craete_bid(bid : Bid):
    response = save_bid(bid.dict())
    if response:
        return response
    raise HTTPException(400, 'Something went wrong')

@app.put("/" + versionRoute + "/bids")
def update_bid(bid : Bid):
    return

@app.delete("/" + versionRoute + "/bids{id}")
def delete_bid():
    return
    
@app.get("/" + versionRoute + "/bids", response_description="List all ")
def get_bids():
    bids = []
    bids_cursor = db.Bid.find({})  # Get the MongoDB cursor
    for document in bids_cursor:
        bids.append(Bid(**document))
    return bids

@app.get("/" + versionRoute + "/bids/{id}", response_model=Bid)
def get_bid(id):
    bid = db.Bid.find_one({'_id': ObjectId(id)})  # Retrieve the bid data
    if bid:
        return Bid(**bid)  # Convert the data to a Bid object
    raise HTTPException(404, 'Bid not found')  # Raise an exception if the bid is not found


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}