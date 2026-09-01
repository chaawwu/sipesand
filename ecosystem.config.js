module.exports = {
  apps: [
    {
      name: 'sipesand-backend',
      script: './backend/src/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      watch: false,
      max_memory_restart: '500M',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      merge_logs: true,
      autorestart: true,
      restart_delay: 3000,
    },
    {
      name: 'sipesand-frontend',
      script: 'node',
      args: 'serve-frontend.js',
      instances: 1,
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      watch: false,
      autorestart: true,
    }
  ],
};
