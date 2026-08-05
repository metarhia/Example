async () => {
  if (!config.examples.scheduler) return;
  if (application.worker.id !== 'W1') return;
  const task = {
    name: 'name',
    every: 'Oct 19th 10s',
    args: { i: 2 },
    run: 'lib.task1.f1',
  };
  const res = await application.scheduler.add(task);
  console.log('Add task', res);
};
