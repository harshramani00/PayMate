import User from '../models/user.model.js';
import bcryptjs from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export const signup = async (req, res, next) => {
  const { username, email, password } = req.body;
  const hashedPassword = bcryptjs.hashSync(password, 10);
  const newUser = new User({ username, email, password: hashedPassword });
  try {
    await newUser.save();
    res.status(201).json('User created successfully!');
  } catch (error) {
    next(error);
  }
};

export const signin = async (req, res, next) => {
  const { email, password } = req.body;
  console.log('Signin attempt:', { email }); // Debug log
  try {
    const validUser = await User.findOne({ email });
    console.log('User found:', validUser ? 'yes' : 'no'); // Debug log
    if (!validUser) return next(errorHandler(404, 'User not found!'));

    const validPassword = bcryptjs.compareSync(password, validUser.password);
    console.log('Password valid:', validPassword ? 'yes' : 'no'); // Debug log
    if (!validPassword) return next(errorHandler(401, 'Wrong credentials!'));

    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET); // Debug log
    const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET);
    const { password: pass, ...rest } = validUser._doc;
    
    res
      .cookie('access_token', token, { httpOnly: true })
      .status(200)
      .json(rest);
  } catch (error) {
    console.error('Signin error:', error); // Debug log
    next(error);
  }
};