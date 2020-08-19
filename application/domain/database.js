({
  async start() {
    this.example = new lib.pg.Database(domain.database.config);
  }
});
