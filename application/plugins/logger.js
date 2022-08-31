[{
  on(event, callback) {
    process.stdout.write(JSON.stringify({ event }) + '\n');
  },

  open() {
    process.stdout.write('logger:open\n');
  },

  write(type, ident, line) {
    process.stdout.write(JSON.stringify({ type, ident, line }) + '\n');
  },

  close() {
    process.stdout.write('logger:close\n');
  },
}];
