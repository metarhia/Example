async () => {
  console.log('Connect to redis');
  lib.redis.client = npm.redis.createClient();
};
