/** PM2 config — run from repo root: pm2 start ecosystem.config.cjs */
module.exports = {
  apps: [
    {
      name: 'careernode-api',
      script: 'index.js',
      cwd: './server',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
