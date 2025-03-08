const User = require('../models/user.model.js');
const bcryptjs = require('bcryptjs');

const signup = async (req, res, next) => {
    console.log('Received signup request:', req.body); // Log the request body

    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        console.log('Missing required fields'); // Log missing fields
        return res.status(400).json({ error: 'All fields are required' });
    }

    const hashedPassword = bcryptjs.hashSync(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });

    try {
        await newUser.save();
        console.log('User created successfully:', newUser); // Log the created user
        res.status(201).json('User created successfully!');
    } catch (error) {
        next(error);
    }
};

module.exports = { signup };