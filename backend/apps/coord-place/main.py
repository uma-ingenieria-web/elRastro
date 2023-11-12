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


# Get root
@app.get("/", status_code=status.HTTP_200_OK)
def root():
    return {"API":"REST"}


# Get the first country and city name from coordinates
@app.get("/" + versionRoute + "/reversegeocoding/{lat}/{lon}",
            summary="Get a country and city name by coordinates",
            response_description="Returns the country and city name from coordinates",
            status_code=status.HTTP_200_OK,
            responses={400: errors.error_400, 404: errors.error_404})
def get_first_place(lat: float = None, lon: float = None):
    if not valid_lat(lat):
        raise HTTPException(status_code=400, detail="Incorrect latitude input")
    elif not valid_lon(lon):
        raise HTTPException(status_code=400, detail="Incorrect longitude input")
    
    try:
        req = requests.get(base_url + "?lat=" + str(lat) + "&lon=" + str(lon), headers=headers)
        req_json = req.json()
        return {"country": req_json[0]["country"], "city": req.json()[0]["name"]}
    except:
        raise HTTPException(404, "Location not found")


# Get all the country and city names from coordinates
@app.get("/" + versionRoute + "/reversegeocoding/{lat}/{lon}/all",
            summary="Get all country and city names by coordinates",
            response_description="Returns the country and city names from coordinates",
            status_code=status.HTTP_200_OK,
            responses={400: errors.error_400, 404: errors.error_404})
def get_all_places(lat: float = None, lon: float = None):
    if not valid_lat(lat):
        raise HTTPException(status_code=400, detail="Incorrect latitude input")
    elif not valid_lon(lon):
        raise HTTPException(status_code=400, detail="Incorrect longitude input")
    
    try:
        req = requests.get(base_url + "?lat=" + str(lat) + "&lon=" + str(lon), headers=headers)
        return req.json()
    except:
        raise HTTPException(404, "Location not found")


# Get the first country and city name of the opposite side of the world from coordinates
@app.get("/" + versionRoute + "/reversegeocoding/{lat}/{lon}/opposite",
            summary="Get country and city name of the other side of the world by coordinates",
            response_description="Returns the country and city name of the other side of the world from coordinates",
            status_code=status.HTTP_200_OK,
            responses={400: errors.error_400, 404: errors.error_404})
def get_place_other_side(lat: float = None, lon: float = None):
    if not valid_lat(lat):
        raise HTTPException(status_code=400, detail="Incorrect latitude input")
    elif not valid_lon(lon):
        raise HTTPException(status_code=400, detail="Incorrect longitude input")
    
    lat, lon = opposite_side(lat, lon)
    try:
        req = requests.get(base_url + "?lat=" + str(lat) + "&lon=" + str(lon), headers=headers)
        req_json = req.json()
        return {"country": req_json[0]["country"], "city": req_json[0]["name"]}
    except:
        raise HTTPException(404, "Location not found")


# Get all the country and city names of the opposite side of the world from coordinates
@app.get("/" + versionRoute + "/reversegeocoding/{lat}/{lon}/opposite/all",
            summary="Get all country and city names of the other side of the world by coordinates",
            response_description="Returns the country and city names of the other side of the world from coordinates",
            status_code=status.HTTP_200_OK,
            responses={400: errors.error_400, 404: errors.error_404})
def get_all_places_other_side(lat: float = None, lon: float = None):
    if not valid_lat(lat):
        raise HTTPException(status_code=400, detail="Incorrect latitude input")
    elif not valid_lon(lon):
        raise HTTPException(status_code=400, detail="Incorrect longitude input")
    
    lat, lon = opposite_side(lat, lon)
    try:
        req = requests.get(base_url + "?lat=" + str(lat) + "&lon=" + str(lon), headers=headers)
        return req.json()
    except:
        raise HTTPException(404, "Location not found")


# Auxiliary function to check for a valid latitude
def valid_lat(lat: float = None):
    return (lat != None) and (-90 <= lat and lat <= 90)

# Auxiliary function to check for a valid longitude
def valid_lon(lon: float = None):
    return (lon != None) and (-180 <= lon and lon <= 180)

# Auxiliary function to get the opposite latitude and longitude
def opposite_side(lat, lon):
    if lat > 0:
        lat = lat - 90
    else:
        lat = lat + 90
    if lon > 0:
        lon = lon - 180
    else:
        lon = lon + 180
    return (lat, lon)