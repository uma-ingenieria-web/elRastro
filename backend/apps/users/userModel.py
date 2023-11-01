from bson import ObjectId
from pydantic import BeforeValidator, BaseModel, ConfigDict, EmailStr, Field
from typing_extensions import Annotated
from typing import List, Optional
import datetime

PyObjectId = Annotated[str, BeforeValidator(str)]

class Product(BaseModel):
    id: PyObjectId = Field(alias="_id", default=None)
    name: str = Field(...)
    date: datetime.datetime = Field(...)

class ProductCollection(BaseModel):
    products: List[Product]

class Bid(BaseModel):
    id: str = Field(...)
    amount: float = Field(...)
    product: Product = Field(...)

class UserBasicInfo(BaseModel):
    id: PyObjectId = Field(alias="_id", default=None)
    username: str = Field(...)

class UserBasicInfoCollection(BaseModel):
    users: List[UserBasicInfo]

class User(BaseModel):
    id: PyObjectId = Field(alias="_id", default=None)
    username: str = Field(...)
    products: List[Product]
    bids: List[Bid]

    model_config = ConfigDict(
        populate_by_name = True,
        arbitrary_types_allowed = True,
        json_encoders = {ObjectId: str},
        json_schema_extra = {
            "example": {
                "username": "Javi Jordan",
                "products": [
                    {
                        "_id": "653e27ba54d16794592d4731",
                        "name": "Balon de Futbol",
                        "buyer": {
                            "_id":"653e50ba54d16794592d4700",
                            "username": "Pepe"
                        }
                    }
                ],
                "bids": [
                    {
                        "_id": "653e27ba54d16794592d4741",
                        "amount": 550.0,
                        "product": {
                            "_id": "653e27ba54d16794592d4751",
                            "name": "Ordenador Portatil",
                            "timestamp": "2023-10-25T12:00:00"
                        }
                    }
                ]
            }
        }
    )

class CreateUser(BaseModel):
    id: PyObjectId = Field(default=None, alias="_id")
    username: str = Field(...)

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
        json_schema_extra={
            "example": {
                "username": "Javi Jordan",
            }
        }
    )

class UpdateUser(BaseModel):
    username: Optional[str] = None

    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
        json_schema_extra={
            "example": {
                "username": "Javi Jordan"
            }
        }
    )