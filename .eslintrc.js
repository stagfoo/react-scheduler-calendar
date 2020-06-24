module.exports = {
  env: {
    browser: true,
    es6: true,
    jest: true,
  },
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'standard',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: [
    'react',
    '@typescript-eslint',
  ],
  rules: {
    semi: ['error', 'always'],
    'comma-dangle': ['error', 'always-multiline'],
    'space-before-function-paren': ['error', 'never'],
    'react/prop-types': ['off'],
    'react/display-name': ['off'],
    '@typescript-eslint/explicit-module-boundary-types': ['off'],
    '@typescript-eslint/no-non-null-assertion': ['off'],
    '@typescript-eslint/ban-ts-comment': ['off'],
    '@typescript-eslint/ban-types': ['error', {
      types: {
        '{}': {
          message: 'Avoid using the `{}` type. Did you mean `Record<string, unknown>`?',
          fixWith: 'Record<string, unknown>'
        },
        Object: {
          message: 'Avoid using the `Object` type. Did you mean `Record<string, unknown>`?',
          fixWith: 'Record<string, unknown>',
        },
        object: {
          message: 'Avoid using the `Object` type. Did you mean `Record<string, unknown>`?',
          fixWith: 'Record<string, unknown>',
        },
        Function: {
          message: 'Avoid using the `Function` type. Prefer a specific function type, like `() => void`',
          fixWith: '() => void',
        },
        Boolean: {
          message: 'Avoid using the `Boolean` type. Did you mean `boolean`?',
          fixWith: 'boolean',
        },
        Number: {
          message: 'Avoid using the `Number` type. Did you mean `number`?',
          fixWith: 'number',
        },
        String: {
          message: 'Avoid using the `String` type. Did you mean `string`?',
          fixWith: 'string'
        },
        Symbol: {
          message: 'Avoid using the `Symbol` type. Did you mean `symbol`?',
          fixWith: 'symbol',
        },
      },
    }],
  },
}
