async () => {
  if (application.worker.id === 'W1') {
    console.debug('Start example plugin');
    lib.example.cache.set({ key: 'keyName', val: this.privateField });
    const res = lib.example.cache.get({ key: 'keyName' });
    console.debug({ res, cache: lib.example.cache.values });
  }
};
