const express = require('express');
const urlRoutes = require('./routes/urlRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/url', urlRoutes);

// Home route
app.get('/', (req, res) => {
  res.json({
    message: 'URL Shortener API',
    endpoints: {
      shorten: 'POST /api/url/shorten',
      redirect: 'GET /:shortCode'
    }
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`URL Shortener service running on port ${PORT}`);
});

module.exports = app;