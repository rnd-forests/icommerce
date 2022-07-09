const config = require('@lib/webpack/webpack.server.js')({
  hmr: true,
  typecheck: true,
  entry: './src/index.ts',
});

module.exports = config;
