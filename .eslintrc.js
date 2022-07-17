module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.eslint.json'],
  },
  overrides: [
    {
      files: ['*.ts'],
    },
  ],
  env: {
    node: true,
    browser: true,
    jest: true,
    'jest/globals': true,
  },
  extends: [
    'airbnb',
    'airbnb-typescript',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'prettier',
  ],
  globals: {
    __DEV__: false,
    __TEST__: false,
    __PROD__: false,
    __COVERAGE__: false,
  },
  plugins: ['prettier', '@typescript-eslint', 'jest'],
  rules: {
    'class-methods-use-this': 'off',
    'prettier/prettier': [
      'error',
      {
        trailingComma: 'all',
        printWidth: 120,
      },
    ],
    'no-underscore-dangle': 'off',
    'no-param-reassign': 'off',
    'no-restricted-globals': 'off',
    'import/no-cycle': 'warn',
    'no-use-before-define': [
      'warn',
      {
        functions: true,
      },
    ],
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: ['**/*.stories.js', '**/*.spec.js', '**/util/testing/**'],
      },
    ],
    'import/extensions': 'off',
    'import/prefer-default-export': 'off',
    camelcase: 'off',
    '@typescript-eslint/no-unsafe-argument': 'warn',
    '@typescript-eslint/no-unsafe-return': 'warn',
    'dot-notation': 'off',
    '@typescript-eslint/dot-notation': 'warn',
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts'],
        moduleDirectory: ['**/*/node_modules'],
      },
    },
  },
};
