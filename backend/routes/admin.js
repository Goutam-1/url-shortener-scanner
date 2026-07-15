const express = require('express');
const pool = require('../db');
const verifyToken = require('../middleware/auth');
const requireAdmin = require('../middleware/admin');

const router = express.Router();

// GET ALL LINKS (with filters)
router.get('/links', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { date, status } = req.query;

    let query = `
      SELECT l.id, l.short_code, l.long_url, l.click_count, l.created_at, l.expires_at, l.is_custom,
             (l.password IS NOT NULL) as has_password,
             u.name as owner_name, u.email as owner_email
      FROM links l
      LEFT JOIN users u ON l.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (date && date !== 'all') {
      params.push(date);
      query += ` AND l.created_at::date = $${params.length}`;
    }

    if (status === 'expired') {
      query += ` AND l.expires_at IS NOT NULL AND l.expires_at < NOW()`;
    } else if (status === 'active') {
      query += ` AND (l.expires_at IS NULL OR l.expires_at >= NOW())`;
    }

    query += ` ORDER BY l.created_at DESC`;

    const result = await pool.query(query, params);
    res.json({ success: true, links: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE ONE LINK (any link, admin override)
router.delete('/links/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM links WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Link not found' });
    }
    res.json({ success: true, message: 'Link deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// BULK DELETE (selected IDs)
router.post('/links/bulk-delete', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'No links selected' });
    }
    const result = await pool.query('DELETE FROM links WHERE id = ANY($1::int[]) RETURNING id', [ids]);
    res.json({ success: true, deletedCount: result.rows.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE ALL EXPIRED LINKS (cleanup action, ignores current filter)
router.delete('/links/cleanup/expired', verifyToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM links WHERE expires_at IS NOT NULL AND expires_at < NOW() RETURNING id'
    );
    res.json({ success: true, deletedCount: result.rows.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;