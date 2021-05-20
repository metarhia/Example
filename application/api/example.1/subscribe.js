async () => {
  const isTimerExists = lib.example.timersStore({ key: 'subscribeTimer' });
  if (isTimerExists) { clearInterval(isTimerExists); };

  const subscribeTimer = setInterval(() => {
    const stats = lib.resmon.getStatistics();
    try { context.client.emit('example/resmon', stats); }
    catch (e) { clearInterval(subscribeTimer) };
  }, config.resmon.interval);

  lib.example.timersStore({ key: 'subscribeTimer', val: subscribeTimer });
  return { subscribed: 'resmon' };
};
