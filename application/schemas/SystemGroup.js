({
  name: { type: 'string', unique: true },
  users: { many: 'SystemUser' },
});
