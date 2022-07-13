const { createLogger } = require('@lib/webpack/util');

module.exports = require('@lib/webpack/webpack.server.js')({
  hmr: true,
  typecheck: true,
  entry: './src/index.ts',
  logger: createLogger(),
});
