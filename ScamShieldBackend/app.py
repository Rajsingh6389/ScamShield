from fastapi import FastAPI, Request, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from fastapi.responses import RedirectResponse
from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware
from pydantic import BaseModel
import joblib
import re
import io
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
from authlib.integrations.starlette_client import OAuth
import numpy as np
from urllib.parse import urlparse
from config.settings import FRONTEND_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, SESSION_SECRET_KEY, IS_PRODUCTION

# global easyocr reader
ocr_reader = None
# ---------------- APP INIT ---------------- #
app = FastAPI(title="ScamShield API", version="2.0.0")

# CORS
print("FRONTEND_URL:", FRONTEND_URL)
origins = [
    FRONTEND_URL.rstrip("/"),
    "http://localhost:5173",
    "https://scamshieldinnovators.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Trust the Vercel proxy headers
app.add_middleware(ProxyHeadersMiddleware, trusted_hosts=["*"])

# Session Middleware (Optimized for Vercel Proxy)
app.add_middleware(
    SessionMiddleware, 
    secret_key=SESSION_SECRET_KEY,
    same_site="lax",  # Crucial for cross-site redirects from Google
    https_only=True   # Both Vercel and Render use HTTPS
)

# ---------------- LOAD MODEL ---------------- #
model = joblib.load("models/fake_job_model.pkl")
vectorizer = joblib.load("models/vectorizer.pkl")

email_model = joblib.load("models/email_model.pkl")
email_columns = joblib.load("models/columns.pkl")

# url_model is disabled/removed. Using trusted domain list instead.
url_model = None

# ---------------- OAUTH SETUP ---------------- #
oauth = OAuth()

oauth.register(
    name='google',
    client_id=GOOGLE_CLIENT_ID,
    client_secret=GOOGLE_CLIENT_SECRET,
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={
        'scope': 'openid email profile https://www.googleapis.com/auth/gmail.readonly'
    }
)

# ---------------- MODELS ---------------- #
class EmailRequest(BaseModel):
    content: str

class JobInput(BaseModel):
    text: str
    url: str = ""

def text_to_vector(text, columns):
    text = re.sub(r"[^a-zA-Z]", " ", text.lower())
    words = text.split()
    vector = [words.count(col) for col in columns]
    return np.array(vector).reshape(1, -1)
# ---------------- UTILS ---------------- #
def clean_text(text: str) -> str:
    text = text.lower()
    text = re.sub(r"http\S+", "", text)
    text = re.sub(r"[^a-zA-Z]", " ", text)
    return text

# ---------------- AUTH ROUTES ---------------- #
@app.get("/auth/google")
async def login(request: Request):
    if IS_PRODUCTION:
        # For Vercel proxy, we must use the Vercel domain for the callback
        redirect_uri = f"{FRONTEND_URL.rstrip('/')}/api/auth/callback"
    else:
        redirect_uri = request.url_for('auth_callback')
    
    return await oauth.google.authorize_redirect(request, redirect_uri)

@app.get("/auth/callback")
async def auth_callback(request: Request):
    if IS_PRODUCTION:
        redirect_uri = f"{FRONTEND_URL.rstrip('/')}/api/auth/callback"
    else:
        redirect_uri = request.url_for('auth_callback')
    
    try:
        token = await oauth.google.authorize_access_token(request, redirect_uri=redirect_uri)
        userinfo = token.get("userinfo", {})
        request.session["user"] = {
            "access_token": token["access_token"],
            "name": userinfo.get("name", ""),
            "email": userinfo.get("email", ""),
            "picture": userinfo.get("picture", ""),
        }
        return RedirectResponse(url=FRONTEND_URL)
    except Exception as e:
        print(f"--- OAUTH ERROR ---: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"OAuth error: {str(e)}")

@app.get("/me")
def get_me(request: Request):
    user = request.session.get("user")
    if not user:
        raise HTTPException(status_code=401, detail="Not logged in")
    return {
        "name": user.get("name"),
        "email": user.get("email"),
        "picture": user.get("picture"),
    }

@app.get("/logout")
def logout(request: Request):
    request.session.clear()
    return {"message": "Logged out successfully"}

# ---------------- EMAIL SCAN ---------------- #
@app.get("/scan-inbox")
def scan_inbox(request: Request):

    token = request.session.get("user")

    if not token:
        return {"error": "User not logged in"}

    creds = Credentials(token['access_token'])

    service = build('gmail', 'v1', credentials=creds)

    results = service.users().messages().list(userId='me', maxResults=10).execute()
    messages = results.get('messages', [])

    output = []

    for msg in messages:
        msg_data = service.users().messages().get(
            userId='me', id=msg['id'], format='metadata',
            metadataHeaders=['From', 'Subject', 'Date']
        ).execute()

        headers = {h['name']: h['value'] for h in msg_data.get('payload', {}).get('headers', [])}
        snippet = msg_data.get('snippet', '')

        text_clean = clean_text(snippet)
        vec = text_to_vector(snippet, email_columns)

        pred = email_model.predict(vec)[0]
        prob = email_model.predict_proba(vec)[0][1]

        output.append({
            "snippet": snippet,
            "subject": headers.get("Subject", "(No Subject)"),
            "sender": headers.get("From", "Unknown"),
            "date": headers.get("Date", ""),
            "result": "SCAM" if pred else "SAFE",
            "risk": round(prob * 100, 2)
        })

    return output

# ---------------- SINGLE EMAIL SCAN ---------------- #
@app.post("/scan-email")
def scan_email(req: EmailRequest):
    text_clean = clean_text(req.content)
    vec = text_to_vector(req.content, email_columns)

    pred = email_model.predict(vec)[0]
    prob = email_model.predict_proba(vec)[0][1]

    return {
        "result": "SCAM" if pred else "SAFE",
        "risk_score": round(prob * 100, 2),
        "reason": "Suspicious keywords or phishing pattern detected"
    }

# ---------------- JOB SCAN ---------------- #
def get_top_signals(text_clean: str, n: int = 5):
    feature_names = vectorizer.get_feature_names_out()
    vec = vectorizer.transform([text_clean]).toarray()[0]
    coef = model.coef_[0]

    scores = {
        feature_names[i]: round(float(coef[i] * vec[i]), 2)
        for i in range(len(feature_names))
        if vec[i] > 0
    }

    sorted_scores = sorted(scores.items(), key=lambda x: x[1])
    top_real = sorted_scores[:n]
    top_fake = sorted_scores[-n:][::-1]

    return top_fake, top_real

@app.post("/predict")
def predict(data: JobInput):
    text_clean = clean_text(data.text)
    vec = vectorizer.transform([text_clean])

    prob = float(model.predict_proba(vec)[0][1])
    is_fake = prob > 0.6
    confidence = round(prob * 100, 2) if is_fake else round((1 - prob) * 100, 2)

    try:
        top_fake, top_real = get_top_signals(text_clean)
        top_fake_signals = [f"{w} ({s})" for w, s in top_fake]
        top_real_signals = [f"{w} ({s})" for w, s in top_real]
    except:
        top_fake_signals = []
        top_real_signals = []

    domain = ""
    domain_verdict = "Unknown"
    
    if data.url:
        parsed_uri = urlparse(data.url)
        domain = parsed_uri.netloc.replace("www.", "")
        
        trusted_domains = ["linkedin.com", "indeed.com", "glassdoor.com", "wellfound.com", "ycombinator.com", "monster.com", "naukri.com", "ziprecruiter.com", "internshala.com"]
        if any(d in domain for d in trusted_domains):
            domain_verdict = "Trusted Portal"
        else:
            domain_verdict = "Unverified Source"

    return {
        "prediction": "⚠️ Fake Job" if is_fake else "✅ Real Job",
        "is_fake": is_fake,
        "confidence": confidence,
        "top_fake_signals": top_fake_signals,
        "top_real_signals": top_real_signals,
        "domain": domain,
        "domain_verdict": domain_verdict
    }

@app.post("/scan-file")
async def scan_file(file: UploadFile = File(...)):
    global ocr_reader
    contents = await file.read()
    filename = file.filename.lower()
    text_extracted = ""

    if filename.endswith(".pdf"):
        import pdfplumber
        with pdfplumber.open(io.BytesIO(contents)) as pdf:
            text_extracted = "\n".join([page.extract_text() or "" for page in pdf.pages])
    elif filename.endswith((".png", ".jpg", ".jpeg", ".webp")):
        import easyocr
        if ocr_reader is None:
            ocr_reader = easyocr.Reader(['en'])
        result = ocr_reader.readtext(contents, detail=0)
        text_extracted = " ".join(result)
    else:
        raise HTTPException(status_code=400, detail="Unsupported file format. Please upload PDF, PNG, or JPG.")

    if not text_extracted.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from the uploaded document.")

    text_clean = clean_text(text_extracted)
    vec = vectorizer.transform([text_clean])

    prob = float(model.predict_proba(vec)[0][1])
    is_fake = prob > 0.6
    confidence = round(prob * 100, 2) if is_fake else round((1 - prob) * 100, 2)

    try:
        top_fake, top_real = get_top_signals(text_clean)
        top_fake_signals = [f"{w} ({s})" for w, s in top_fake]
        top_real_signals = [f"{w} ({s})" for w, s in top_real]
    except:
        top_fake_signals = []
        top_real_signals = []

    return {
        "extracted_text": text_extracted,
        "prediction": "⚠️ Fake Job" if is_fake else "✅ Real Job",
        "is_fake": is_fake,
        "confidence": confidence,
        "top_fake_signals": top_fake_signals,
        "top_real_signals": top_real_signals,
    }


# ---------------- ROOT ---------------- #
@app.get("/")
def home():
    return {
        "message": "ScamShield API running 🚀",
        "version": "2.0 (OAuth Enabled)"
    }