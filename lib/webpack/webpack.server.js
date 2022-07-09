const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const { createNodeExternals, createExecuteAfterCompileHook } = require('./util');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const isDev = process.env.NODE_ENV !== 'production';
const isProd = !isDev;

module.exports = opts => {
  opts = opts || {};
  opts.entry = opts.entry || './src/index.ts';
  opts.hmr = typeof opts.hmr === 'boolean' ? opts.hmr : true;
  opts.typecheck = typeof opts.typecheck === 'boolean' ? opts.typecheck : false;

  const analyzeBundle = opts.analyzeBundle || false;
  const openAnalyzer = opts.openAnalyzer || false;

  const plugins = [];

  if (opts.typecheck) {
    plugins.push(new ForkTsCheckerWebpackPlugin());
  }

  if (isDev && opts.hmr) {
    plugins.push(new webpack.HotModuleReplacementPlugin());
    plugins.push(createExecuteAfterCompileHook());
  }

  if (isDev && analyzeBundle) {
    plugins.push(new BundleAnalyzerPlugin({ openAnalyzer }));
  }

  let minimizer = [];
  if (isProd) {
    plugins.push(new webpack.optimize.ModuleConcatenationPlugin());

    minimizer = [
      new TerserPlugin({
        parallel: true,
        extractComments: true,
        terserOptions: {
          safari10: true,
          sourceMap: true,
        },
      }),
    ];
  }

  return {
    target: 'node',
    externals: createNodeExternals(),
    entry: opts.entry,
    node: false,
    mode: isDev ? 'development' : 'production',
    output: {
      publicPath: '/',
      path: path.resolve('./dist'),
      filename: '[name]-server.js',
    },
    resolve: {
      extensions: ['.ts', '.js', '.json'],
    },
    devtool: isDev ? 'eval-source-map' : 'source-map',
    optimization: {
      minimizer,
      sideEffects: true,
      usedExports: true,
      moduleIds: 'named',
      runtimeChunk: false,
      chunkIds: 'deterministic',
    },
    plugins,
    module: {
      rules: [
        {
          test: /\.+(ts)$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                rootMode: 'upward',
                presets: [
                  [
                    '@babel/preset-env',
                    {
                      targets: 'node 16',
                      useBuiltIns: 'usage',
                      corejs: 3,
                      debug: false,
                    },
                  ],
                ],
              },
            },
          ],
        },
      ],
    },
  };
};
