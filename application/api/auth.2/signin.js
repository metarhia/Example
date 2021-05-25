({
  access: 'public',
  method: async ({ login, password }) => {
    const user = await api.auth.provider.getUser(login);
    const hash = user ? user.password : undefined;
    const valid = await metarhia.metautil.validatePassword(password, hash);
    if (!user || !valid) throw new Error('Incorrect login or password');
    console.log(`Logged user: ${login}`);
    const token = await context.client.startSession(user.accountId);
    return { status: 'logged', token };
  },
});
