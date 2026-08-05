async () => {
  const isPrimary = application.worker.id === 'W1';
  if (isPrimary) {
    console.debug('Connect to redis');
  }
  const client = npm.redis.createClient(config.redis);
  db.redis.client = client;
  client.on('error', async (error) => {
    if (!isPrimary) return;
    console.warn('No redis service detected, so quit client');
    const err = new Error('No redis', { cause: error });
    console.error(err);
    await client.disconnect();
  });
  await client.connect();
};
