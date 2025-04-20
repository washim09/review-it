// Simple script to start Next.js without tracing on Windows
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Define paths
const nextDir = path.join(__dirname, '.next');
const tracePath = path.join(nextDir, 'trace');

// Clean up any existing trace file or directory
try {
  if (fs.existsSync(tracePath)) {
    console.log('Removing existing trace file/directory...');
    if (fs.lstatSync(tracePath).isDirectory()) {
      fs.rmdirSync(tracePath, { recursive: true });
    } else {
      fs.unlinkSync(tracePath);
    }
    console.log('Trace file/directory removed successfully.');
  }
} catch (err) {
  console.warn('Warning: Could not clean up trace path:', err.message);
}

// Environment variables to disable tracing and telemetry
process.env.NEXT_TELEMETRY_DISABLED = '1';
process.env.NODE_OPTIONS = '--no-warnings';

// Start Next.js with environment variables that disable tracing
console.log('Starting Next.js development server...');
try {
  // Use execSync to run the command
  execSync('npx next dev', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      NEXT_TELEMETRY_DISABLED: '1',
      NEXT_RUNTIME: 'nodejs'
    }
  });
} catch (err) {
  console.error('Error starting Next.js:', err.message);
}
