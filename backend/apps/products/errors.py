error_422 = {
    "description": "Invalid data",
    "content": {
        "application/json": {
            "example": {
                "detail": [
                    "Field 'field_name' is required",
                    "Field 'another_field' is required",
                ]
            }
        }
    },
}

error_400 = {
    "description": "Invalid ObjectId format",
    "content": {
        "application/json": {"example": {"message": "Invalid ObjectId format"}}
    },
}

error_404 = {
    "description": "Object not found",
    "content": {"application/json": {"example": {"message": "Object not found"}}},
}
