({
  //Registry: {},

  login: { type: 'string', unique: true },
  passrord: 'string',
  blocked: { type: 'boolean', default: false },
  unit: 'Unit',
  roles: { many: 'Role' },
});
