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
def get_first_place(lat: float = None, lon: float = None):
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
def get_all_places(lat: float = None, lon: float = None):
    if lat == None or lon == None:
        raise HTTPException(status_code=400, detail="Incorrect input")
    try:
        req = requests.get(base_url + "?lat=" + str(lat) + "&lon=" + str(lon), headers=headers)
        return req.json()
    except:
        raise HTTPException(404, "Not found")


# Get the first country and city name of the opposite side of the world from coordinates
@app.get("/" + versionRoute + "/reversegeocoding",
            summary="Get country and city name of the other side of the world by coordinates",
            response_description="Returns the country and city name of the other side of the world from coordinates",
            status_code=status.HTTP_200_OK,
            responses={404: errors.error_404})
def get_place_other_side(lat: float = None, lon: float = None):
    if lat == None or lon == None:
        raise HTTPException(status_code=400, detail="Incorrect input")
    if lat > 0:
        lat = lat - 90
    else:
        lat = lat + 90
    if lon > 0:
        lon = lon - 180
    else:
        lon = lon + 180
    try:
        req = requests.get(base_url + "?lat=" + str(lat) + "&lon=" + str(lon), headers=headers)
        return {"country": req.json()[0]["country"], "city": req.json()[0]["name"]}
    except:
        raise HTTPException(404, "Not found")


# Get all the country and city names of the opposite side of the world from coordinates
@app.get("/" + versionRoute + "/reversegeocoding",
            summary="Get all country and city names of the other side of the wolrd by coordinates",
            response_description="Returns the country and city names of the other side of the world from coordinates",
            status_code=status.HTTP_200_OK,
            responses={404: errors.error_404})
def get_all_places_other_side(lat: float = None, lon: float = None):
    if lat == None or lon == None:
        raise HTTPException(status_code=400, detail="Incorrect input")
    if lat > 0:
        lat = lat - 90
    else:
        lat = lat + 90
    if lon > 0:
        lon = lon - 180
    else:
        lon = lon + 180
    try:
        req = requests.get(base_url + "?lat=" + str(lat) + "&lon=" + str(lon), headers=headers)
        return req.json()
    except:
        raise HTTPException(404, "Not found")
