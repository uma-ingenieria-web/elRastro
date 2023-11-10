from dotenv import load_dotenv
from fastapi import FastAPI

import os

app = FastAPI()

load_dotenv()

API_KEY = os.getenv("API_KEY")

versionRoute = "api/v1"

base_url = "https://api.api-ninjas.com/v1/reversegeocoding"
headers = {"X-Api-Key":API_KEY}
