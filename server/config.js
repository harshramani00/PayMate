const dotenv = require('dotenv');
dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL || "mongodb+srv://paymateneu:vZLzwRy7FagWOLsR@paymate-cluster0.9met2.mongodb.net/paymate-neu?retryWrites=true&w=majority&appName=paymate-cluster0";
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
const COOKIE_LENGTH = process.env.COOKIE_LENGTH || 1000 * 60 * 60 * 24 * 7;
const JWT_SECRET = process.env.JWT_SECRET || 'paymateneu';

module.exports = {
    PORT,
    MONGO_URL,
    CLIENT_URL,
    COOKIE_LENGTH,
    JWT_SECRET
};