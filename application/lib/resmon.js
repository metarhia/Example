({
  async start() {
    const { interval } = this.config;
    setInterval(() => {
      const stats = lib.resmon.getStatistics();
      const { heapTotal, heapUsed, external, contexts, detached } = stats;
      const total = lib.utils.bytesToSize(heapTotal);
      const used = lib.utils.bytesToSize(heapUsed);
      const ext = lib.utils.bytesToSize(external);
      console.log(`Heap: ${used} of ${total}, ext: ${ext}`);
      console.log(`Contexts: ${contexts}, detached: ${detached}`);
    }, interval);
  },

  getStatistics() {
    const { heapTotal, heapUsed, external } = api.process.memoryUsage();
    const hs = api.v8.getHeapStatistics();
    const contexts = hs.number_of_native_contexts;
    const detached = hs.number_of_detached_contexts;
    return { heapTotal, heapUsed, external, contexts, detached };
  }
});
