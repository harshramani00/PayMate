import jwt from 'jsonwebtoken';
import { errorHandler } from './error.js';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export const verifyToken = (req, res, next) => {
  const token = req.cookies.access_token;
  
  if (!token) return next(errorHandler(401, 'Unauthorized'));

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return next(errorHandler(403, 'Forbidden'));

    req.user = user;
    next();
  });
};