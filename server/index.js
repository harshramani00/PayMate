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
const splitRouter = require('./routes/splitAssignment.route.js');
const processedReceiptRouter = require('./routes/processedReceipt.route.js');

const SessionSecret = crypto.randomBytes(32).toString("hex");

const app = express();
app.use(express.json());

mongoose.connect(MONGO_URL).then(() => {
    console.log("MongoDB connected");
}   ).catch((error) => {    
    console.log("MongoDB connection error:", error);
});

const store = new MongoDBStore({
    uri: MONGO_URL,
    collection: 'Sessions',
});

app.use(
    cors({
        credentials: true,
        origin: [CLIENT_URL],
    }),
    cookieParser(),
    session({
        secret: SessionSecret,
        resave: false,
        saveUninitialized: true,
        cookie: {
            maxAge: COOKIE_LENGTH
        },
        store: store,
    })
);


app.listen(PORT, () => {
    console.log(`App is listening on port: ${PORT}`);
});

app.use("/server/user", userRouter);
app.use("/server/auth", authRouter);
app.use('/server/receipt', receiptRouter);
app.use("/server/receipt", processedReceiptRouter);
app.use('/server/splits', splitRouter);

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    return res.status(statusCode).json({
      success: false,
      statusCode,
      message,
    });
  });
