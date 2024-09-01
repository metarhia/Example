'use strict';

const init = require('eslint-config-metarhia');

module.exports = [
  ...init,
  {
    files: ['application/**/*.js'],
    rules: {
      strict: 'off',
    },
    languageOptions: {
      sourceType: 'module',
      globals: {
        api: true,
        application: true,
        config: true,
        context: true,
        node: true,
        npm: true,
        lib: true,
        db: true,
        bus: true,
        domain: true,
        metarhia: true,
        DomainError: true,
        document: true,
        location: true,
        self: true,
        caches: true,
        navigator: true,
        File: true,
        localStorage: true,
      },
    },
  },
];
