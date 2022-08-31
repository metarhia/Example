({
  fs: {
    keepDays: 10,
    writeInterval: 1000,
    writeBuffer: 64 * 1024,
    types: ['log', 'info', 'warn', 'debug', 'error'],
  },
  stdout: {
    types: ['log', 'info', 'warn', 'debug', 'error'],
  },
});
