from bson import ObjectId
from pydantic import BaseModel, Field, BeforeValidator, ConfigDict
from datetime import datetime
from typing_extensions import Annotated, Optional

PyObjectId = Annotated[str, BeforeValidator(str)]


class Product(BaseModel):
    id: PyObjectId = Field(alias="_id", default=None)
    title: str = Field(...)


class Owner(BaseModel):
    id: PyObjectId = Field(alias="_id", default=None)
    username: str = Field(...)


class Bidder(BaseModel):
    id: PyObjectId = Field(alias="_id", default=None)
    username: str = Field(...)


class BidBasicInfo(BaseModel):
    id: PyObjectId = Field(alias="_id", default=None)
    amount: float = Field(...)
    timestamp: datetime = Field(default_factory=datetime.now)
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_schema_extra={
            "example": {
                "amount": 78.8,
            }
        },
    )


class UpdateBid(BaseModel):
    amount: float = Field(...)
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_schema_extra={
            "example": {
                "amount": 78.8,
            }
        },
    )


class Bid(BaseModel):
    id: PyObjectId = Field(alias="_id", default=None)
    amount: float = Field(...)
    timestamp: datetime = Field(default_factory=datetime.now)
    product: Product = Field(...)
    owner: Owner = Field(...)
    bidder: Bidder = Field(...)
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_schema_extra={
            "example": {
                "bidder": {"_id": "bidder_id", "username": "bidder_username"},
                "amount": 78.8,
                "timestamp": "timestamp",
                "product": {"_id": "product_id", "title": "product_title"},
                "owner": {"_id": "owner_id", "username": "owner_username"},
            }
        },
    )


# class UserBasicInfo(BaseModel):
#     id: PyObjectId = Field(alias="_id", default=None)
#     username: str = Field(...)

# class ProductUserInfo(BaseModel):
#     id: PyObjectId = Field(alias="_id", default=None)
#     title: str = Field(...)
#     description: str = Field(...)
#     closeDate: datetime = Field(...)
#     buyer: Optional[UserBasicInfo] = Field(default=None)
#     model_config = ConfigDict(
#         populate_by_name=True,
#         arbitrary_types_allowed=True,
#         json_schema_extra={
#             "example": {
#                 "_id": "product_id",
#                 "title": "title",
#                 "closeDate": "closeDate",
#                 "buyer": {
#                     "_id": "buyer_id",
#                     "username": "buyer_username",
#                 },
#             }
#         },
#     )
