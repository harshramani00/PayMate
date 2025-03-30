import pytesseract
from pytesseract import Output
from PIL import Image
import cv2

pytesseract.pytesseract.tesseract_cmd = 'C:/Tesseract-OCR/tesseract.exe'

img_path1 = 'C:/PayMate/PayMate/ImageTests/data/receipt 2.jpg'
text = pytesseract.image_to_string(img_path1,lang='eng')
print(text)