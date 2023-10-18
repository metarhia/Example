async () => {
  if (!config.examples.cache) return;
  if (application.worker.id !== 'W1') return;
  console.debug('Start example');
  lib.example.cache.set({ key: 'keyName', val: 123 });
  const res = lib.example.cache.get({ key: 'keyName' });
  console.debug({ res, cache: lib.example.cache.values });
};
