
from fastapi import Depends, FastAPI, File, HTTPException, Header, UploadFile
from dotenv import load_dotenv

import os
import json
import cloudinary
import cloudinary.uploader as cloudinary_uploader
from fastapi.middleware.cors import CORSMiddleware
import httpx

app = FastAPI()

load_dotenv()

uri = os.getenv('MONGODB_URI')
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

cloudinary.config( 
  cloud_name = "dnzyzkglp", 
  api_key = os.getenv("API_KEY"), 
  api_secret = os.getenv("API_SECRET")
)

versionRoute = "api/v1"

origins = [
    "*"
]

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
                return json.loads(json_content)
            else:
                return False
    except HTTPException:
        return False

@app.get("/" + versionRoute + "/photo/{id}",
         summary="Get url to photo from id",
         description="Get url to photo from the id of a user or product",
         responses={
            200: {
                "description": "Return the url to the image.",
                "content": {"application/txt": {
                    "example": "https://res.cloudinary..."
                }},
            }
        },
         tags=["Photo"])
def get_url_photo(id: str):
    image_url, options = cloudinary.utils.cloudinary_url(id, format="jpeg", secure=True)
    return image_url


@app.post("/" + versionRoute + "/photo/{id}",
        summary="Upload a photo",
        description="Upload a photo with an id",
        responses={
            200: {
                "description": "Return the url to the saved image.",
                "content": {"application/txt": {
                    "example": "https://res.cloudinary..."
                }},
            }
        },
        tags=["Photo"])
def post_photo(id: str, file: UploadFile = File(), token: dict = Depends(get_token)):
    if not token:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    response = cloudinary_uploader.upload(file.file, public_id=id, format="jpg")
    return response["secure_url"]