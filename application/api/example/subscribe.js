({
  access: 'public',

  method: async () => {
    setInterval(async () => {
      const stats = await lib.resmon.getStatistics();
      context.client.emit('example/resmon', stats);
    }, config.resmon.interval);
    return { subscribed: 'resmon' };
  },
});
