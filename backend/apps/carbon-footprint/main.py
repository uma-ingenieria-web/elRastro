from dotenv import load_dotenv
from fastapi import FastAPI

import os

app = FastAPI()

load_dotenv()

API_KEY = os.getenv("API_KEY")