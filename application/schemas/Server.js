({
  Registry: { scope: 'global' },

  name: { type: 'string', unique: true },
  suffix: { type: 'string', unique: true },
  ip: { type: 'ip', unique: true },
  kind: { enum: ['root', 'server', 'backup', 'reserve'], default: 'server' },
  ports: 'json',
});
