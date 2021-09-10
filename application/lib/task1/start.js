async () => {
  if (application.worker.id === 'W1') {
    setTimeout(async () => {
      const res = await application.scheduler.add({
        name: 'name',
        every: 'Sep 10th 10s',
        args: { i: 2 },
        run: 'lib.task1.f1',
      });
      console.log('Add task', res);
    }, 1000);
  }
};
