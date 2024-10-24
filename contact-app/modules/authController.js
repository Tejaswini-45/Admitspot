const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');
const nodemailer = require('nodemailer');
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');

// Registration
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Store user and send verification email
    await pool.query('INSERT INTO users (id, name, email, password, is_verified) VALUES ($1, $2, $3, $4, $5)', 
      [uuidv4(), name, email, hashedPassword, false]);

    // Send email verification using nodemailer (simulated here)
    res.status(201).json({ message: 'User registered, verification email sent.', token });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0 || !await bcrypt.compare(password, user.rows[0].password)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'Login successful', token });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Password reset (via one-time code)
exports.resetPassword = async (req, res) => {
  // Generate and send OTP for password reset, then reset password.
};
