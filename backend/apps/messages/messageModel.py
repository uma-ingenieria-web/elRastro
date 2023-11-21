from bson import ObjectId
from pydantic import BaseModel, Field, BeforeValidator, ConfigDict
from datetime import datetime
from typing_extensions import Annotated, Optional
from typing import List

PyObjectId = Annotated[str, BeforeValidator(str)]

class UserId(BaseModel):
    id: PyObjectId = Field(alias="_id", default=None)

class ProductId(BaseModel):
    id: PyObjectId = Field(alias="_id", default=None)

class Message(BaseModel):
    id: PyObjectId = Field(alias="_id", default=None)
    timestamp: datetime = Field(...)
    origin: UserId = Field(...)
    destination: UserId = Field(...)
    product: ProductId = Field(...)
    text: str = Field(...)

    model_config = ConfigDict(
        populate_by_name = True,
        arbitrary_types_allowed = True,
        json_encoders = {ObjectId: str},
        json_schema_extra = {
            "example": {
                "timestamp": "timestamp",
                "origin": {
                    "_id": "origin_id"
                },
                "destination": {
                    "_id": "destination_id"
                },
                "text": "text"
            }
        }
    )

class CreateMessage(BaseModel):
    id: PyObjectId = Field(default=None, alias="_id")
    timestamp: datetime = Field(default_factory=datetime.now)
    text: str = Field(...)

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
        json_schema_extra={
            "example": {
                "text": "text"
            }
        }
    )