error_400 = {
    "description": "Invalid category",
    "content": {
        "application/json": {"example": {"message": "Invalid category"}}
    }
}

error_400_amount = {
    "description": "Invalid amount",
    "content": {
        "application/json": {"example": {"message": "Invalid amount"}}
    }
}

error_404 = {
    "description": "Quote not found",
    "content": {"application/json": {"example": {"message": "Quote not found"}}},
}