from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, status
import errors

import os
import requests

app = FastAPI()

load_dotenv()

API_KEY = os.getenv("API_KEY")

versionRoute = "api/v1"

base_url = "https://api.api-ninjas.com/v1/reversegeocoding"
headers = {"X-Api-Key":API_KEY}


# Get the first country and city name from coordinates
@app.get("/" + versionRoute + "/reversegeocoding",
            summary="Get a country and city name by coordinates",
            response_description="Returns the country and city name from coordinates",
            status_code=status.HTTP_200_OK,
            responses={404: errors.error_404})
def get_first_place(lat: int = None, lon: int = None):
    if lat == None or lon == None:
        raise HTTPException(status_code=400, detail="Incorrect input")
    try:
        req = requests.get(base_url + "?lat=" + str(lat) + "&lon=" + str(lon), headers=headers)
        return {"country": req.json()[0]["country"], "city": req.json()[0]["name"]}
    except:
        raise HTTPException(404, "Not found")


# Get all the country and city names from coordinates
@app.get("/" + versionRoute + "/reversegeocoding",
            summary="Get all country and city names by coordinates",
            response_description="Returns the country and city names from coordinates",
            status_code=status.HTTP_200_OK,
            responses={404: errors.error_404})
def get_all_places(lat: int = None, lon: int = None):
    if lat == None or lon == None:
        raise HTTPException(status_code=400, detail="Incorrect input")
    try:
        req = requests.get(base_url + "?lat=" + str(lat) + "&lon=" + str(lon), headers=headers)
        return req.json()
    except:
        raise HTTPException(404, "Not found")
