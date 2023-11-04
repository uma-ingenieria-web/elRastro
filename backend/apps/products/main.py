from typing import Union
from fastapi import FastAPI, HTTPException, Response, status
from dotenv import load_dotenv
from pymongo import ReturnDocument
from pymongo.mongo_client import MongoClient
from productModel import Product
from bson import ObjectId
from bson.errors import InvalidId
from errors import error_404, error_400, error_422

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

# Add a new product
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
def create_product(product: Product):
    response = save_product(product.model_dump(by_alias=True, exclude={"id"}))
    if response:
        return response
    raise HTTPException(status_code=400, detail="Something went wrong")

# Update a product
@app.put(
    "/" + versionRoute + "/products/{id}",
    summary="Update a product",
    response_description="Update the attributes of a product",
    response_model=Product,
    responses={404: error_404, 400: error_400, 422: error_422},
)
def update_product(id: str, new_product: Product):
    try:
        if len(new_product.model_dump(by_alias=True, exclude={"id"})) >= 1:
            new_product.product.id = ObjectId(new_product.product.id)
            new_product.owner.id = ObjectId(new_product.owner.id)
            update_result = db.Product.find_one_and_update(
                {"_id": ObjectId(id)},
                {"$set": new_product.model_dump(by_alias=True, exclude={"id"})},
                return_document=ReturnDocument.AFTER,
            )
            if update_result is not None:
                return update_result
            else:
                raise HTTPException(status_code=404, detail=f"Product with id:{id} not found")

        if (product_db := db.Product.find_one({"_id": id})) is not None:
            return product_db
        
        raise HTTPException(status_code=404, detail=f"Product with id:{id} not found")

    except InvalidId as e:
        raise HTTPException(status_code=400, detail="Invalid ObjectId format")