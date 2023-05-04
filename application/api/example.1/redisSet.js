({
  access: 'public',
  method: async ({ key, value }) => {
    const result = await db.redis.set(key, value);
    return { result };
  },
});
