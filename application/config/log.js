({
  fs: {
    keepDays: 100,
    writeInterval: 3000,
    writeBuffer: 64 * 1024,
    types: ['log', 'info', 'warn', 'debug', 'error'],
  },
  stdout: {
    types: ['log', 'info', 'warn', 'debug', 'error'],
  },
});
