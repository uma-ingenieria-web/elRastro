from typing import List
from fastapi import FastAPI, HTTPException, Response, status, Query
from dotenv import load_dotenv
from pymongo import ReturnDocument
from pymongo.mongo_client import MongoClient
from chatModel import Chat, Message, CreateChat, CreateMessage
from bson import ObjectId
from bson.errors import InvalidId
import errors
import re

import os

app = FastAPI()

load_dotenv()
uri = os.getenv("MONGODB_URI")

# Create a new client and connect to the server
client = MongoClient(uri)

# Set the desired db
db = client.elRastro

versionRoute = "api/v1"


@app.get("/")
def read_root():
    return {"API": "REST"}


# Get all message
@app.get("/" + versionRoute + "/chats",
         summary="Get the chat list",
         response_description="Returns all the chats",
         response_model=List[Chat],
         status_code=status.HTTP_200_OK,
         tags=["Chat"])
async def get_chats(page: int = Query(1, ge=1), page_size: int = Query(10, le=20)):
    skip = (page - 1) * page_size
    # En el filtro de find no se le pone nada "None" y después poner a 1 todos los atributos que quieres que se devuelvan (tienen que coincidir con los que se pongan en <basicInfo>)
    messages = db.Chat.find(None).skip(skip).limit(page_size)
    
    return list(messages)
    

@app.get("/" + versionRoute + "/chat/{id}",
         summary="Get the conversation from the chat given id sorted by timestamp",
         response_description="The conversation from the given chat id sorted by timestamp",
         response_model=List[Message],
         status_code=status.HTTP_200_OK,
         responses={400: errors.error_400, 404: errors.error_404, 422: errors.error_422},
         tags=["Chat"])
async def get_conversation_sorted_by_timestamp(id: str):
    chat = db.Chat.find_one({"_id": ObjectId(id)})
    if chat is None:
        raise HTTPException(status_code=404, detail=f"Chat could not be found")

    # Obtén la conversación ordenada por timestamp descendente
    conversation = db.Message.find({"chat._id": ObjectId(id)}).sort("timestamp", 1)

    return list(conversation)

@app.post("/" + versionRoute + "/chat/{product_id}",
    summary="Create a chat",
    response_description="The created chat",
    response_model=Chat,
    status_code=status.HTTP_201_CREATED,
    responses={
        422: errors.error_422,
        400: errors.error_400,
        404: errors.error_404,
    },
    tags=["Chat"]
)
def create_chat(chat: CreateChat, interested_id: str, product_id: str):
    interested = db.User.find_one({"_id": ObjectId(interested_id)})
    if interested is None:
        raise HTTPException(status_code=404, detail=f"User could not be found")
    product = db.Product.find_one({"_id": ObjectId(product_id)})
    if product is None:
        raise HTTPException(status_code=404, detail=f"Product could not be found")
    result = db.Chat.insert_one(chat.model_dump(by_alias=True, exclude=["id"]))
    vendor = db.User.find_one({"products._id": ObjectId(product_id)})
    
    db.Chat.update_one({"_id": ObjectId(result.inserted_id)}, {"$set": {"interested._id": ObjectId(interested_id), "product._id": ObjectId(product_id), "vendor._id": ObjectId(vendor["_id"])}})
    chat = db.Chat.find_one({"_id": result.inserted_id})
    if chat is not None:
        return Chat(**chat)
    else:
        raise HTTPException(status_code=404, detail=f"Chat could not be created")


@app.post("/" + versionRoute + "/chat/{id}/send",
    summary="Add a new message",
    response_description="The sent message",
    response_model=Message,
    status_code=status.HTTP_201_CREATED,
    responses={
        422: errors.error_422,
        400: errors.error_400,
        404: errors.error_404,
    },
    tags=["Message"]
)
def send_message(message: CreateMessage, id: str, origin_id: str):
    chat = db.Chat.find_one({"_id": ObjectId(id)})
    if chat is None:
        raise HTTPException(status_code=404, detail=f"Chat could not be found")
    chat_owner = list(db.Chat.find(
        {
                "$or": [
                    {"$and": [{"vendor._id": ObjectId(origin_id)}, {"_id": ObjectId(id)}]},
                    {"$and": [{"interested._id": ObjectId(origin_id)}, {"_id": ObjectId(id)}]}
                ]
        }
    ))
    if not chat_owner:
        raise HTTPException(status_code=404, detail=f"Origin is not part of the given chat")
    result = db.Message.insert_one(message.model_dump(by_alias=True, exclude=["id"]))
    db.Message.update_one({"_id": ObjectId(result.inserted_id)}, {"$set": {"chat._id": ObjectId(id), "origin._id": ObjectId(origin_id)}})
    message = db.Message.find_one({"_id": ObjectId(result.inserted_id)})
    if message is not None:
        return Message(**message)
    else:
        raise HTTPException(status_code=404, detail=f"Message could not be created")
    

