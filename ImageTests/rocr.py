# View complete code at: https://github.com/Asprise/receipt-ocr/tree/main/python-receipt-ocr
import requests

receiptOcrEndpoint = 'https://ocr.asprise.com/api/v1/receipt' # Receipt OCR API endpoint
imageFile = "C:/PayMate/PayMate/ImageTests/data/receipt 2.jpg" # // Modify this to use your own file if necessary
r = requests.post(receiptOcrEndpoint, data = { \
  'api_key': 'TEST',        # Use 'TEST' for testing purpose \
  'recognizer': 'US',       # can be 'US', 'CA', 'JP', 'SG' or 'auto' \
  'ref_no': 'ocr_python_123', # optional caller provided ref code \
  }, \
  files = {"file": open(imageFile, "rb")})

print(r.text) # result in JSON