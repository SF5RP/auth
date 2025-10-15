module.exports = {
  apps: [
    {
      name: "auth-frontend",
      script: "start-prod.js",
      cwd: "/home/deploy/auth-service/frontend",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        NEXT_PUBLIC_API_URL: "http://localhost:8080",
      },
      error_file: "/home/deploy/auth-service/logs/frontend-error.log",
      out_file: "/home/deploy/auth-service/logs/frontend-out.log",
      time: true,
    },
  ],
};
