async () => {
  const { heapTotal, heapUsed, external } = process.memoryUsage();
  const heapStats = node.v8.getHeapStatistics();
  const contexts = heapStats.number_of_native_contexts;
  const detached = heapStats.number_of_detached_contexts;
  return { heapTotal, heapUsed, external, contexts, detached };
};
