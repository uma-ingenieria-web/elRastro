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
                "initialDate": "initialDate",
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
