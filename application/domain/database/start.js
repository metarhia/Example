(async () => {
  console.log('Connect to PG');
  domain.database.example = new lib.pg.Database(config.database);
});
