const express = require('express');
const cors = require('cors');
const urlRoutes = require('./routes/urlRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', urlRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'URL Shortener API is running!',
    endpoints: {
      shorten: 'POST /api/shorten',
      redirect: 'GET /api/:shortCode',
      analytics: 'GET /api/analytics/:shortCode'
    }
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 URL Shortener API running on port ${PORT}`);
});

module.exports = app;