const express = require("express");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const mongoose = require("mongoose");
const cors = require("cors");
const crypto = require("crypto");
const SessionSecret = crypto.randomBytes(32).toString("hex");

const { PORT, MONGO_URL, CLIENT_URL, COOKIE_LENGTH } = require("./config.js")

mongoose.connect(MONGO_URL).then(() => {
    console.log("MongoDB connected");
}   ).catch((error) => {    
    console.log("MongoDB connection error:", error);
});

const app = express()

const store = new MongoDBStore({
    uri: MONGO_URL,
    collection: 'Sessions',
})

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

app.use(express.json());

app.get('', (request, response) =>{
    response.send("PayMate App Server");
    response.end();
});

app.listen(PORT, () => {
    console.log(`App is listening on port: ${PORT}`);
});