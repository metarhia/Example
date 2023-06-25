({
  access: 'public',
  method: async ({ login, password }) => {
    const { AuthError } = api.auth.error;
    const user = await api.auth.provider.getUser(login);
    if (!user) return AuthError.INVALID_CREDENTIALS();
    const { accountId, password: hash } = user;
    const valid = await metarhia.metautil.validatePassword(password, hash);
    if (!valid) return AuthError.INVALID_CREDENTIALS();
    console.log(`Logged user: ${login}`);
    const token = api.auth.provider.generateToken();
    const data = { accountId: user.accountId };
    context.client.startSession(token, data);
    const { ip } = context.client;
    await api.auth.provider.createSession(token, data, { ip, accountId });
    return { status: 'logged', token };
  },
});
