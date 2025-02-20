const PORT = 5555;
const MONGO_URL = "mongodb://localhost:27017/paymate";
const CLIENT_URL = "http://localhost:3000"
const COOKIE_LENGTH = 30 * 24 * 60 * 60 * 1000;

module.exports = {
    PORT,
    MONGO_URL,
    CLIENT_URL,
    COOKIE_LENGTH
};