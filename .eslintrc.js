/** @type {import('eslint').Linter.Config} */
module.exports = {
  env: {
    browser: true,
    node: true,
    es2021: true
  },
  globals: {
    uni: true // readonly
  },
  extends: [
    'standard',
    'plugin:prettier/recommended',
    'eslint:recommended',
    'plugin:vue/essential',
    'plugin:@typescript-eslint/recommended',
    './.eslintrc-auto-import.json'
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    ecmaVersion: 'latest',
    parser: '@typescript-eslint/parser',
    sourceType: 'module'
  },
  plugins: ['vue', '@typescript-eslint'],
  rules: {
    'vue/multi-word-component-names': 1
  },
  overrides: [
    {
      files: ['*.ts', '*.mts', '*.cts', '*.tsx', '*.vue'],
      rules: {
        'no-undef': 'off'
      }
    }
  ]
}
