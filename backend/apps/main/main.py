from typing import Union

from fastapi import FastAPI
import pymongo

app = FastAPI()

# uri = f"mongodb+srv://{os.getenv('MONGODB_USER')}:{os.getenv('MONGODB_PASSWORD')}{@os.getenv('MONGODB_CLUSTER')}.mongodb.net/?retryWrites=true&w=majority

@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}