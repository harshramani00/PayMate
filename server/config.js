const dotenv = require('dotenv');
dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/paymate';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
const COOKIE_LENGTH = process.env.COOKIE_LENGTH || 1000 * 60 * 60 * 24 * 7;

module.exports = {
    PORT,
    MONGO_URL,
    CLIENT_URL,
    COOKIE_LENGTH
};