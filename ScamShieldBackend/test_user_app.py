import requests

port = 8000
url = f"http://localhost:{port}/predict"
payload = {
    "text": "Software Engineer portfolio. Hi I am a developer.",
    "url": "https://rajs1nghsde.vercel.app/"
}

try:
    res = requests.post(url, json=payload).json()
    print("Verdict:", res['prediction'])
    print("Confidence:", res['confidence'])
    print("Domain Check:", res['domain_verdict'])
except Exception as e:
    print("Error:", e)
