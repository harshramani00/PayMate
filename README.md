# PayMate – Automated Receipt Splitting

**Built for CS 5340 at Northeastern University**  
By Dhruv Belai, Aditya Bhanwadiya, and Kaustubh Chaudhari

---

## Overview

PayMate is a full-stack web application that makes bill splitting simple and efficient.  
Just upload a photo of your receipt — our app uses **OCR (Tesseract)**, **RegEx** and **AI (OpenAI API)** to automatically detect items and prices. You can assign individuals to each item, and the app calculates each person’s share, including **tax**, **tip**, and **discounts**.  

You can also view or download the final split in a clean format.

---

## Tech Stack

- **Frontend**: React, Redux, React Router, CSS
- **Backend**: Node.js, Express
- **Database**: MongoDB + Mongoose
- **OCR**: Tesseract
- **AI**: OpenAI GPT-4
- **Other Tools**: Multer (file upload), JWT Auth, dotenv, jsPDF

---

## Key Features

- 📸 Upload receipts as images (JPG/PNG)
- 🤖 Smart item extraction using OCR + AI
- 👥 Assign people to items
- 💰 Automatically calculates tax, tip, and discount splits
- 📄 View final breakdown in a clean table
- 🧾 Download the result as a PDF
- 📚 View history of all scanned receipts

---

## How It Works

1. **Upload Receipt**: The image is enhanced and passed through Tesseract OCR.
2. **Parse Items**: OCR text is cleaned and sent to OpenAI for structured item detection.
3. **Extract Fields**: Total, tax, tip, and discount are extracted using regex.
4. **Assign Shares**: Users assign people to items manually in the UI.
5. **Finalize Split**: Backend stores the final split; frontend displays it and allows PDF download.

---

## Local Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/paymate.git
cd paymate
```
### 2 Setup Backend

```bash
cd server
npm install
touch .env
```
Add the following to `.env`:

```bash
MONGO_URI=your_mongo_uri
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_key
```

Then start the backend:

```bash
npm start
```

### 3. Setup Frontend
```bash
cd client
npm install
npm start
```

