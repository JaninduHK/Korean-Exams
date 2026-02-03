module.exports = {
  apps: [
    {
      name: 'koreanexams-api',
      cwd: './server',
      script: 'server.js',
      instances: 2,
      exec_mode: 'cluster',
      env_file: './server/.env', // Load environment variables from .env file
      env: {
        NODE_ENV: 'production',
        PORT: 5001,
        CLIENT_URL: 'https://koreanexams.com'
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    }
  ]
};
