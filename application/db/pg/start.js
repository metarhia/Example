async () => {
  const isPrimary = application.worker.id === 'W1';
  if (isPrimary) console.debug('Connect to pg');
  const options = { ...config.database, console };
  db.pg = new metarhia.metasql.Database(options);
};
