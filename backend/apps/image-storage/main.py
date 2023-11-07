
from fastapi import FastAPI, File, UploadFile
from dotenv import load_dotenv

import os
import cloudinary
import cloudinary.uploader as cloudinary_uploader

app = FastAPI()

load_dotenv()

uri = os.getenv('MONGODB_URI')
app = FastAPI()

cloudinary.config( 
  cloud_name = "dnzyzkglp", 
  api_key = os.getenv("API_KEY"), 
  api_secret = os.getenv("API_SECRET")
)

versionRoute = "api/v1"

@app.get("/" + versionRoute + "/photo/{id}",
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
def post_photo(id: str, file: UploadFile = File()):
    response = cloudinary_uploader.upload(file.file, public_id=id, transformation=[{
        'width': 100,
        'height': 100,
        'crop': 'fill'

    }])
    return response["secure_url"]

