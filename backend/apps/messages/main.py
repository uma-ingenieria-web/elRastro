from typing import List
from fastapi import FastAPI, HTTPException, Response, status, Query
from dotenv import load_dotenv
from pymongo import ReturnDocument
from pymongo.mongo_client import MongoClient
from messageModel import Message, CreateMessage
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
@app.get("/" + versionRoute + "/messages",
         summary="Get the messages list",
         response_description="Returns all the messages",
         response_model=List[Message],
         status_code=status.HTTP_200_OK,
         tags=["Message"])
async def get_messages(page: int = Query(1, ge=1), page_size: int = Query(10, le=20)):
    skip = (page - 1) * page_size
    # En el filtro de find no se le pone nada "None" y después poner a 1 todos los atributos que quieres que se devuelvan (tienen que coincidir con los que se pongan en <basicInfo>)
    messages = db.Message.find(None).skip(skip).limit(page_size)
    
    return list(messages)


@app.get("/" + versionRoute + "/message/{id}",
         summary="Find a message with a certain id",
         response_description="The message with the given id",
         response_model=Message,
         status_code=status.HTTP_200_OK,
         responses={404: errors.error_404, 422: errors.error_422},
         tags=["Message"])
async def get_message_id(id: str):
    try:
        message = db.Message.find_one({"_id": ObjectId(id)})
    except InvalidId:
            raise HTTPException(status_code=422, detail=f"Message id is invalid") 
    if message is not None:
        return Message(**message)
    else:
        raise HTTPException(status_code=404, detail=f"Message {id} not found")
    

@app.post("/" + versionRoute + "/message",
    summary="Add a new message",
    response_description="The added message",
    response_model=Message,
    status_code=status.HTTP_201_CREATED,
    responses={
        422: errors.error_422,
        400: errors.error_400,
        404: errors.error_404,
    },
    tags=["Message"]
)
def send_message(message: CreateMessage, origin: str, destination: str, product_id: str):
    user_origin = db.User.find_one({"_id": ObjectId(origin)})
    if user_origin is None:
        raise HTTPException(status_code=404, detail=f"Origin user could not be found")
    user_destination = db.User.find_one({"_id": ObjectId(destination)})
    if user_destination is None:
        raise HTTPException(status_code=404, detail=f"Origin user could not be found")
    product = db.Product.find_one({"_id": ObjectId(product_id)})
    if product is None:
        raise HTTPException(status_code=404, detail=f"Product could not be found")
    # Verifica si el producto pertenece al usuario origen o destino
    product_owned = db.Product.find({
        "_id": ObjectId(product_id),
        "$or": [
            {"owner._id": ObjectId(origin)},
            {"owner._id": ObjectId(destination)}
        ]
    })
    if product_owned is None:
        raise HTTPException(status_code=404, detail=f"Product is not owned by origin or destination user")
    
    result = db.Message.insert_one(message.model_dump(by_alias=True, exclude=["id"]))
    db.Message.update_one({"_id": result.inserted_id}, {"$set": {"origin._id": ObjectId(origin), "destination._id": ObjectId(destination), "product._id": ObjectId(product_id)}})
    message = db.Message.find_one({"_id": result.inserted_id})
    if message is not None:
        return Message(**message)
    else:
        raise HTTPException(status_code=404, detail=f"Message could not be created")
    

@app.get("/" + versionRoute + "/conversation",
         summary="Get the conversation between user origin and destination from one product sorted by timestamp",
         response_description="The conversation between user origin and destination from one product sorted by timestamp",
         response_model=List[Message],
         status_code=status.HTTP_200_OK,
         responses={400: errors.error_400, 404: errors.error_404, 422: errors.error_422},
         tags=["Message"])
async def get_conversation_sorted_by_timestamp(origin: str, destination: str, product_id: str):
    user_origin = db.User.find_one({"_id": ObjectId(origin)})
    if user_origin is None:
        raise HTTPException(status_code=404, detail=f"Origin user could not be found")
    user_destination = db.User.find_one({"_id": ObjectId(destination)})
    if user_destination is None:
        raise HTTPException(status_code=404, detail=f"Origin user could not be found")
    product = db.Product.find_one({"_id": ObjectId(product_id)})
    if product is None:
        raise HTTPException(status_code=404, detail=f"Product could not be found")
    # Verifica si el producto pertenece al usuario origen o destino
    product_owned = db.Product.find({
        "_id": ObjectId(product_id),
        "$or": [
            {"owner._id": ObjectId(origin)},
            {"owner._id": ObjectId(destination)}
        ]
    })
    if product_owned is None:
        raise HTTPException(status_code=404, detail=f"Product is not owned by origin or destination user")

    # Obtén la conversación ordenada por timestamp descendente
    conversation = db.Message.find({
        "$or": [
            {"$and": [{"origin._id": ObjectId(origin)}, {"destination._id": ObjectId(destination)}, {"product._id": ObjectId(product_id)}]},
            {"$and": [{"origin._id": ObjectId(destination)}, {"destination._id": ObjectId(origin)}, {"product._id": ObjectId(product_id)}]}
        ]
    }).sort("timestamp", 1)

    return list(conversation)


@app.get("/" + versionRoute + "/conversations/usernames",
         summary="Get the usernames of the users that have a conversation with user from one product sorted by timestamp",
         response_description="The usernames of the users that have a conversation with user from one product sorted by timestamp",
         response_model=List[str],
         status_code=status.HTTP_200_OK,
         responses={400: errors.error_400, 404: errors.error_404, 422: errors.error_422},
         tags=["Message"])
async def get_conversations_usernames_sorted_by_timestamp(user_id: str, product_id: str):
    user = db.User.find_one({"_id": ObjectId(user_id)})
    if user is None:
        raise HTTPException(status_code=404, detail=f"User could not be found")
    product = db.Product.find_one({"_id": ObjectId(product_id)})
    if product is None:
        raise HTTPException(status_code=404, detail=f"Product could not be found")
    # Verifica si el producto pertenece al usuario origen o destino
    product_owned = db.Product.find({
        "_id": ObjectId(product_id),
        "owner._id": ObjectId(user_id)
    })
    if product_owned is None:
        raise HTTPException(status_code=404, detail=f"Product is not owned by the user")
    
    conversations = db.Message.find(
            {
                "$or": [
                    {"$and": [{"origin._id": ObjectId(user_id)}, {"product._id": ObjectId(product_id)}]},
                    {"$and": [{"destination._id": ObjectId(user_id)}, {"product._id": ObjectId(product_id)}]}
                ]
            },
            {"origin._id": 1, "destination._id": 1}
        )

    # Extrae los IDs de usuarios únicos de las conversaciones
    user_ids = set()
    for conversation in conversations:
        if conversation["origin"]["_id"] != ObjectId(user_id):
            user_ids.add(conversation["origin"]["_id"])
        if conversation["destination"]["_id"] != ObjectId(user_id):
            user_ids.add(conversation["destination"]["_id"])

    user_ids_list = list(user_ids)
    # Obtiene información de usuarios
    users = db.User.find({"_id": {"$in": user_ids_list}})

    contacts_list = []
    # Obtiene la conversación ordenada por timestamp descendente
    for contact in users:
        messages = db.Message.find({
            "$or": [
                {"$and": [{"origin._id": ObjectId(user_id)}, {"destination._id": contact["_id"]}, {"product._id": ObjectId(product_id)}]},
                {"$and": [{"origin._id": contact["_id"]}, {"destination._id": ObjectId(user_id)}, {"product._id": ObjectId(product_id)}]}
            ]
        }).sort("timestamp", -1).limit(1)
    
        if messages:
            latest_message = messages[0]
            
        contacts_list.append({
            "username": contact["username"],
            "latest_timestamp": latest_message["timestamp"] if latest_message else None
        })

    # Ordena la lista por timestamp descendente
    contacts_list = sorted(contacts_list, key=lambda x: x["latest_timestamp"], reverse=True)
    
    # Obtiene solo los usernames ordenados
    sorted_usernames = [contact["username"] for contact in contacts_list]
    
    return sorted_usernames