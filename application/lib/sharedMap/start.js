async () => {
  if (process.env.MODE === 'test') return;
  const workerId = application.worker.id;
  const serverWorkers = [];
  const serviceWorkers = [];
  const balancer = config.server.balancer ? 1 : 0;
  const amountServerPorts = config.server.ports.length;
  for (let i = 0; i < amountServerPorts; ++i) {
    serverWorkers.push(`W${i + balancer + 1}`);
  }
  for (let i = 0; i < config.server.workers.pool; ++i) {
    serviceWorkers.push(`W${i + balancer + 1 + amountServerPorts}`);
  }

  if (workerId === 'W1') {
    const ShardMap = npm.sharedmap;
    const { maxSize, keySize, objSize } = config.sharedMap;
    lib.sharedMap.storage = new ShardMap(maxSize, keySize, objSize);
    console.log('start');

    const prom = [];
    for (let i = 0; i < config.server.workers.pool; ++i) {
      prom.push(
        application.invoke({
          method: 'lib.sharedMap.sync',
          args: { command: 'init', args: { map: lib.sharedMap.storage } },
          exclusive: true,
        }),
      );
    }
    const res = await Promise.all(prom);
    console.log('Invoke sharedMap', res);
    return;
  }

  if (serviceWorkers.includes(workerId)) {
    console.info(`service worker: ${workerId}`);
    return;
  }

  console.info({ worker: workerId });
  await metarhia.metautil.delay(200);
  try {
    const { map } = await application.invoke({
      method: 'lib.sharedMap.sync',
      args: { command: 'get' },
      exclusive: false,
    });
    if (map) {
      Object.setPrototypeOf(map, npm.sharedmap.prototype);
      lib.sharedMap.storage = map;
    }
  } catch (err) {
    console.warn(err);
  }
  console.log(`END ${workerId}`);
};
