import requests

url = "http://localhost:8000/predict"

texts = [
    "Software Engineer needed at Google. Required skills: Python, C++, standard benefits.",
    "Marketing Manager needed. Create digital modules and campaigns with greater reach.",
    "Urgent hiring! Work from home and earn 5000 dollars a week. Just send bank account details.",
    "Data Scientist at Meta. Looking for experienced candidates in ML and AI. Full time remote.",
    "Full Stack Web Developer Intern. Will work on real-world projects. Strong Python fundamentals required."
]

for t in texts:
    res = requests.post(url, json={"text": t}).json()
    print(f"Conf: {res['confidence']} | {res['prediction']} | Signals: {res['top_real_signals'][:2] if not res['is_fake'] else res['top_fake_signals'][:2]}")
