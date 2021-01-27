async ({ key }) => {
  const result = await lib.redis.get(key);
  return { result };
};
