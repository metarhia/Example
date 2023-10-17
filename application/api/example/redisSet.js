({
  access: 'public',
  method: async ({ key, value }) => {
    const result = await lib.redis.set(key, value);
    return { result };
  },
});
