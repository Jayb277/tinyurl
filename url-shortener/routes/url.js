const express = require('express');
const router = express.Router();
const Url = require('../models/Url');

// Create short URL
router.post('/shorten', async (req, res) => {
  try {
    const { fullUrl } = req.body;
    
    if (!fullUrl) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Check if URL already exists
    let url = await Url.findOne({ fullUrl });
    
    if (url) {
      return res.json(url);
    }

    // Create new URL
    url = new Url({
      fullUrl: fullUrl
    });

    await url.save();
    res.json(url);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Redirect to original URL
router.get('/:shortUrl', async (req, res) => {
  try {
    const { shortUrl } = req.params;
    const url = await Url.findOne({ shortUrl });

    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }

    // Update click count
    url.clicks++;
    await url.save();

    res.redirect(url.fullUrl);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get URL stats
router.get('/stats/:shortUrl', async (req, res) => {
  try {
    const { shortUrl } = req.params;
    const url = await Url.findOne({ shortUrl });

    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }

    res.json(url);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;