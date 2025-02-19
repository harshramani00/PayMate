# PayMate - Receipt Scanner & Bill Splitter

*Splitting Bills made easy.*

*Tech Stack*: MongoDB, Express.js, React, Node.js (MERN)

# *Code Structure:*

## Backend (Node.js + Express.js)
- backend/
  - config/
    - db.js (MongoDB connection)
    - cloudStorage.js (Cloud storage setup: AWS S3, Firebase, etc.)
  - controllers/
    - authController.js (Handles user authentication)
    - receiptController.js (Handles receipt upload & OCR processing)
    - splitController.js (Handles bill splitting logic)
  - models/
    - User.js (User schema)
    - Receipt.js (Receipt schema)
    - Split.js (Split schema)
  - routes/
    - authRoutes.js (Authentication endpoints)
    - receiptRoutes.js (Receipt upload & OCR endpoints)
    - splitRoutes.js (Bill splitting endpoints)
  - services/
    - ocrService.js (OCR processing using Tesseract.js or external API)
  - middleware/
    - authMiddleware.js (JWT authentication middleware)
  - index.js (Main Express.js entry point)
  - package.json (Backend dependencies)

## Frontend (React + TailwindCSS)
- frontend/
  - public/ (Static assets like favicon, index.html)
  - src/
    - components/
      - Navbar.js (Navigation bar)
      - ReceiptCard.js (Receipt preview component)
    - pages/
      - Landing.js (Landing page)
      - Login.js (Login form)
      - Dashboard.js (User dashboard)
      - UploadReceipt.js (Receipt upload and OCR page)
      - SplitBill.js (Assign purchases to users)
    - hooks/
      - useAuth.js (Authentication logic)
    - context/
      - AuthContext.js (Global authentication state)
    - services/
      - authService.js (Authentication API calls)
      - receiptService.js (OCR & receipt handling API calls)
      - splitService.js (Bill splitting API calls)
    - App.js (Main app component)
    - index.js (React entry point)
    - styles/ (Global styles using TailwindCSS)
  - package.json (Frontend dependencies)

## Other
- .gitignore (Git ignore file)
- README.md (Project documentation)

## Navigating the project
Run server:

`cd backend`

`npm run dev`

Then, go to browser: localhost:5555