import os
from dotenv import load_dotenv

load_dotenv()

FRONTEND_URL = os.getenv("FRONTEND_URL", "https://scamshieldinnovators.vercel.app/")
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
SESSION_SECRET_KEY = os.getenv("SESSION_SECRET_KEY", "supersecretkey")

# Detect if we are in production
# Render sets RENDER=true, Vercel sets VERCEL=1
IS_PRODUCTION = os.getenv("RENDER") == "true" or os.getenv("VERCEL") == "1" or "localhost" not in FRONTEND_URL
