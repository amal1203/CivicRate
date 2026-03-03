import bcryptjs from 'bcryptjs';
import User from '../models/user.model.js';

export const checkSignupAvailability = async (req, res) => {
  try {
    const { username, phonenumber } = req.body;

    if (!username || !phonenumber) {
      return res.status(400).json({ message: 'Username and phone number are required' });
    }

    const [usernameUser, phoneUser] = await Promise.all([
      User.findOne({ username }),
      User.findOne({ phonenumber }),
    ]);

    return res.status(200).json({
      usernameExists: Boolean(usernameUser),
      phoneExists: Boolean(phoneUser),
    });
  } catch (error) {
    console.error('Availability check error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const signup = async (req, res) => {
  try {
    const { username, phonenumber, password } = req.body;

    if (!username || !phonenumber || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existingUser = await User.findOne({
      $or: [{ username }, { phonenumber }],
    });

    if (existingUser) {
      return res.status(409).json({ message: 'Username or phone number already exists' });
    }

    const hashedPassword = bcryptjs.hashSync(password, 10);

    const newUser = new User({
      username,
      phonenumber,
      password: hashedPassword,
    });

    await newUser.save();

    const { password: _, ...safeUser } = newUser._doc;

    return res.status(201).json({
      message: 'Signup successful',
      user: safeUser,
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const signin = async (req, res) => {
  try {
    const { phonenumber, password } = req.body;

    if (!phonenumber || !password) {
      return res.status(400).json({ message: 'Phone number and password are required' });
    }

    const user = await User.findOne({ phonenumber });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordValid = bcryptjs.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const { password: _, ...safeUser } = user._doc;
    return res.status(200).json({
      message: 'Signin successful',
      user: safeUser,
    });
  } catch (error) {
    console.error('Signin error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
