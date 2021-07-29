({
  plugin: 'metasql/crud',
  database: db.pg,
  entities: {
    City: ['create', 'get', 'select', 'update', 'delete'],
    Country: ['get'],
    Account: ['select', 'update'],
  },
});
