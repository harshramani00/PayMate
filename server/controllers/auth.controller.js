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

const signin = async (req, res) => {
  console.log('Received signin request:');
  const { email, password } = req.body;

  if (!email || !password) {
    console.log('Missing required fields'); // Log missing fields
    return res.status(400).json({ error: 'All fields are required' });
}
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Compare passwords
    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    res.status(200).json({ message: 'Login successful'});

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { signup, signin };