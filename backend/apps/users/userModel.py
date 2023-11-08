from bson import ObjectId
from pydantic import BeforeValidator, BaseModel, ConfigDict, EmailStr, Field
from typing_extensions import Annotated
from typing import List, Optional
import datetime

PyObjectId = Annotated[str, BeforeValidator(str)]

class UserBasicInfo(BaseModel):
    id: PyObjectId = Field(alias="_id", default=None)
    username: str = Field(...)

class UserBasicInfoCollection(BaseModel):
    users: List[UserBasicInfo]

class Product(BaseModel):
    id: PyObjectId = Field(alias="_id", default=None)
    title: str = Field(...)
    closeDate: datetime.datetime = Field(...)
    buyer: Optional[UserBasicInfo] = Field(...)

class ProductId(BaseModel):
    id: PyObjectId = Field(alias="_id", default=None)

class ProductCollection(BaseModel):
    products: List[Product]

class Bid(BaseModel):
    id: str = Field(...)
    amount: float = Field(...)
    timestamp: datetime.datetime = Field(...)
    product: Product = Field(...)

class Location(BaseModel):
    lat: float = Field(...)
    lon: float = Field(...)

class Rating(BaseModel):
    value: float = Field(...)
    product: ProductId = Field(...)

class User(BaseModel):
    id: PyObjectId = Field(alias="_id", default=None)
    username: str = Field(...)
    location: Location = Field(...)
    rating: List[Rating]
    products: List[Product]
    bids: List[Bid]

    model_config = ConfigDict(
        populate_by_name = True,
        arbitrary_types_allowed = True,
        json_encoders = {ObjectId: str},
        json_schema_extra = {
            "example": {
                "username": "username",
                "location": {
                    "lat": 36.749058,
                    "lon": -4.516260
                },
                "ratings": [
                    {
                        "value": 5.0,
                        "product": {
                            "_id": "rating_product_id"
                        }
                    }
                ],
                "products": [
                    {
                        "_id": "product_id",
                        "title": "product_title",
                        "closeDate": "product_closeDate",
                        "buyer": {
                            "_id":"product_buyer_id",
                            "username": "product_buyer_username"
                        }
                    }
                ],
                "bids": [
                    {
                        "_id": "bid_id",
                        "amount": 500.0,
                        "timestamp": "bid_timestamp",
                        "product": {
                            "_id": "bid_product_id",
                            "title": "bid_product_title"
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
                "username": "username",
                "location": {
                    "lat": 36.749058,
                    "lon": -4.516260
                },
            }
        }
    )

class UpdateUser(BaseModel):
    username: Optional[str] = None
    location: Optional[Location] = None

    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
        json_schema_extra={
            "example": {
                "username": "username",
                "location": {
                    "lat": 36.749058,
                    "lon": -4.516260
                }
            }
        }
    )