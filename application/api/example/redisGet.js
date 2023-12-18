({
  access: 'public',
  method: async ({ key }) => {
    const result = await db.redis.get(key);
    return { result };
  },
});
