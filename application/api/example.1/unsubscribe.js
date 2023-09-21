({
  access: 'public',

  method: async () => {
    const { client } = context;
    domain.resmon.unsubscribe(client);
    return { unsubscribed: 'resmon' };
  },
});
