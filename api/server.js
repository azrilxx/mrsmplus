// MARA+ API Server
// Development server for MRSM academic API and other endpoints

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Request logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'MARA+ API Server',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// MRSM Academic API routes
const mrsmAcademicsRouter = require('./mrsm/academics');
app.use('/api/mrsm/academics', mrsmAcademicsRouter);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: `${req.method} ${req.originalUrl} is not available`,
    available_endpoints: [
      'GET /health',
      'GET /api/mrsm/academics',
      'GET /api/mrsm/academics/:subject',
      'POST /api/mrsm/academics/sync'
    ]
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('💥 Server Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: 'Something went wrong'
  });
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log('🚀 MARA+ API Server starting...');
    console.log(`📡 Server running on http://localhost:${PORT}`);
    console.log('🔗 Available endpoints:');
    console.log(`   GET  http://localhost:${PORT}/health`);
    console.log(`   GET  http://localhost:${PORT}/api/mrsm/academics`);
    console.log(`   GET  http://localhost:${PORT}/api/mrsm/academics/:subject`);
    console.log(`   POST http://localhost:${PORT}/api/mrsm/academics/sync`);
    console.log('✨ Ready for MARA+ integration!');
  });
}

module.exports = app;