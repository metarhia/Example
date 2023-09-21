async () => {
  domain.resmon.subscriptions = new Set();
  domain.resmon.interval = 500;
  setInterval(async () => {
    const stats = await lib.resmon.getStatistics();
    const subscriptions = domain.resmon.subscriptions.values();
    for (const client of subscriptions) {
      client.emit('example/resmon', stats);
    }
  }, domain.resmon.interval);
};
