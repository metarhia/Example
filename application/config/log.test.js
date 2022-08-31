({
  fs: {
    keepDays: 1,
    writeInterval: 1000,
    writeBuffer: 64 * 1024,
    types: ['log', 'info', 'warn', 'debug', 'error'],
    format: 'json',
  },
  stdout: {
    types: ['log', 'info', 'warn', 'debug', 'error'],
  },
});
