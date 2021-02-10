async () => {
  if (application.worker.id === 'W1') {
    console.log('Connect to redis');
  }
  const client = npm.redis.createClient();
  lib.redis.client = client;
  client.on('error', () => {
    if (application.worker.id === 'W1') {
      console.log('No redis service detected, so quit client');
    }
    client.quit();
  });
};
