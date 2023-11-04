from typing import Union
from fastapi import FastAPI, HTTPException, Response, status
from dotenv import load_dotenv
from pymongo import ReturnDocument
from pymongo.mongo_client import MongoClient
from productModel import Product
from bson import ObjectId
from bson.errors import InvalidId

import os

app = FastAPI()

load_dotenv()
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

def save_product(product: Product):
    new_product = db.Product.insert_one(product)
    created_product = db.Product.find_one({"_id": new_product.inserted_id})
    return created_product


@app.post(
    "/" + versionRoute + "/products",
    summary="Add new product",
    response_description="Create a new product by specifying its attributes",
    response_model=Product,
    status_code=status.HTTP_201_CREATED,
)
def create_bid(product: Product):
    response = save_product(product.model_dump())
    if response:
        return response
    raise HTTPException(status_code=400, detail="Something went wrong")