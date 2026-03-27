import requests
from PIL import Image, ImageDraw, ImageFont

# create dummy image with text
img = Image.new('RGB', (400, 100), color = (255, 255, 255))
d = ImageDraw.Draw(img)
d.text((10,10), "Earn $5000 a week working from home! Guaranteed income.", fill=(0,0,0))
img.save('dummy.png')

print("Testing /scan-file with dummy.png...")
try:
    with open('dummy.png', 'rb') as f:
        r = requests.post('http://localhost:8000/scan-file', files={'file': f})
        print(f"Status: {r.status_code}")
        print(r.json())
except Exception as e:
    print("Error connecting:", e)
