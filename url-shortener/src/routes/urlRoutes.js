const express = require('express');
const { shortenUrl, redirectUrl } = require('../controllers/urlController');

const router = express.Router();

// POST /api/url/shorten - Create short URL
router.post('/shorten', shortenUrl);

// GET /:shortCode - Redirect to original URL
router.get('/:shortCode', redirectUrl);

module.exports = router;