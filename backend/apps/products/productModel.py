from bson import ObjectId
from pydantic import BaseModel, Field, BeforeValidator, ConfigDict
from datetime import datetime
from typing_extensions import Annotated, Optional
from typing import List

PyObjectId = Annotated[str, BeforeValidator(str)]


class Location(BaseModel):
    lat: float = Field(...)
    lon: float = Field(...)


class Buyer(BaseModel):
    id: PyObjectId = Field(alias="_id", default=None)
    username: str = Field(...)
    location: Location = Field(...)


class Owner(BaseModel):
    id: PyObjectId = Field(alias="_id", default=None)
    username: str = Field(...)
    location: Location = Field(...)


class Bidder(BaseModel):
    id: PyObjectId = Field(alias="_id", default=None)
    username: str = Field(...)


class Bid(BaseModel):
    id: PyObjectId = Field(alias="_id", default=None)
    amount: float = Field(...)
    bidder: Bidder = Field(...)


class ProductBasicInfo(BaseModel):
    id: PyObjectId = Field(alias="_id", default=None)
    bids: List[Bid] = Field(default_factory=list)
    title: str = Field(...)
    description: str = Field(...)
    initialPrice: float = Field(...)
    closeDate: datetime = Field(...)
    timestamp: datetime = Field(default_factory=datetime.now)
    weight: float = Field(...)
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_schema_extra={
            "example": {
                "title": "title",
                "description": "description",
                "initialPrice": 21.99,
                "closeDate": "closeDate",
                "weight": 0.5,
            }
        },
    )


class UpdateProduct(BaseModel):
    title: Optional[str] = Field(default=None)
    description: Optional[str] = Field(default=None)
    initialPrice: Optional[float] = Field(default=None)
    weight: Optional[float] = Field(default=None)
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_schema_extra={
            "example": {
                "title": "title",
                "description": "description",
                "initialPrice": 21.99,
                "weight": 0.5,
            }
        },
    )


class Product(BaseModel):
    id: PyObjectId = Field(alias="_id", default=None)
    title: str = Field(...)
    description: str = Field(...)
    initialPrice: float = Field(...)
    initialDate: datetime = Field(default_factory=datetime.now)
    closeDate: datetime = Field(...)
    weight: float = Field(...)
    owner: Owner = Field(...)
    buyer: Optional[Buyer] = Field(default=None)
    bids: List[Bid] = Field(default_factory=list)
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_schema_extra={
            "example": {
                "title": "title",
                "description": "description",
                "initialPrice": 21.99,
                "closeDate": "closeDate",
                "weight": 0.5,
                "owner": {
                    "_id": "owner_id",
                    "username": "owner_username",
                    "location": {"lat": 0.0, "lon": 0.0},
                },
                "buyer": {
                    "_id": "buyer_id",
                    "username": "buyer_username",
                    "location": {"lat": 0.0, "lon": 0.0},
                },
                "bids": [
                    {
                        "_id": "bid_id",
                        "amount": 22.0,
                        "bidder": {
                            "_id": "bidder_id",
                            "username": "bidder_username",
                        },
                    }
                ],
            }
        },
    )


class UserBasicInfo(BaseModel):
    id: PyObjectId = Field(alias="_id", default=None)
    username: str = Field(...)


class ProductUserInfo(BaseModel):
    id: PyObjectId = Field(alias="_id", default=None)
    title: str = Field(...)
    closeDate: datetime = Field(...)
    buyer: Optional[UserBasicInfo] = Field(default=None)
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_schema_extra={
            "example": {
                "_id": "product_id",
                "title": "title",
                "closeDate": "closeDate",
                "buyer": {
                    "_id": "buyer_id",
                    "username": "buyer_username",
                },
            }
        },
    )
