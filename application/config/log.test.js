({
  keepDays: 100, // Delete files after N days
  writeInterval: 3000, // Flush log to disk interval
  writeBuffer: 64 * 1024, // Buffer size 64kb
  toFile: ['error', 'warn', 'info', 'debug', 'log'],
  toStdout: ['error', 'warn', 'info', 'debug', 'log']
});
