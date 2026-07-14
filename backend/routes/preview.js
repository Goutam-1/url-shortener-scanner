const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ success: false, message: 'URL is required' });
    }

    try {
      new URL(url);
    } catch (err) {
      return res.status(400).json({ success: false, message: 'Invalid URL' });
    }

    const microlinkUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=true`;
    const response = await fetch(microlinkUrl);
    const result = await response.json();

    if (result.status !== 'success') {
      return res.status(400).json({ success: false, message: 'Could not generate a preview for this URL' });
    }

    const { title, description, image, logo, publisher, screenshot, url: finalUrl } = result.data;

    res.json({
      success: true,
      preview: {
        title: title || 'Untitled Page',
        description: description || null,
        image: image?.url || null,
        logo: logo?.url || null,
        screenshot: screenshot?.url || null,
        publisher: publisher || null,
        domain: new URL(finalUrl || url).hostname,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to generate preview. Try again.' });
  }
});

module.exports = router;