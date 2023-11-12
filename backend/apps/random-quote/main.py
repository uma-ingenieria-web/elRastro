from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, status
import errors

import os
import requests

app = FastAPI()

load_dotenv()

API_KEY = os.getenv("API_KEY")

versionRoute = "api/v1"

base_url = "https://api.api-ninjas.com/v1/quotes"
headers = {"X-Api-Key":API_KEY}


# Get a random quote from a random category
@app.get("/" + versionRoute + "/quote",
            summary="Get a random quote from a random category",
            response_description="Returns a random quote from a random category",
            status_code=status.HTTP_200_OK,
            responses={404: errors.error_404})
def root():
    req = requests.get(base_url, headers=headers)
    if req.status_code != 200:
        raise HTTPException(404, "Quote not found")
    return {"quote": req.json()[0]["quote"]}


# Get a random quote from a category
@app.get("/" + versionRoute + "/quote/{category}",
            summary="Get a random quote from a category",
            response_description="Returns a random quote from category",
            status_code=status.HTTP_200_OK,
            responses={400: errors.error_400})
def get_quote(category: str):
    try:
        req = requests.get(base_url + "?category=" + category, headers=headers)
        return {"quote": req.json()[0]["quote"]}
    except:
        raise HTTPException(status_code=400, detail="Invalid category")
    

# Get 'amount' of random quotes from random categories
@app.get("/" + versionRoute + "/quotes",
            summary="Get 'amount' of random quotes from random categories",
            response_description="Returns 'amount' of random quotes from random categories",
            status_code=status.HTTP_200_OK,
            responses={400: errors.error_400_amount})
def get_quotes(amount: int = None):
    if amount == None:
        raise HTTPException(status_code=400, detail="Must specify amount as a query parameter")

    if amount < 1 or amount > 10:
        raise HTTPException(status_code=400, detail="Amount must be a number between 1-10, inclusive")
    
    try:
        # Now getting more quotes is now a premium service
        # req = requests.get(base_url + "?limit=" + str(amount), headers=headers)
        req = requests.get(base_url + str(amount), headers=headers)
        quotes = []
        for i in range(amount):
            quotes.append(req.json()[i]["quote"])
        return {"quotes": quotes}
    except:
        raise HTTPException(status_code=400, detail="Invalid amount")