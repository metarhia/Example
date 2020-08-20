(async () => {
  setInterval(() => {
    const stats = lib.resmon.getStatistics();
    const { heapTotal, heapUsed, external, contexts, detached } = stats;
    const total = lib.utils.bytesToSize(heapTotal);
    const used = lib.utils.bytesToSize(heapUsed);
    const ext = lib.utils.bytesToSize(external);
    console.log(`Heap: ${used} of ${total}, ext: ${ext}`);
    console.log(`Contexts: ${contexts}, detached: ${detached}`);
  }, lib.resmon.config.interval);
});
