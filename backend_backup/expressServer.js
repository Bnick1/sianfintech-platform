// ==========================
// expressServer.js
// SianFinTech Backend - Express Setup
// ==========================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const swaggerUi = require('swagger-ui-express');

const app = express();

// --------------------------
// Middleware
// --------------------------
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --------------------------
// Load OpenAPI Spec (optional)
// --------------------------
const openapiPath = path.join(__dirname, 'openapi.yaml');
if (fs.existsSync(openapiPath)) {
  try {
    const openapiSpec = yaml.load(fs.readFileSync(openapiPath, 'utf8'));
    console.log('✅ OpenAPI spec loaded successfully.');
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));
  } catch (err) {
    console.error('❌ Failed to load OpenAPI spec:', err.message);
  }
}

// --------------------------
// Base Route
// --------------------------
app.get('/hello', (req, res) => res.send('👋 Hello from SianFinTech API!'));

// --------------------------
// Health Check Route
// --------------------------
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'SianFinTech API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// --------------------------
// Controllers (User + AI)
// --------------------------
try {
  const userController = require('./controllers/usersController');
  app.post('/users/register', userController.registerUser);
  app.get('/users/:userId', userController.getUser);
  app.delete('/users/:userId', userController.deleteUser);
} catch (err) {
  console.warn('⚠️ User controller not loaded:', err.message);
}

try {
  const aiController = require('./controllers/aiController');
  app.post('/ai/predict', aiController.aiPredictDefaultPOST);
} catch (err) {
  console.warn('⚠️ AI controller not loaded:', err.message);
}

// --------------------------
// Modular Routes
// --------------------------
const routeFiles = [
  { path: '/investments', file: './routes/investmentRoutes' },
  { path: '/loans', file: './routes/loanRoutes' },
  { path: '/payments', file: './routes/paymentRoutes' },
  { path: '/kiosks', file: './routes/kioskRoutes' },
];

for (const { path: routePath, file } of routeFiles) {
  try {
    const router = require(file);
    app.use(routePath, router);
  } catch (err) {
    console.warn(`⚠️ Route not loaded for ${routePath}:`, err.message);
  }
}

// --------------------------
// 404 Handler
// --------------------------
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Endpoint not found. Please check your route or API documentation.',
  });
});

// --------------------------
// Global Error Handler
// --------------------------
app.use((err, req, res, next) => {
  console.error('💥 Internal Server Error:', err.message);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;