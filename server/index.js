const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
const session = require('express-session');
const crypto = require('crypto');
const MongoDBStore = require('connect-mongodb-session')(session);
const cookieParser = require('cookie-parser');
const { PORT, MONGO_URL, CLIENT_URL, COOKIE_LENGTH } = require('./config.js');
const userRouter = require('./routes/user.route.js');
const authRouter = require('./routes/auth.route.js');
const receiptRouter = require('./routes/receipt.route.js');

const SessionSecret = crypto.randomBytes(32).toString("hex");

const app = express();

// Middleware
app.use(express.json()); // Parse JSON before anything else
app.use(cookieParser()); // ✅ cookieParser once, before session

// CORS
app.use(
  cors({
    credentials: true,
    origin: CLIENT_URL, // No need for array if single origin
  })
);

// Session Store
const store = new MongoDBStore({
  uri: MONGO_URL,
  collection: 'Sessions',
});

store.on('error', function (error) {
  console.error('SESSION STORE ERROR:', error);
});

app.use(
  session({
    secret: SessionSecret,
    resave: false,
    saveUninitialized: false, // 🔄 Better to avoid creating sessions for unauthenticated users
    cookie: {
      maxAge: COOKIE_LENGTH,
      httpOnly: true,
      sameSite: 'Lax', // Or 'None' if using HTTPS with secure: true
      secure: process.env.NODE_ENV === 'production'
    },
    store,
  })
);

// MongoDB Connection
mongoose.connect(MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.log("MongoDB connection error:", error));

// Routes
app.use("/server/user", userRouter);
app.use("/server/auth", authRouter);
app.use("/server/receipt", receiptRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Global Error:", err); // helpful
  if (res.headersSent) {
    return next(err);
  }
  try {
    return res.status(err.statusCode || 500).json({
      success: false,
      statusCode: err.statusCode || 500,
      message: err.message || 'Internal Server Error',
    });
  } catch (jsonError) {
    console.error("Error sending error response:", jsonError);
    return res.end();
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`App is listening on port: ${PORT}`);
});
