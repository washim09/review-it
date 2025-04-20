// Custom server implementation to bypass Next.js tracing
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { env } = require('process');

// Force NODE_ENV to be development
process.env.NODE_ENV = 'development';
// Disable Next.js telemetry
process.env.NEXT_TELEMETRY_DISABLED = '1';

const port = parseInt(process.env.PORT || '3000', 10);
const hostname = 'localhost';
const dev = true;  // Always run in dev mode for this script

// Create the Next.js app instance
const app = next({ 
  dev,
  hostname, 
  port,
  conf: {
    // Override any tracing config at runtime
    experimental: {
      instrumentationHook: false
    },
    typescript: {
      ignoreBuildErrors: true
    }
  }
});

const handle = app.getRequestHandler();

app.prepare()
  .then(() => {
    console.log(`> Server preparing...`);
    
    createServer(async (req, res) => {
      try {
        // Parse the URL
        const parsedUrl = parse(req.url, true);
        
        // Let Next.js handle the request
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error('Error occurred handling', req.url, err);
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    })
    .listen(port, (err) => {
      if (err) throw err;
      console.log(`> Ready on http://${hostname}:${port}`);
    });
  })
  .catch((err) => {
    console.error('Error starting server:', err);
    process.exit(1);
  });
