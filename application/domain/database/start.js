async () => {
  if (application.worker.id === 'W1') {
    console.debug('Connect to pg');
  }
  const options = { ...config.database, logger: console };
  const database = new metarhia.metasql.Database(options);
  domain.db = database;
  application.auth.init(database);
};
