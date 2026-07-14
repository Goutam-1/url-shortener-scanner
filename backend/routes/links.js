const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');
const verifyToken = require('../middleware/auth');

const router = express.Router();

function generateShortCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const jwt = require('jsonwebtoken');
    try {
      const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
      req.user = decoded;
    } catch (err) {
      // invalid token, proceed as anonymous
    }
  }
  next();
}

// CREATE SHORT LINK
router.post('/create', optionalAuth, async (req, res) => {
  try {
    const { longUrl, customAlias, password, expiresAt } = req.body;

    if (!longUrl) {
      return res.status(400).json({ success: false, message: 'URL is required' });
    }

    try {
      new URL(longUrl);
    } catch (err) {
      return res.status(400).json({ success: false, message: 'Please enter a valid URL' });
    }

    const userId = req.user ? req.user.userId : null;
    let shortCode;
    let isCustom = false;

    if (customAlias) {
      const existing = await pool.query('SELECT id FROM links WHERE short_code = $1', [customAlias]);
      if (existing.rows.length > 0) {
        return res.status(400).json({ success: false, message: 'This alias is already taken' });
      }
      shortCode = customAlias;
      isCustom = true;
    } else {
      let attempts = 0;
      while (attempts < 5) {
        const candidate = generateShortCode();
        const existing = await pool.query('SELECT id FROM links WHERE short_code = $1', [candidate]);
        if (existing.rows.length === 0) {
          shortCode = candidate;
          break;
        }
        attempts++;
      }
      if (!shortCode) {
        return res.status(500).json({ success: false, message: 'Could not generate unique code, try again' });
      }
    }

    // Hash password if provided
    let hashedPassword = null;
    if (password && password.trim() !== '') {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Validate expiry if provided
    let expiryDate = null;
    if (expiresAt) {
      expiryDate = new Date(expiresAt);
      if (expiryDate <= new Date()) {
        return res.status(400).json({ success: false, message: 'Expiry date must be in the future' });
      }
    }

    const result = await pool.query(
      `INSERT INTO links (short_code, long_url, is_custom, user_id, password, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, short_code, long_url, is_custom, user_id, click_count, created_at, expires_at,
       (password IS NOT NULL) as has_password`,
      [shortCode, longUrl, isCustom, userId, hashedPassword, expiryDate]
    );

    res.status(201).json({ success: true, link: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ success: false, message: 'This alias is already taken' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// VERIFY PASSWORD (used by redirect page)
router.post('/:code/verify-password', async (req, res) => {
  try {
    const { code } = req.params;
    const { password } = req.body;

    const result = await pool.query('SELECT * FROM links WHERE short_code = $1', [code]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Link not found' });
    }

    const link = result.rows[0];

    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      return res.status(410).json({ success: false, message: 'This link has expired' });
    }

    if (!link.password) {
      return res.json({ success: true, longUrl: link.long_url });
    }

    const isMatch = await bcrypt.compare(password, link.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password' });
    }

    pool.query('UPDATE links SET click_count = click_count + 1 WHERE short_code = $1', [code]);
    res.json({ success: true, longUrl: link.long_url });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET MY LINKS (requires login)
router.get('/my-links', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, short_code, long_url, is_custom, click_count, created_at, expires_at,
       (password IS NOT NULL) as has_password
       FROM links WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.user.userId]
    );
    res.json({ success: true, links: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});



// DELETE A LINK (only owner can delete)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM links WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Link not found or not yours' });
    }

    res.json({ success: true, message: 'Link deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});




















module.exports = router;