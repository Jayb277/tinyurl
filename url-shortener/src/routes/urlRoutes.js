const express = require('express');
const router = express.Router();
const urlController = require('../controllers/urlController');

// @route   POST /api/shorten
// @desc    Create a short URL
// @body    { originalUrl: string, customCode?: string }
router.post('/shorten', urlController.shortenUrl);

// @route   GET /api/:shortCode
// @desc    Redirect to original URL
// @params  shortCode
router.get('/:shortCode', urlController.redirectToUrl);

// @route   GET /api/analytics/:shortCode
// @desc    Get analytics for a short URL
// @params  shortCode
router.get('/analytics/:shortCode', urlController.getAnalytics);

// @route   GET /api/urls/all
// @desc    Get all URLs (for testing)
router.get('/urls/all', urlController.getAllUrls);

module.exports = router;