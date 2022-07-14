/* eslint-disable */
const fs = require('fs');
const path = require('path');
const debug = require('debug');
const config = require('config');
const child = require('child_process');
const nodeExternals = require('webpack-node-externals');

const createNodeExternals = () => [
  ...fs.readdirSync(path.resolve('../../lib')).map(lib =>
    nodeExternals({
      modulesDir: path.resolve(`../../lib/${lib}/node_modules`),
    }),
  ),
  nodeExternals({
    allowlist: [/^@lib.*$/],
    modulesDir: path.resolve('node_modules'),
  }),
  nodeExternals({
    allowlist: [/^@lib.*$/],
    modulesDir: path.resolve('../../node_modules'),
  }),
];

const createExecuteAfterCompileHook = () => {
  let childProcess;

  return {
    apply: compiler => {
      compiler.hooks.afterEmit.tap('AfterEmitPlugin', () => {
        if (childProcess) childProcess.kill();
        childProcess = child.spawn(`node`, ['-r', 'dotenv/config', 'dist/main-server.js'], { stdio: 'inherit' });
      });
    },
  };
};

function createLogger() {
  const service = config.get('serviceName');
  return {
    log: debug(`${service}:INFO`),
    error: debug(`${service}:ERROR`),
  };
}

module.exports = {
  createLogger,
  createNodeExternals,
  createExecuteAfterCompileHook,
};
