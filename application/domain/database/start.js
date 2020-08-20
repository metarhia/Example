(async () => {
  console.log('Connect to PG');
  domain.database.example = new lib.pg.Database(domain.database.config);
});
