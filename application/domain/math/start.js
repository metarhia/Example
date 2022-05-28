async () => {
  if (application.worker.id === 'W1') {
    setTimeout(async () => {
      const res = await bus.math.eval({
        expr: '2+3*sqrt(4)',
        precision: 3,
      });
      console.log({ math: res });
    }, 1000);
  }
};
