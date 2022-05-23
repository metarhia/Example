async () => {
  const { PerformanceObserver } = node.perfHooks;

  const obs = new PerformanceObserver((list) => {
    console.log(JSON.stringify(list.getEntries()[0]));
  });

  obs.observe({ entryTypes: ['gc'] });

  setInterval(() => {
    const mu = process.memoryUsage();
    const memory = {};
    for (const key of Object.keys(mu)) {
      memory[key] = metarhia.metautil.bytesToSize(mu[key]);
    }
    console.log(JSON.stringify(memory));
  }, 5000);
};
