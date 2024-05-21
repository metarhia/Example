async () => {
  if (application.worker.id === 'W1') {
    console.debug('Connect to redis');
  }
  const client = npm.redis.createClient(config.redis);
  db.redis.client = client;
  client.on('error', async (error) => {
    if (application.worker.id === 'W1') {
      console.warn('No redis service detected, so quit client');
      const err = new Error('No redis', { cause: error });
      console.error(err);
      await client.disconnect();
    }
  });
  await client.connect();
};
