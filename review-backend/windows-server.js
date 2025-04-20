// Simplified Windows-compatible server for Next.js
const express = require('express');
const next = require('next');
require('dotenv').config();

// Force development mode and disable telemetry
process.env.NODE_ENV = 'development';
process.env.NEXT_TELEMETRY_DISABLED = '1';

// Basic server configuration
const port = process.env.PORT || 3000;
const dev = true;
const nextApp = next({ 
  dev,
  conf: {
    // Configurations to avoid tracing issues
    typescript: {
      ignoreBuildErrors: true,
    }
  }
});
const nextHandler = nextApp.getRequestHandler();

// Prepare and start server
nextApp.prepare()
  .then(() => {
    const app = express();
    
    // Setup CORS headers
    app.use((req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      if (req.method === 'OPTIONS') {
        return res.status(200).end();
      }
      next();
    });

    // Let Next.js handle all requests
    app.all('*', (req, res) => {
      return nextHandler(req, res);
    });

    // Start server
    app.listen(port, (err) => {
      if (err) throw err;
      console.log(`> Ready on http://localhost:${port}`);
    });
  })
  .catch((ex) => {
    console.error(ex.stack);
    process.exit(1);
  });
