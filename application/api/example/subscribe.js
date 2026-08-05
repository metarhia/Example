({
  access: 'public',

  method: async () => {
    const { interval } = config.resmon;
    setInterval(async () => {
      const stats = await lib.resmon.getStatistics();
      context.client.emit('example/resmon', stats);
    }, interval);
    return { subscribed: 'resmon' };
  },
});
