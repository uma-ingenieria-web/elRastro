from bson import ObjectId
from pydantic import BaseModel, Field
from datetime import datetime

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")

class Product(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    name: str = Field(...)

class Owner(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    name: str = Field(...)

class Bid(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    amount: float = Field(...)
    timestamp: datetime = Field(default_factory=datetime.now)
    product: Product = Field(...)
    owner: Owner = Field(...)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        schema_extra = {
            "example": {
                "amount": 78.8,
                "timestamp": "2023-10-25T12:00:00",
                "product": {
                  "name": "T-shirt"  
                },
                "owner": {
                    "name": "Manolo"
                }
            }
        }