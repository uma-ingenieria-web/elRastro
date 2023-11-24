from bson import ObjectId
from pydantic import BeforeValidator, BaseModel, ConfigDict, EmailStr, Field
from typing_extensions import Annotated
from typing import List, Optional
from datetime import datetime

PyObjectId = Annotated[str, BeforeValidator(str)]

class UserBasicInfo(BaseModel):
    id: PyObjectId = Field(alias="_id", default=None)
    username: str = Field(...)

class ProductId(BaseModel):
    id: PyObjectId = Field(alias="_id", default=None)

class Rating(BaseModel):
    value: float = Field(...)
    product: ProductId = Field(...)
    timestamp: datetime = Field(...)
    user: UserBasicInfo = Field(...)
    
class RatingBasicInfo(BaseModel):
    value: float = Field(...)
    timestamp: datetime = Field(default_factory=datetime.now)
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_schema_extra={
            "example": {
                "value": 0.0,
            }
        },
    )