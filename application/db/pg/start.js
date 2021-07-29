async () => {
  if (application.worker.id === 'W1') {
    console.debug('Connect to pg');
  }
  const options = { ...config.database, logger: console };
  db.pg = new metarhia.metasql.Database(options);
};
