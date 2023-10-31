import pymongo
from bson import ObjectId
from pydantic import BaseModel, Field
from typing import List

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")

class Product(BaseModel):
    id: str = Field(...)
    name: str = Field(...)

class Bid(BaseModel):
    id: str = Field(...)
    amount: float = Field(...)
    product: Product = Field(...)

class User(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    username: str = Field(...)
    products: List[Product]
    bids: List[Bid]

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        schema_extra = {
            "example": {
                "username": "Javi Jordan",
                "products": [
                    {
                        "_id": "653e27ba54d16794592d4731",
                        "name": "Balon de Futbol"
                    }
                ],
                "bids": [
                    {
                        "_id": "653e27ba54d16794592d4741",
                        "amount": 550.0,
                        "product": {
                            "_id": "653e27ba54d16794592d4751",
                            "name": "Ordenador Portatil"
                        }
                    }
                ]
            }
        }