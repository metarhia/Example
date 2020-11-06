(async () => {
  console.debug('Connect to pg');
  const options = { ...config.database, logger: console };
  domain.db = new npm.metasql.Database(options);
});
