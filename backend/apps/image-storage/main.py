
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

@app.get("/user/{id}/photo")
def get_user_photo(id: str):
    image_url, options = cloudinary.utils.cloudinary_url(id, format="jpeg")
    return image_url

@app.post("/user/{id}/photo")
def post_photo(id: str, file: UploadFile = File()):
    response = cloudinary_uploader.upload(file.file, public_id=id, transformation=[{
        'width': 100,
        'height': 100,
        'crop': 'fill'

    }])
    return response["secure_url"]

