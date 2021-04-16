({
  access: 'public',
  method: async () => {
    const ip = context.client.ip;
    return { result: ip };
  },
});
