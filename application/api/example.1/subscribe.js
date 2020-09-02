async () => {
  setInterval(() => {
    const stats = lib.resmon.getStatistics();
    console.log({ context });
  }, config.resmon.interval);
  return { subscribed: 'resmon' };
};
