module.exports = {
  apps: [
    {
      name: "classroom-app",
      cwd: "/var/www/classroom-app",
      script: "npm",
      args: "start",
      interpreter: "none",
      env: {
        NODE_ENV: "production",
        PORT: 3000
      },
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000
    }
  ]
};