// In-memory storage (replace with database in production)
const urlDatabase = new Map();
const analyticsDB = new Map();

// Generate a random short code
function generateShortCode() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const codeLength = 6;
  let result = '';
  
  for (let i = 0; i < codeLength; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  // Check if code already exists, generate new one if it does
  if (urlDatabase.has(result)) {
    return generateShortCode();
  }
  
  return result;
}

// Validate URL format
function isValidUrl(url) {
  try {
    const newUrl = new URL(url);
    return newUrl.protocol === 'http:' || newUrl.protocol === 'https:';
  } catch (err) {
    return false;
  }
}

// Controller functions
const urlController = {
  // Shorten a URL
  shortenUrl: (req, res) => {
    try {
      const { originalUrl, customCode } = req.body;
      
      // Validate input
      if (!originalUrl) {
        return res.status(400).json({
          error: 'originalUrl is required'
        });
      }
      
      // Validate URL format
      if (!isValidUrl(originalUrl)) {
        return res.status(400).json({
          error: 'Invalid URL format. Please include http:// or https://'
        });
      }
      
      let shortCode;
      
      // Check for custom code
      if (customCode) {
        if (urlDatabase.has(customCode)) {
          return res.status(400).json({
            error: 'Custom code already exists. Please choose a different one.'
          });
        }
        shortCode = customCode;
      } else {
        shortCode = generateShortCode();
      }
      
      // Store in database
      const urlData = {
        originalUrl,
        shortCode,
        createdAt: new Date().toISOString(),
        clickCount: 0
      };
      
      urlDatabase.set(shortCode, urlData);
      analyticsDB.set(shortCode, {
        clickCount: 0,
        createdAt: new Date().toISOString(),
        lastAccessed: null,
        accessHistory: []
      });
      
      // Return success response
      res.status(201).json({
        success: true,
        shortCode,
        shortUrl: `${req.protocol}://${req.get('host')}/api/${shortCode}`,
        originalUrl,
        createdAt: urlData.createdAt
      });
      
    } catch (error) {
      console.error('Error shortening URL:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  },
  
  // Redirect to original URL
  redirectToUrl: (req, res) => {
    try {
      const { shortCode } = req.params;
      
      // Find URL in database
      const urlData = urlDatabase.get(shortCode);
      
      if (!urlData) {
        return res.status(404).json({
          error: 'Short URL not found'
        });
      }
      
      // Update analytics
      const analytics = analyticsDB.get(shortCode);
      if (analytics) {
        analytics.clickCount += 1;
        analytics.lastAccessed = new Date().toISOString();
        analytics.accessHistory.push({
          timestamp: new Date().toISOString(),
          userAgent: req.get('User-Agent') || 'Unknown',
          ip: req.ip || 'Unknown'
        });
        
        // Keep only last 100 accesses
        if (analytics.accessHistory.length > 100) {
          analytics.accessHistory = analytics.accessHistory.slice(-100);
        }
      }
      
      // Update click count in main database
      urlData.clickCount += 1;
      
      // Redirect to original URL
      res.redirect(302, urlData.originalUrl);
      
    } catch (error) {
      console.error('Error redirecting:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  },
  
  // Get analytics for a short URL
  getAnalytics: (req, res) => {
    try {
      const { shortCode } = req.params;
      
      // Find URL data
      const urlData = urlDatabase.get(shortCode);
      const analytics = analyticsDB.get(shortCode);
      
      if (!urlData || !analytics) {
        return res.status(404).json({
          error: 'Short URL not found'
        });
      }
      
      res.json({
        shortCode,
        originalUrl: urlData.originalUrl,
        createdAt: urlData.createdAt,
        clickCount: analytics.clickCount,
        lastAccessed: analytics.lastAccessed,
        recentAccesses: analytics.accessHistory.slice(-10) // Last 10 accesses
      });
      
    } catch (error) {
      console.error('Error getting analytics:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  },
  
  // Get all URLs (for testing/admin purposes)
  getAllUrls: (req, res) => {
    try {
      const allUrls = Array.from(urlDatabase.entries()).map(([shortCode, data]) => ({
        shortCode,
        ...data
      }));
      
      res.json({
        total: allUrls.length,
        urls: allUrls
      });
      
    } catch (error) {
      console.error('Error getting all URLs:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }
};

module.exports = urlController;