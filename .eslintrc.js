module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'next/core-web-vitals'
  ],
  rules: {
    'prefer-const': 'error',
    'no-var': 'error',
    'no-unused-vars': 'warn',
    'react/no-unescaped-entities': 'off',
    'no-undef': 'off'
  },
  env: {
    node: true,
    es2020: true,
    browser: true
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  }
}