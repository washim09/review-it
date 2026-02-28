module.exports = {
  apps: [
    {
      name: 'review-backend',
      cwd: './backend',
      script: 'node_modules/.bin/next',
      args: 'start -p 3000',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
    {
      name: 'review-frontend',
      cwd: './frontend',
      script: 'node_modules/.bin/next',
      args: 'start -p 3002',
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
        NEXT_PUBLIC_API_URL: 'https://api.riviewit.com',
      },
    },
    {
      name: 'review-admin',
      cwd: './admin',
      script: 'node_modules/.bin/next',
      args: 'start -p 5174',
      env: {
        NODE_ENV: 'production',
        PORT: 5174,
        NEXT_PUBLIC_API_URL: 'https://api.riviewit.com',
      },
    },
    {
      name: 'socket-server',
      cwd: './backend',
      script: 'socket-server.js',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
