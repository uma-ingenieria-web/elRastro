from bson import ObjectId
from pydantic import BeforeValidator, BaseModel, Field
from typing_extensions import Annotated
from typing import List

PyObjectId = Annotated[str, BeforeValidator(str)]

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
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        json_schema_extra = {
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


class CreateUser(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    username: str = Field(...)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        json_schema_extra = {
            "example": {
                "username": "Javi Jordan",
            }
        }