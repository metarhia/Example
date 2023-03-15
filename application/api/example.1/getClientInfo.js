({
  access: 'public',
  method: async () => {
    const { uuid, session, client } = context;
    const { ip } = client;
    const { token, accountId } = session;
    return { result: { ip, token, accountId, uuid } };
  },
});
