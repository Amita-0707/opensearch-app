// backend/src/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const logger = require('./utils/logger');
const sequelize = require('./config/database');
const { initOpenSearch } = require('./config/opensearch');

// Import MVC Routing Pipelines
const authRoutes = require('./routes/authRoutes');
const itemRoutes = require('./routes/itemRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Global Middleware Configuration
app.use(cors());
app.use(express.json());

// Application Routing Matrix
app.use('/api/auth', authRoutes);   // Handles user signups, sign-ins, hashing tokens
app.use('/api/items', itemRoutes);  // Handles dual-write database and OpenSearch CRUD operations

// Infrastructure Liveness/Readiness Probe for AWS ALB Health Checks
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'UP', 
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development' 
  });
});

// Centralized Global Error Handler Middleware
app.use((err, req, res, next) => {
  logger.error(`Error Pipeline Caught: ${err.message} - Path: ${req.originalUrl} - Method: ${req.method}`);
  
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error'
    }
  });
});

// Structural Bootstrapping Async Wrapper
async function startServer() {
  try {
    // 1. Sync Relational Schemas via PostgreSQL
    await sequelize.sync({ alter: true });
    logger.info('PostgreSQL Relational Tables Synced Successfully.');

    // 2. Map structural Index and Settings in OpenSearch Node
    await initOpenSearch();
    logger.info('OpenSearch Cluster Connections & Mappings Initialized.');

    // 3. Bind Server Port Execution
    app.listen(PORT, () => {
      logger.info(`Server successfully launched on cluster port ${PORT}`);
    });
  } catch (error) {
    logger.error('Critical infrastructure structural boot failure:', error);
    process.exit(1); // Crash container to let AWS ECS or Docker Compose restart it
  }
}

startServer();