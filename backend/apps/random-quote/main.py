from dotenv import load_dotenv
from fastapi import FastAPI

import os
import requests

app = FastAPI()

load_dotenv()

API_KEY = os.getenv("API_KEY")

versionRoute = "api/v1"

base_url = "https://api.api-ninjas.com/v1/quotes?category="
headers = {"X-Api-Key":API_KEY}


# Get a random quote from the default, happiness category
@app.get("/" + versionRoute + "/quote",
         summary="Get a random quote from happiness category",
         response_description="Returns a random quote")
def root():
    req = requests.get(base_url + "happiness", headers=headers)
    return {"quote": req.json()[0]["quote"]}