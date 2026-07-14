const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./db');
const authRoutes = require('./routes/auth');
const linkRoutes = require('./routes/links');
const previewRoutes = require('./routes/preview');

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://linkhub-pi-ten.vercel.app",
  ],
  credentials: true,
}));


app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Backend server is running!' });
});

app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ success: true, time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/links', linkRoutes);
app.use('/api/preview', previewRoutes);

// REDIRECT ROUTE — must be after other routes
// REDIRECT ROUTE — must be after other routes
app.get('/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;
    const result = await pool.query('SELECT * FROM links WHERE short_code = $1', [shortCode]);

    if (result.rows.length === 0) {
      return res.status(404).send(renderMessagePage('Link Not Found', 'This short link doesn\'t exist.'));
    }

    const link = result.rows[0];

    // Check expiry
    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      return res.status(410).send(renderMessagePage('Link Expired', 'This short link is no longer active.'));
    }

    // Check password protection
    if (link.password) {
      return res.send(renderPasswordPage(shortCode));
    }

    // No password — redirect normally
    pool.query('UPDATE links SET click_count = click_count + 1 WHERE short_code = $1', [shortCode]);
    res.redirect(link.long_url);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Simple styled HTML page for password-protected links
function renderPasswordPage(shortCode) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Password Protected Link</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #eff6ff; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
      .card { background: white; padding: 40px 32px; border-radius: 16px; box-shadow: 0 10px 40px rgba(37,99,235,0.1); max-width: 360px; width: 100%; text-align: center; }
      .icon { width: 48px; height: 48px; background: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-size: 22px; }
      h2 { color: #111827; margin: 0 0 8px; font-size: 20px; }
      p { color: #6b7280; font-size: 14px; margin: 0 0 20px; }
      input { width: 100%; padding: 12px 14px; border: 1px solid #e5e7eb; border-radius: 10px; font-size: 14px; box-sizing: border-box; margin-bottom: 12px; }
      input:focus { outline: none; border-color: #2563eb; }
      button { width: 100%; padding: 12px; background: #2563eb; color: white; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; }
      button:hover { background: #1d4ed8; }
      .error { color: #dc2626; font-size: 13px; margin-top: 10px; display: none; }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="icon">🔒</div>
      <h2>Password Protected</h2>
      <p>This link requires a password to continue.</p>
      <input type="password" id="pw" placeholder="Enter password" />
      <button onclick="submitPassword()">Unlock Link</button>
      <p class="error" id="err">Incorrect password. Try again.</p>
    </div>
    <script>
      async function submitPassword() {
        const password = document.getElementById('pw').value;
        const errEl = document.getElementById('err');
        errEl.style.display = 'none';
        try {
          const res = await fetch('/api/links/${shortCode}/verify-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
          });
          const data = await res.json();
          if (data.success) {
            window.location.href = data.longUrl;
          } else {
            errEl.style.display = 'block';
          }
        } catch (e) {
          errEl.style.display = 'block';
        }
      }
      document.getElementById('pw').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') submitPassword();
      });
    </script>
  </body>
  </html>`;
}

// Simple styled message page (for not-found / expired)
function renderMessagePage(title, message) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <title>${title}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
      .card { background: white; padding: 40px 32px; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.06); max-width: 360px; width: 100%; text-align: center; }
      .icon { width: 48px; height: 48px; background: #fee2e2; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-size: 22px; }
      h2 { color: #111827; margin: 0 0 8px; font-size: 20px; }
      p { color: #6b7280; font-size: 14px; margin: 0; }
      a { display: inline-block; margin-top: 20px; color: #2563eb; text-decoration: none; font-weight: 600; font-size: 14px; }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="icon">⚠️</div>
      <h2>${title}</h2>
      <p>${message}</p>
      <a href="http://localhost:5173">← Go back home</a>
    </div>
  </body>
  </html>`;
}
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});