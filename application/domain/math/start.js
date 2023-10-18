async () => {
  if (!config.examples.bus) return;
  if (application.worker.id !== 'W1') return;
  try {
    const res = await bus.math.eval({
      expr: '2+3*sqrt(4)',
      precision: 3,
    });
    console.log({ math: res });
  } catch {
    console.log('Can not access math server');
  }
};
