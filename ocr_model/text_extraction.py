import openai
import pytesseract
import re
from PIL import Image, ImageEnhance, ImageFilter
from pathlib import Path
import os
from dotenv import load_dotenv
import json
from datetime import datetime

class ReceiptProcessor:
    def __init__(self):
        self.client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.raw_text = ""
        self.price_pattern = r'\$?(\d+[.,]?\d{0,2})'
        self.date_formats = [
            (r'\b(\d{2})/(\d{2})/(\d{4})\b', '%m/%d/%Y'),
            (r'\b(\d{4})-(\d{2})-(\d{2})\b', '%Y-%m-%d')
        ]

    def process(self, image_path: Path) -> dict:
        try:
            self.raw_text = self._enhanced_ocr(image_path)
            return {
                "store": self._extract_store(),
                "date": self._parse_date(),
                "items": self._get_validated_items(),
                "tax": self._extract_tax(),
                "total": self._extract_total(),
                "currency": "$"
            }
        except Exception as e:
            return {"error": str(e)}

    def _enhanced_ocr(self, path: Path) -> str:
        """OCR with decimal point protection"""
        img = Image.open(path)
        img = img.convert('L')
        img = ImageEnhance.Sharpness(img).enhance(2.0)  # Emphasize small dots
        text = pytesseract.image_to_string(img, config='--oem 3 --psm 6')
        return self._clean_text(text)

    def _clean_text(self, text: str) -> str:
        """Decimal-aware cleaning"""
        corrections = [
            # Protect existing decimals first
            (r'(\d)\.(\d{2})', r'\1<DECIMAL>\2'),
            # Fix common OCR errors
            (r'(\d)[lI](\d)', r'\1.\2'),
            (r'\$(\d{1,2})0{2,}', r'$\1.00'),
            (r'(\d) (\d)', r'\1\2'),
            # Restore protected decimals
            (r'<DECIMAL>', r'.')
        ]
        for pattern, replacement in corrections:
            text = re.sub(pattern, replacement, text)
        return text

    def _parse_price(self, price_str: str) -> float:
        """Context-aware price parsing"""
        try:
            cleaned = re.sub(r'[^\d.]', '', price_str)
            parts = cleaned.split('.')
            
            if len(parts) == 1:
                # Auto-detect missing decimal for small amounts
                if len(cleaned) > 2 and int(cleaned) > 1000:
                    return float(cleaned)
                return float(cleaned)/100
                
            return round(float(cleaned), 2)
        except:
            return 0.0

    def _get_validated_items(self) -> list:
        """Price validation with sanity checks"""
        items = []
        for match in re.finditer(r'(.+?)\s+(\$?\d+\.?\d{0,2})', self.raw_text):
            name = self._clean_name(match.group(1))
            price = self._parse_price(match.group(2))
            
            # Price sanity checks
            if price > 1000:  # Likely missing decimal
                price = price / 100
            if price < 0.01:  # Invalid price
                continue
                
            items.append({"name": name, "price": round(price, 2)})
        
        return items

    def _regex_item_parser(self) -> list:
        """Initial regex-based item extraction"""
        item_matches = re.findall(
            fr'(.+?)\s+({self.price_pattern})',
            self.raw_text,
            flags=re.IGNORECASE
        )
        return [{
            "name": self._clean_name(m[0]),
            "price": self._parse_price(m[1])
        } for m in item_matches if m[0].strip()]

    def _parse_price(self, price_str: str) -> float:
        """Smart price parsing with error correction"""
        try:
            # Remove non-numeric characters except decimal
            cleaned = re.sub(r'[^\d.]', '', price_str)
            
            # Handle multiple decimals
            parts = cleaned.split('.')
            if len(parts) > 2:
                return float(f"{parts[0]}.{''.join(parts[1:])[:2]}")
                
            # Handle missing decimals for small amounts
            if len(cleaned) in (3,4) and '.' not in cleaned:
                return float(cleaned[:-2] + '.' + cleaned[-2:])
                
            return round(float(cleaned), 2)
        except:
            return 0.0

    def _ai_item_parser(self) -> list:
        """AI parsing with strict output validation"""
        prompt = f"""Extract items from this receipt. Follow exactly:
1. Output ONLY valid JSON array
2. Format: [{{"name": "...", "price": x.xx}}]
3. Fix OCR errors using context
4. Prices must match text values

Text:
{self.raw_text}"""

        try:
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1
            )
            json_str = response.choices[0].message.content
            
            # Clean JSON response
            json_str = json_str.split('```json')[-1].split('```')[0].strip()
            return json.loads(json_str)
        except Exception as e:
            raise RuntimeError(f"AI parsing failed: {str(e)}")

    def _cross_validate_items(self, items: list) -> list:
        """Ensure items match original text"""
        validated = []
        for item in items:
            # Find matching line in raw text
            match = re.search(
                fr'{re.escape(item["name"])}.*?{self.price_pattern}',
                self.raw_text,
                re.IGNORECASE
            )
            if match:
                item["price"] = self._parse_price(match.group(1))
                validated.append(item)
        return validated

    def _validate_total(self, items: list) -> bool:
        """Check if items sum matches total"""
        try:
            item_sum = sum(item["price"] for item in items)
            total = self._extract_total()
            return abs(item_sum + self._extract_tax() - total) <= 0.01
        except:
            return False

    def _extract_total(self) -> float:
        """Reliable total extraction"""
        total_match = re.search(
            fr'Total\D*({self.price_pattern})',
            self.raw_text,
            re.IGNORECASE
        )
        return self._parse_price(total_match.group(1)) if total_match else 0.0

    def _extract_tax(self) -> float:
        """Tax amount extraction"""
        tax_match = re.search(
            fr'Tax\D*({self.price_pattern})',
            self.raw_text,
            re.IGNORECASE
        )
        return self._parse_price(tax_match.group(1)) if tax_match else 0.0

    def _parse_date(self) -> str:
        """Flexible date parsing"""
        for pattern, fmt in self.date_formats:
            match = re.search(pattern, self.raw_text)
            if match:
                try:
                    dt = datetime.strptime(match.group(), fmt)
                    return dt.strftime("%Y-%m-%d")
                except:
                    continue
        return ""

    def _extract_store(self) -> str:
        """Store name detection"""
        store_match = re.search(
            r'(?:Shop|Store)\s*Name:\s*(.+)',
            self.raw_text,
            re.IGNORECASE
        )
        return store_match.group(1).strip() if store_match else "Unknown Store"

    def _detect_currency(self) -> str:
        """Currency symbol detection"""
        return "$" if "$" in self.raw_text else "€" if "€" in self.raw_text else "£"

    def _clean_name(self, name: str) -> str:
        """Clean item names"""
        return re.sub(r'\b(?:price|total|tax)\b', '', name, flags=re.IGNORECASE).strip()

if __name__ == "__main__":
    load_dotenv()
    processor = ReceiptProcessor()
    receipt_path = Path(__file__).parent / "data" / "receipt 2.jpg"
    result = processor.process(receipt_path)
    print(json.dumps(result, indent=2, ensure_ascii=False))