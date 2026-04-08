from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Load env
load_dotenv()

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB
client = MongoClient(os.getenv("MONGO_URI"))
db = client["codeweaver"]

class PromptRequest(BaseModel):
    prompt: str


# -------- AI AGENT (RULE-BASED) -------- #

def analyze(prompt):
    features = []

    if "food" in prompt.lower():
        features += ["User login", "Restaurant listing", "Cart", "Order tracking"]

    if "ecommerce" in prompt.lower():
        features += ["Product listing", "Cart", "Checkout", "Payment gateway"]

    if "chat" in prompt.lower():
        features += ["Messaging", "User profiles", "Real-time updates"]

    if not features:
        features = ["User authentication", "Dashboard", "API integration"]

    return features


def plan(features):
    return {
        "frontend": "HTML/CSS/React",
        "backend": "FastAPI",
        "database": "MongoDB",
        "features": features
    }


def generate_code(plan):
    return f"""
# Frontend (HTML)
<html>
<body>
<h1>My App</h1>
<p>Features: {', '.join(plan['features'])}</p>
</body>
</html>

# Backend (FastAPI)
from fastapi import FastAPI
app = FastAPI()

@app.get("/")
def home():
    return {{"message": "App Running"}}

# Database Schema (MongoDB)
collection: users, orders, products
"""


# -------- API ROUTE -------- #

@app.post("/generate")
def generate_app(data: PromptRequest):
    try:
        features = analyze(data.prompt)
        architecture = plan(features)
        code = generate_code(architecture)

        result = {
            "features": features,
            "architecture": architecture,
            "code": code
        }

        # Save to DB
        db.history.insert_one({
            "prompt": data.prompt,
            "result": result
        })

        return result

    except Exception as e:
        return {"error": str(e)}


# Optional home route
@app.get("/")
def home():
    return {"message": "CodeWeaver AI running 🚀"}
