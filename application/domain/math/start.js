async () => {
  if (!config.examples.bus) return;
  if (application.worker.id !== 'W1') return;
  setTimeout(async () => {
    const res = await bus.math
      .eval({
        expr: '2+3*sqrt(4)',
        precision: 3,
      })
      .catch(() => 'Can not access math server');
    console.log({ math: res });
  }, 1000);
};
