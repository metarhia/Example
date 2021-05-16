({
  Registry: {},

  name: { type: 'string', unique: true },
  parent: { type: 'Catalog', required: false },
  application: 'Application',
  entities: { many: 'Identifier' },
});
