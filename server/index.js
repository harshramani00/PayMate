const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
const session = require('express-session');
const crypto = require('crypto');
const MongoDBStore = require('connect-mongodb-session')(session);
const { PORT, MONGO_URL, CLIENT_URL, COOKIE_LENGTH } = require('./config.js');
const userRouter = require('./routes/user.route.js');
const authRouter = require('./routes/auth.route.js');
const cookieParser = require('cookie-parser');

const SessionSecret = crypto.randomBytes(32).toString("hex");

const app = express();
app.use(express.json());
app.use(cookieParser());

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


app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    return res.status(statusCode).json({
      success: false,
      statusCode,
      message,
    });
  });