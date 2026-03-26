from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import re
import numpy as np

app = FastAPI(title="ScamShield API", version="1.0.0")

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load trained model & vectorizer
model = joblib.load("models/fake_job_model.pkl")
vectorizer = joblib.load("models/vectorizer.pkl")

class JobInput(BaseModel):
    text: str

def clean_text(text: str) -> str:
    text = text.lower()
    text = re.sub(r"http\S+", "", text)
    text = re.sub(r"[^a-zA-Z]", " ", text)
    return text

def get_top_signals(text_clean: str, n: int = 5):
    """Return top n words contributing to fake / real classification."""
    feature_names = vectorizer.get_feature_names_out()
    vec = vectorizer.transform([text_clean]).toarray()[0]
    coef = model.coef_[0]  # works for LogisticRegression / LinearSVC

    # Weighted score per present word
    scores = {
        feature_names[i]: round(float(coef[i] * vec[i]), 2)
        for i in range(len(feature_names))
        if vec[i] > 0
    }

    sorted_scores = sorted(scores.items(), key=lambda x: x[1])
    top_real = sorted_scores[:n]          # most negative → real signals
    top_fake = sorted_scores[-n:][::-1]   # most positive → fake signals
    return top_fake, top_real

@app.get("/")
def home():
    return {"message": "ScamShield API is running 🚀", "version": "1.0.0"}

@app.post("/predict")
def predict(data: JobInput):
    text_clean = clean_text(data.text)
    vec = vectorizer.transform([text_clean])

    prob = float(model.predict_proba(vec)[0][1])  # probability of FAKE, cast to Python float
    is_fake = prob > 0.6
    confidence = round(prob * 100, 2) if is_fake else round((1 - prob) * 100, 2)

    try:
        top_fake, top_real = get_top_signals(text_clean)
        top_fake_signals = [f"{w} ({s})" for w, s in top_fake]
        top_real_signals = [f"{w} ({s})" for w, s in top_real]
    except Exception:
        top_fake_signals = []
        top_real_signals = []

    return {
        "prediction": "⚠️ Fake Job" if is_fake else "✅ Real Job",
        "is_fake": is_fake,
        "confidence": confidence,
        "top_fake_signals": top_fake_signals,
        "top_real_signals": top_real_signals,
    }