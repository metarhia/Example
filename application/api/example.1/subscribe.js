({
  access: 'public',

  method: async ({ test = false }) => {
    if (test) {
      setTimeout(async () => {
        const stats = await lib.resmon.getStatistics();
        context.client.emit('example/resmon', stats);
      }, 500);
    }
    setInterval(async () => {
      const stats = await lib.resmon.getStatistics();
      context.client.emit('example/resmon', stats);
    }, config.resmon.interval);
    return { subscribed: 'resmon' };
  },
});
