
from fastapi import FastAPI, File, UploadFile
from dotenv import load_dotenv

import os
import cloudinary
import cloudinary.uploader as cloudinary_uploader

app = FastAPI()

load_dotenv()

# load_dotenv()
uri = os.getenv('MONGODB_URI')
app = FastAPI()

          
cloudinary.config( 
  cloud_name = "dnzyzkglp", 
  api_key = os.getenv("API_KEY"), 
  api_secret = os.getenv("API_SECRET")
)

versionRoute = "api/v1"

@app.get("/" + versionRoute + "/user/{id}/photo",
         description="Get url to photo from the id of a user",
         responses={
            200: {
                "description": "Return the url to the image.",
                "content": {"application/txt": {
                    "example": "https://res.cloudinary..."
                }},
            }
        },
         tags=["User"])
def get_user_photo(id: str):
    image_url, options = cloudinary.utils.cloudinary_url(id, format="jpeg")
    return image_url

@app.post("/" + versionRoute + "/user/{id}/photo",
        description="Upload a photo with an id",
        responses={
            200: {
                "description": "Return the url to the saved image.",
                "content": {"application/txt": {
                    "example": "https://res.cloudinary..."
                }},
            }
        },
        tags=["User"])
def post_photo(id: str, file: UploadFile = File()):
    response = cloudinary_uploader.upload(file.file, public_id=id, transformation=[{
        'width': 100,
        'height': 100,
        'crop': 'fill'

    }])
    return response["secure_url"]

