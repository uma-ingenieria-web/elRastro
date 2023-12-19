from typing import List
from fastapi import Depends, FastAPI, HTTPException, Header, Response, status, Query
from dotenv import load_dotenv
import httpx
from pymongo import ReturnDocument
from pymongo.mongo_client import MongoClient
from chatModel import Chat, Message, CreateChat, CreateMessage
from bson import ObjectId
from bson.errors import InvalidId
from fastapi.middleware.cors import CORSMiddleware
import errors
import re

import os

app = FastAPI()

load_dotenv()
uri = os.getenv("MONGODB_URI")

# Create a new client and connect to the server
client = MongoClient(uri)

# Set the desired db
db = client.elRastro2

versionRoute = "api/v1"


origins = [
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def get_token(authorization: str = Header(...)):
    scheme, token = authorization.split()
    if scheme.lower() != "bearer":
        raise HTTPException(status_code=403, detail="Invalid authentication scheme")
    try:
        async with httpx.AsyncClient() as client:
            url = os.getenv("AUTH_URL")
            headers = {"Content-Type": "application/json", "Authorization": f"Bearer {token}"}
            response = await client.post(url, headers=headers)

            if response.status_code == 200:
                json_content = response.text
                return json_content
            else:
                return False
    except HTTPException:
        return False
    
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
         summary="Get the chat given by id",
         response_description="The chat given by id",
         response_model=Chat,
         status_code=status.HTTP_200_OK,
         responses={400: errors.error_400, 404: errors.error_404, 422: errors.error_422},
         tags=["Chat"])
async def get_chat(id: str, token: dict = Depends(get_token)):
    if not token:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    chat = db.Chat.find_one({"_id": ObjectId(id)})
    if chat is None:
        raise HTTPException(status_code=404, detail=f"Chat could not be found")

    return Chat(**chat)

@app.get("/" + versionRoute + "/myChats/{user_id}",
         summary="Get the chats from the given user id",
         response_description="The chats from the given user id",
         response_model=List[Chat],
         status_code=status.HTTP_200_OK,
         responses={400: errors.error_400, 404: errors.error_404, 422: errors.error_422},
         tags=["Chat"])
async def get_myChats(user_id: str, token: dict = Depends(get_token)):
    if not token:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = db.User.find_one({"_id": ObjectId(user_id)})
    if user is None:
        raise HTTPException(status_code=404, detail=f"User could not be found")

    chats = db.Chat.find({
        "$or": [
            {"vendor._id": user["_id"]},
            {"interested._id": user["_id"]}
        ]
    })

    return list(chats)
    

@app.get("/" + versionRoute + "/chat/{id}/messages",
         summary="Get the conversation from the chat given id sorted by timestamp",
         response_description="The conversation from the given chat id sorted by timestamp",
         response_model=List[Message],
         status_code=status.HTTP_200_OK,
         responses={400: errors.error_400, 404: errors.error_404, 422: errors.error_422},
         tags=["Chat"])
async def get_conversation_sorted_by_timestamp(id: str, token: dict = Depends(get_token)):
    if not token:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    chat = db.Chat.find_one({"_id": ObjectId(id)})
    if chat is None:
        raise HTTPException(status_code=404, detail=f"Chat could not be found")

    conversation = db.Message.find({"chat._id": ObjectId(id)}).sort("timestamp", 1)

    return list(conversation)

@app.get("/" + versionRoute + "/chat/{id}/lastMessage",
         summary="Get the last message from the chat given id",
         response_description="The last message from the given chat id",
         response_model=Message,
         status_code=status.HTTP_200_OK,
         responses={400: errors.error_400, 404: errors.error_404, 422: errors.error_422},
         tags=["Message"])
async def get_last_message(id: str, token: dict = Depends(get_token)):
    if not token:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    chat = db.Chat.find_one({"_id": ObjectId(id)})
    if chat is None:
        raise HTTPException(status_code=404, detail=f"Chat could not be found")

    conversation = db.Message.find({"chat._id": ObjectId(id)}).sort("timestamp", -1).limit(1)
    conversation_list = list(conversation)
    if len(conversation_list) == 0:
        raise HTTPException(status_code=404, detail=f"Chat has no messages")
    else:
        last_message = conversation_list[0]
        return last_message

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
def create_chat(chat: CreateChat, interested_id: str, product_id: str, token: dict = Depends(get_token)):
    if not token:
        raise HTTPException(status_code=401, detail="Invalid token")
    
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
def send_message(message: CreateMessage, id: str, origin_id: str, token: dict = Depends(get_token)):
    if not token:
        raise HTTPException(status_code=401, detail="Invalid token")
    
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
    
@app.get("/" + versionRoute + "/findChat/{product_id}",
         summary="Get the chat given by interested and vendor ids",
         response_description="The chat given by interested and vendor ids",
         response_model=Chat,
         status_code=status.HTTP_200_OK,
         responses={400: errors.error_400, 404: errors.error_404, 422: errors.error_422},
         tags=["Chat"])
async def get_chat(product_id: str, interested_id: str, vendor_id: str, token: dict = Depends(get_token)):
    if not token:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    chat = db.Chat.find_one({"product._id": ObjectId(product_id), "interested._id": ObjectId(interested_id), "vendor._id": ObjectId(vendor_id)})
    if chat is None:
        raise HTTPException(status_code=404, detail=f"Chat could not be found")

    return Chat(**chat)
