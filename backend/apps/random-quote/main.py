from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException

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
    if req.status_code != 200:
        raise HTTPException(404, "Quote not found")
    return {"quote": req.json()[0]["quote"]}


# Get a random quote from a category
@app.get("/" + versionRoute + "/quote/{category}",
            summary="Get a random quote from a category",
            response_description="Returns a random quote from category")
def get_quote(category: str):
    try:
        req = requests.get(base_url + category, headers=headers)
        return {"quote": req.json()[0]["quote"]}
    except:
        raise HTTPException(status_code=404, detail="Invalid category")