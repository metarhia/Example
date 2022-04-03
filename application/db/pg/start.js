async () => {
  if (application.worker.id === 'W1') {
    console.debug('Connect to pg');
  }
  const options = { ...config.database, console };
  db.pg = new metarhia.metasql.Database(options);

  // Check that we connected successfully.
  await db.pg.query('SELECT now()').catch((err) => {
    if (application.worker.id === 'W1') {
      console.error(`Failed to setup DB: ${err.message}`);
    }
    process.exit(0);
  });
};
