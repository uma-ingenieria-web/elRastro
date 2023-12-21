from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
import httpx

import os

app = FastAPI()

CO2_RATE = 0.013

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

versionRoute = "api/v2"

load_dotenv()

API_KEY = os.getenv("X-APIKEY")


@app.get("/" + versionRoute + "/carbon/{origin_lat}/{origin_long}/{destination_lat}/{destination_long}/weight/{weight}")
async def get_carbon(origin_lat: float, origin_long: float, destination_lat: float, destination_long: float, weight: float):
    try:
        async with httpx.AsyncClient() as client:
            url = "https://api.freightos.com/api/v1/co2calc"
            
            if API_KEY is None:
                return {"error": "API_KEY is not set"}

            headers = {"Content-Type": "application/json", "x-apikey": API_KEY}
            response = await client.post(
                url,
                headers=headers,
                json={
                    "load": [
                        {"quantity": 1, "unitWeightKg": weight, "unitType": "boxes"}
                    ],
                    "legs": [
                        {
                            "mode": "LTL",
                            "origin": {
                                "longitude": origin_lat,
                                "latitude": origin_long,
                            },
                            "destination": {
                                "longitude": destination_lat,
                                "latitude": destination_long,
                            },
                            "carrierCode": "MEAU",
                        }
                    ],
                },
            )

            if response.status_code == 200:
                json_content = response.json()
                return CO2_RATE * (json_content.get("Ew") + json_content.get("Et"))
            else:
                return {"error": f"HTTP Error: {response.status_code}"}
    except HTTPException as e:
        return {"error": f"HTTP Exception: {str(e)}"}

