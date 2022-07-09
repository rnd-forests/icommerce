module.exports = {
  babelrcRoots: ['.', './lib/*', './packages/*'],
  presets: [
    [
      '@babel/preset-env',
      {
        useBuiltIns: 'usage',
        corejs: 3,
        debug: false,
      },
    ],
    '@babel/preset-typescript',
  ],
  plugins: [
    [
      '@babel/plugin-transform-typescript',
      {
        allowDeclareFields: true,
      },
    ],
    ['@babel/plugin-proposal-class-properties'],
    ['@babel/plugin-transform-runtime'],
    ['@babel/plugin-transform-classes'],
  ],
  assumptions: {
    setPublicClassFields: false,
  },
};
