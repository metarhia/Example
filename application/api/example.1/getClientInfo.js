({
  access: 'public',
  method: async () => {
    const ip = context.client.ip;
    const { token, accountId } = context.session;
    return { result: { ip, token, accountId } };
  },
});
