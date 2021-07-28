async () => {
  if (application.worker.id === 'W1') {
    setTimeout(() => {
      console.debug('Add task');
      application.scheduler.add({
        name: 'name',
        every: 'Jul 28th 10s',
        args: { i: 2 },
        run: 'lib.task1.f1',
      });
    }, 2000);
  }
};
