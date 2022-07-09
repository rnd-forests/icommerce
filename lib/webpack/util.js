const fs = require('fs');
const path = require('path');
const child = require('child_process');
const nodeExternals = require('webpack-node-externals');

const createNodeExternals = () => {
  const libs = fs.readdirSync(path.resolve('../../lib'));
  return [
    ...libs.map(lib =>
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
};

const createExecuteAfterCompileHook = () => {
  let childProcess;

  return {
    apply: compiler => {
      compiler.hooks.afterEmit.tap('AfterEmitPlugin', () => {
        if (childProcess) {
          childProcess.kill();
        }
        const args = ['-r', 'dotenv/config', 'dist/main-server.js'];
        const options = { stdio: 'inherit' };
        childProcess = child.spawn(`node`, args, options);
      });
    },
  };
};

module.exports = {
  createNodeExternals,
  createExecuteAfterCompileHook,
};
