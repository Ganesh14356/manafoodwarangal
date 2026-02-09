
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import datetime

app = FastAPI(title="ManaFood Warangal API")

# Models
class OrderItem(BaseModel):
    id: str
    name: str
    price: float
    quantity: int

class OrderCreate(BaseModel):
    restaurantId: str
    restaurantName: str
    items: List[OrderItem]
    total: float
    customerName: str
    customerPhone: str
    address: str
    locationUrl: Optional[str]

# In-memory DB for prototype (would use SQLAlchemy/PostgreSQL in production)
orders_db = []

@app.get("/")
async def root():
    return {"status": "ManaFood Backend Live", "region": "Warangal"}

@app.post("/api/orders")
async def create_order(order: OrderCreate):
    order_id = f"MF{1000 + len(orders_db)}"
    new_order = order.dict()
    new_order["id"] = order_id
    new_order["status"] = "Pending"
    new_order["createdAt"] = datetime.datetime.now().isoformat()
    orders_db.append(new_order)
    return {"message": "Order logged successfully", "orderId": order_id}

@app.get("/api/orders")
async def get_orders():
    return orders_db
