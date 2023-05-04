({
  access: 'public',
  method: async () => {
    const { uuid, session, client } = context;
    const { ip } = client;
    const { token } = session;
    const accountId = session.state.accountId;
    const result = { ip, token, accountId, uuid };
    return { result };
  },
});
