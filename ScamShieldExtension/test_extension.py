import requests
import json

print("\n--- Testing Extension Flow against ScamShield API ---")

# The extension extracts document.body.innerText and posts it to /predict
url = "http://localhost:8000/predict"

# Simulate extracted page text (LinkedIn Fake Job)
dummy_text = """
Hiring urgently! Work from home and earn $10,000 per week. 
No experience required. Send your bank details to get started.
We guarantee fast money.
"""

print(f"> Sending extracted text to backend ({url})...")
try:
    response = requests.post(url, json={"text": dummy_text})
    if response.status_code == 200:
        data = response.json()
        print("\n[SUCCESS] API processed the extension payload.")
        print(f"Prediction: {data['prediction']}")
        print(f"Confidence: {data['confidence']}%")
        print(f"Top Fake Signals: {data['top_fake_signals']}")
    else:
        print(f"[ERROR] API returned {response.status_code}: {response.text}")
except Exception as e:
    print(f"[ERROR] Connection failed: {str(e)}")
