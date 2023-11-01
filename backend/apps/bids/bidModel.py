from bson import ObjectId
from pydantic import BaseModel, Field, BeforeValidator, ConfigDict
from datetime import datetime
from typing_extensions import Annotated, Optional

PyObjectId = Annotated[str, BeforeValidator(str)]

class Product(BaseModel):
    id: PyObjectId = Field(alias="_id", default=None)
    name: str = Field(...)

class Owner(BaseModel):
    id: PyObjectId = Field(alias="_id", default=None)
    username: str = Field(...)

class Bid(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    amount: float = Field(...)
    timestamp: datetime = Field(default_factory=datetime.now)
    product: Product = Field(...)
    owner: Owner = Field(...)
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_schema_extra={
            "example": {
                "amount": 78.8,
                "timestamp": "2023-10-25T12:00:00",
                "product": {
                  "id": "653e27ba54d16794592d4731",  
                  "name": "T-shirt"  
                },
                "owner": {
                  "id": "653e27ba54d16794592d4741",
                  "username": "Manolo"
                }
            }
        }
    )
