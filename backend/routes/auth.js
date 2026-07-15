const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const router = express.Router();

// SIGNUP
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    // const newUser = await pool.query(
    //   'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
    //   [name, email, hashedPassword]
    // );

const newUser = await pool.query(
  'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, role',
  [name, email, hashedPassword]
);



    const user = newUser.rows[0];

    // Create JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // res.status(201).json({
    //   success: true,
    //   token,
    //   user: { id: user.id, name: user.name, email: user.email },
    // });

    res.status(201).json({
  success: true,
  token,
  user: { id: user.id, name: user.name, email: user.email, role: user.role },
});
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    // Find user
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    const user = result.rows[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // res.json({
    //   success: true,
    //   token,
    //   user: { id: user.id, name: user.name, email: user.email },
    // });

  res.json({
  success: true,
  token,
  user: { id: user.id, name: user.name, email: user.email, role: user.role },
});
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;