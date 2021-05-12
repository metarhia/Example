({
  //Registry: {},

  name: { type: 'string', unique: true },
  realm: { enum: ['global', 'application', 'local'] },
  family: { enum: ['registry', 'dictionary', 'table', 'log'] },
  storage: { enum: ['persistent', 'view', 'memory'] },
  application: 'Application',
});
