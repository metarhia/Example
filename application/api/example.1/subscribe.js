({
  access: 'public',

  method: async () => {
    const { client } = context;
    domain.resmon.subscribe(client);
    context.client.on('close', () => {
      domain.resmon.unsubscribe(client);
    });
    return { subscribed: 'resmon' };
  },
});
