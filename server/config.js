const dotenv = require('dotenv');
dotenv.config();

const PORT = process.env.PORT;
const MONGO_URL = process.env.MONGO_URL;
const CLIENT_URL = process.env.CLIENT_URL;
const COOKIE_LENGTH = Number(process.env.COOKIE_LENGTH);

module.exports = {
    PORT,
    MONGO_URL,
    CLIENT_URL,
    COOKIE_LENGTH
};