from bson import ObjectId
from pydantic import BaseModel, Field, BeforeValidator, ConfigDict
from datetime import datetime
from typing_extensions import Annotated, Optional
from typing import List

PyObjectId = Annotated[str, BeforeValidator(str)]

class ChatId(BaseModel):
    id: PyObjectId = Field(alias="_id", default=None)

class UserId(BaseModel):
    id: PyObjectId = Field(alias="_id", default=None)

class ProductId(BaseModel):
    id: PyObjectId = Field(alias="_id", default=None)

class Chat(BaseModel):
    id: PyObjectId = Field(alias="_id", default=None)
    vendor: UserId = Field(...)
    interested: UserId = Field(...)
    product: ProductId = Field(...)

    model_config = ConfigDict(
        populate_by_name = True,
        arbitrary_types_allowed = True,
        json_encoders = {ObjectId: str},
        json_schema_extra = {
            "example": {
                "timestamp": "timestamp",
                "vendor": {
                    "_id": "vendor_id"
                },
                "interested": {
                    "_id": "interested_id"
                },
                "product": {
                    "_id": "product_id"
                }
            }
        }
    )
    
class CreateChat(BaseModel):
    id: PyObjectId = Field(default=None, alias="_id")
    
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
        json_schema_extra={
            "example": {
                
            }
        }
    )
    
class Message(BaseModel):
    id: PyObjectId = Field(alias="_id", default=None)
    chat: ChatId = Field(...)
    timestamp: datetime = Field(...)
    origin: UserId = Field(...)
    text: str = Field(...)

    model_config = ConfigDict(
        populate_by_name = True,
        arbitrary_types_allowed = True,
        json_encoders = {ObjectId: str},
        json_schema_extra = {
            "example": {
                "chat": {
                    "_id": "chat_id"
                },
                "timestamp": "timestamp",
                "origin": {
                    "_id": "origin_id"
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
       