({
  plugin: 'metasql/crud',
  database: domain.db,
  entities: {
    City: ['create', 'get', 'select', 'update', 'delete'],
    Country: ['get'],
    Account: ['select', 'update'],
  },
});
