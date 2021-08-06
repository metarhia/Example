({
  access: 'public',
  method: async () => {
    const ip = context.client.ip;
    const { token, accountId } = context;
    return { result: { ip, token, accountId } };
  },
});
