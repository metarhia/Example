({
  Entity: {},

  name: { type: 'string', unique: true },
  blocked: { type: 'boolean', default: false },
});
