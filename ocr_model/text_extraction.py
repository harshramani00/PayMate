import openai
import pytesseract
from PIL import Image
import os
from dotenv import load_dotenv
from pathlib import Path

# === Load environment variables ===
load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")

if not api_key:
    raise ValueError("❌ OPENAI_API_KEY not found in .env file")

# === Get base directory (where this script lives) ===
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"  # Points to: ocr_model/data
IMAGE_NAME = "reciept 3.jpg"
IMAGE_PATH = DATA_DIR / IMAGE_NAME

def extract_text_from_image(image_path):
    """Performs OCR on the provided image and returns extracted text."""
    try:
        image = Image.open(image_path)
        text = pytesseract.image_to_string(image)
        return text.strip()
    except Exception as e:
        raise RuntimeError(f"OCR failed: {e}")

def get_structured_data(text):
    """Sends extracted text to OpenAI and receives structured JSON response."""
    try:
        client = openai.OpenAI(api_key=api_key)
        response = client.chat.completions.create(
            model="gpt-4-turbo",
            messages=[
                {
                    "role": "user",
                    "content": f"""
Extract structured information from the following receipt text:

{text}

Return the output in this JSON format:
{{
  "store": "",
  "date": "",
  "items": [
    {{"name": "", "price": ""}},
    ...
  ],
  "total": ""
}}
"""
                }
            ]
        )
        return response.choices[0].message.content
    except Exception as e:
        raise RuntimeError(f"OpenAI API failed: {e}")

if __name__ == "__main__":
    if not IMAGE_PATH.exists():
        print(f"❌ File not found: {IMAGE_PATH}")
    else:
        try:
            text = extract_text_from_image(IMAGE_PATH)
            if not text:
                raise ValueError("No text found in image.")
            print("📄 Extracted Text:\n", text)

            structured = get_structured_data(text)
            print("\n✅ Structured Output:\n", structured)

        except Exception as err:
            print("❌ Error:", err)
