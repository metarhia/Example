({
  access: 'public',
  method: async () => {
    const { uuid, session, client } = context;
    const { ip } = client;
    const { token, accountId } = session;
    const result = { ip, token, accountId, uuid };
    return { result };
  },
});
