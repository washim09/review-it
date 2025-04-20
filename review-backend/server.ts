import { createServer } from 'http';
import next from 'next';
import * as path from 'path';

// Configure server options
const port = parseInt(process.env.PORT || '3000', 10);
const dev = process.env.NODE_ENV !== 'production';

// Configure Next.js app
const nextApp = next({ dev });

async function startServer() {
  try {
    console.log(`Starting Next.js server in ${dev ? 'development' : 'production'} mode`);
    
    // Prepare the Next.js app
    await nextApp.prepare();
    
    // Create a simple HTTP server that forwards requests to Next.js
    const handle = nextApp.getRequestHandler();
    const server = createServer((req, res) => {
      handle(req, res);
    });

    // Start the server
    server.listen(port, () => {
      console.log(`> Ready on http://localhost:${port}`);
    });
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
}

startServer();