from bson import ObjectId
from pydantic import BaseModel, Field, BeforeValidator, ConfigDict
from datetime import datetime
from typing_extensions import Annotated, Optional
from typing import List

PyObjectId = Annotated[str, BeforeValidator(str)]

class User(BaseModel):
    id: PyObjectId = Field(alias="_id", default=None)
    username: str = Field(...)

class Bid(BaseModel):
    id: PyObjectId = Field(alias="_id", default=None)
    amount: float = Field(...)
    bidder: User = Field(...)

class Product(BaseModel):
    id: PyObjectId = Field(alias="_id", default=None)
    owner: User = Field(...)
    buyer: User = Field(...)
    bids: List[Bid] = Field(default_factory=list)
    title: str = Field(...)
    description: str = Field(...)
    initialPrice: float = Field(...)
    closeDate: datetime = Field(...)
    timestamp: datetime = Field(default_factory=datetime.now)
    location: str = Field(...)
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_schema_extra={
            "example": {
                "title": "Cartera de cuero",
                "description": "100% hecha de cuero de carnero",
                "initialPrice": 21.99,
                "closeDate": "2023-11-02T12:00:00",
                "timestamp": "2023-10-25T12:00:00",
                "location": "53.339688, -6.236688",
                "owner": {
                    "_id": "653e27ba54d16794592d4741",
                    "username": "Manolo"
                },
                "buyer": {
                  "_id": "653e27baafafeu94592d4741",
                  "username": "Manuela"
                },
                "bids": [
                    {
                        "_id": "653e27baafafeu94592d4742",
                        "amount": 22.0,
                        "bidder": {
                            "_id": "653e27baafafeu94592d4741",
                            "username": "Manuela"
                        }
                    }
                ]
            }
        }
    )
