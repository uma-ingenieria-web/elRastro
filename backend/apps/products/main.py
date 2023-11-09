from typing import List
from fastapi import FastAPI, HTTPException, Response, status, Query
from dotenv import load_dotenv
from pymongo import ReturnDocument
from pymongo.mongo_client import MongoClient
from productModel import Product, ProductBasicInfo, ProductUserInfo, UpdateProduct
from bson import ObjectId
from bson.errors import InvalidId
import errors
import re

import os

app = FastAPI()

load_dotenv()
uri = os.getenv("MONGODB_URI")

# Create a new client and connect to the server
client = MongoClient(uri)

# Set the desired db
db = client.elRastro

versionRoute = "api/v1"


@app.get("/")
def read_root():
    return {"API": "REST"}


# Get all products
@app.get(
    "/" + versionRoute + "/products",
    summary="List all products",
    response_description="Get all products stored, can be sorted by closeDate, timestamp, username, by a range of initialPrice (minPrice and maxPrice))",
    response_model=List[Product],
    responses={
        422: errors.error_422,
    },
)
def get_products(
    orderCloseDate: int = Query(-1, description="1 for ascending, -1 for descending"),
    orderInitialDate: int = Query(-1, description="1 for ascending, -1 for descending"),
    username: str = Query("", description="Username of the owner of the product"),
    title: str = Query("", description="Title of the product"),
    minPrice: float = Query(None, description="Minimum price of the product"),
    maxPrice: float = Query(None, description="Maximum price of the product"),
):
    filter_params = {}

    if minPrice is not None:
        filter_params["initialPrice"] = {"$gte": minPrice}
    if maxPrice is not None:
        filter_params.setdefault("initialPrice", {})["$lte"] = maxPrice
    if username:
        regex_pattern = re.compile(f".*{re.escape(username)}.*", re.IGNORECASE)
        filter_params["owner.username"] = {"$regex": regex_pattern}
    if title:
        regex_pattern = re.compile(f".*{re.escape(title)}.*", re.IGNORECASE)
        filter_params["title"] = {"$regex": regex_pattern}

    products_cursor = db.Product.aggregate(
        [
            {"$match": filter_params},
            {"$sort": {"closeDate": orderCloseDate, "initialDate": orderInitialDate}},
        ]
    )

    products = []
    if products_cursor is not None:
        for document in products_cursor:
            products.append(Product(**document))

    return products


# Add a new product
@app.post(
    "/" + versionRoute + "/products/{idOwner}",
    summary="Add new product",
    response_description="Create a new product by specifying its attributes",
    response_model=Product,
    status_code=status.HTTP_201_CREATED,
    responses={
        422: errors.error_422,
        400: errors.error_400,
        404: errors.error_404,
    },
)
def create_product(product: ProductBasicInfo, idOwner: str):
    try:
        response = save_product(
            product.model_dump(by_alias=True, exclude={"id"}), idOwner
        )

        if response:
            db.User.update_many(
                {"_id": ObjectId(response["owner"]["_id"])},
                {
                    "$push": {
                        "products": {
                            "_id": response["_id"],
                            "title": response["title"],
                            "closeDate": response["closeDate"],
                        }
                    }
                },
            )

            return response
        raise HTTPException(status_code=400, detail="Something went wrong")
    except InvalidId as e:
        raise HTTPException(status_code=400, detail="Invalid ObjectId format")


# Auxiliary function to save a product
def save_product(product: ProductBasicInfo, idOwner: str):
    owner = db.User.find_one({"_id": ObjectId(idOwner)})

    if owner is None:
        raise HTTPException(status_code=404, detail="Owner not found")

    product["owner"] = {
        "_id": owner["_id"],
        "username": owner["username"],
        "location": {"lat": owner["location"]["lat"], "lon": owner["location"]["lon"]},
    }

    new_product = db.Product.insert_one(product)
    created_product = db.Product.find_one({"_id": new_product.inserted_id})
    return created_product


# Update a product
@app.put(
    "/" + versionRoute + "/products/{id}",
    summary="Update a product",
    response_description="Update the attributes of a product",
    response_model=Product,
    responses={404: errors.error_404, 400: errors.error_400, 422: errors.error_422},
)
def update_product(id: str, new_product: UpdateProduct):
    try:
        if len(new_product.model_dump(by_alias=True, exclude={"id"})) >= 1:
            update_result = db.Product.find_one_and_update(
                {"_id": ObjectId(id)},
                {"$set": new_product.model_dump(by_alias=True, exclude={"id"})},
                return_document=ReturnDocument.AFTER,
            )

            db.Bid.update_many(
                {"product._id": ObjectId(id)},
                {"$set": {"product.title": new_product.title}},
            )

            db.User.update_one(
                {"products._id": ObjectId(id)},
                {"$set": {"products.$.title": new_product.title}},
            )

            db.User.update_many(
                {"bids.product._id": ObjectId(id)},
                {"$set": {"bids.$.product.title": new_product.title}},
            )

            if update_result is not None:
                return update_result
            else:
                raise HTTPException(
                    status_code=404, detail=f"Product with id:{id} not found"
                )

        if (product_db := db.Product.find_one({"_id": id})) is not None:
            return product_db

        raise HTTPException(status_code=404, detail=f"Product with id:{id} not found")

    except InvalidId as e:
        raise HTTPException(status_code=400, detail="Invalid ObjectId format")


# Delete a product
@app.delete(
    "/" + versionRoute + "/products/{id}",
    summary="Delete a product",
    response_description="Delete the product from the database",
    status_code=204,
    responses={
        204: {
            "description": "Product deleted successfully",
            "headers": {"message": "Product deleted successfully"},
        },
        404: errors.error_404,
        400: errors.error_400,
        422: errors.error_422,
    },
)
def delete_product(id: str):
    try:
        result = db.Product.delete_one({"_id": ObjectId(id)})
        if result.deleted_count == 1:
            db.Bid.delete_many({"product._id": ObjectId(id)})

            db.User.update_many(
                {"products._id": ObjectId(id)},
                {"$pull": {"products": {"_id": ObjectId(id)}}},
            )

            db.User.update_many(
                {"bids.product._id": ObjectId(id)},
                {"$pull": {"bids": {"product._id": ObjectId(id)}}},
            )

            return Response(
                status_code=status.HTTP_204_NO_CONTENT,
                media_type="application/json",
                headers={"message": "Product deleted successfully"},
            )

        raise HTTPException(status_code=404, detail="Product not found")

    except InvalidId as e:
        raise HTTPException(status_code=400, detail="Invalid ObjectId format")


# Get one product
@app.get(
    "/" + versionRoute + "/products/{id}",
    response_model=Product,
    summary="Get one product",
    response_description="Get the product with the same id",
    responses={
        404: errors.error_404,
        400: errors.error_400,
        422: errors.error_422,
    },
)
def get_product(id):
    try:
        product = db.Product.find_one({"_id": ObjectId(id)})
        if product:
            return Product(**product)
        raise HTTPException(404, "Bid not found")

    except InvalidId as e:
        raise HTTPException(status_code=400, detail="Invalid ObjectId format")


# Query between collections
@app.get(
    "/" + versionRoute + "/products/{id}/related/",
    summary="Get the all the products from the user given a product id",
    response_description="List of products from a product id of a the same user",
    response_model=List[ProductUserInfo],
    responses={400: errors.error_400, 422: errors.error_422},
)
def get_related_products(id: str):
    try:
        prod = db.Product.find_one({"_id": ObjectId(id)}, {"owner._id": 1})
        if prod == None:
            return []
        user_products = db.User.find_one({"_id": prod["owner"]["_id"]}, {"products": 1})
        if user_products is None:
            return []
        return user_products["products"]
    except InvalidId as e:
        raise HTTPException(status_code=400, detail="Invalid ObjectId format")