// controllers/userController.js
const User = require('../models/User'); 
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { sendVerificationEmail } = require('./emailController');
const JWT_SECRET = process.env.JWT_SECRET;

exports.register = async (req, res) => {
  try {
    const { username, phone, email, password, role } = req.body;
    const lowerEmail = email.toLowerCase();

    // Check if user exists by email
    const existingUser = await User.findOne({ email: lowerEmail });

    // Also check if username exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername && (!existingUser || existingUsername.email !== email)) {
      return res.status(400).json({ error: 'Username already taken. Please choose another.' });
    }

    // If user exists and is verified
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ error: 'Email already registered. Please login.' });
    }

    // Verification token generation logic
    const verificationToken = jwt.sign(
      { email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    if (existingUser && !existingUser.isVerified) {
      // Update existing unverified user
      const hashedPassword = await bcrypt.hash(password, 10);
      existingUser.username = username;
      existingUser.phone = phone;
      existingUser.password = hashedPassword;
      existingUser.role = role ?? 'customer';
      existingUser.verificationToken = verificationToken;
      existingUser.verificationSentAt = new Date();
      await existingUser.save();

      // Send email asynchronously so it doesn't block the response
      sendVerificationEmail(email, verificationToken).catch(mailError => {
        console.error('Background Mail Error:', mailError);
      });
      
      return res.status(200).json({ 
        message: 'Verification email resent. Please check your inbox to complete registration.',
        isResent: true
      });
    }

    // New user registration
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ 
      username,
      phone,
      email, 
      password: hashedPassword, 
      role: role ?? 'customer',
      verificationToken,
      verificationSentAt: new Date()
    });

    // Send email asynchronously
    sendVerificationEmail(email, verificationToken).catch(mailError => {
      console.error('Background Mail Error:', mailError);
    });

    res.status(201).json({ 
      message: 'Registration successful! Please check your email for verification.',
      isNewUser: true
    });

  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ error: `${field.charAt(0).toUpperCase() + field.slice(1)} is already in use.` });
    }
    res.status(500).json({ error: error.message });
  }
};


exports.login = async (req, res) => {
  const { email, password } = req.body;
  const lowerEmail = email.toLowerCase();

  try {
    const user = await User.findOne({ email: lowerEmail });
    
    if (!user) {
      return res.status(401).json({ message: 'No account found with this email' });
    }

    // Strict check - only allow verified users to login
    if (!user.isVerified) {
      return res.status(403).json({ 
        message: 'Account not verified. Please check your email for verification link.',
        isVerified: false,
        email: user.email
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

    res.json({
      token,
      role: user.role,
      username: user.username
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error during login' });
  }
};