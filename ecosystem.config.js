const JWT_SECRET = process.env.JWT_SECRET || 'change-me-to-a-random-secret';
const SEED_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'admin123';
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://mydash:mydash_prod_2024@localhost:5432/mydash';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

module.exports = {
  apps: [
    {
      name: 'mydash-backend',
      cwd: './packages/backend',
      script: 'npx',
      args: 'tsx src/main.ts',
      interpreter: 'none',
      env: {
        NODE_ENV: process.env.NODE_ENV || 'production',
        BACKEND_PORT: process.env.BACKEND_PORT || '3000',
        HOST: '0.0.0.0',
        DATABASE_URL,
        REDIS_URL,
        JWT_SECRET,
        SEED_ADMIN_PASSWORD: SEED_PASSWORD,
        LOG_LEVEL: process.env.LOG_LEVEL || 'info',
        CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
      },
      max_memory_restart: '500M',
      restart_delay: 3000,
      max_restarts: 10,
      exp_backoff_restart_delay: 5000,
      watch: false,
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      pid_file: './pids/backend.pid',
      time: true,
    },
    {
      name: 'mydash-ngrok',
      script: 'ngrok',
      args: 'http 3000 --log=stdout',
      interpreter: 'none',
      restart_delay: 5000,
      max_restarts: 10,
      exp_backoff_restart_delay: 10000,
      watch: false,
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: './logs/ngrok-error.log',
      out_file: './logs/ngrok-out.log',
      pid_file: './pids/ngrok.pid',
      time: true,
    },
  ],
};
