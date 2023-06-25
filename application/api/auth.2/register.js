({
  access: 'public',
  method: async ({ login, password, fullName }) => {
    const { AuthError } = api.auth.error;
    const hash = await metarhia.metautil.hashPassword(password);
    const created = await api.auth.provider.registerUser(login, hash, fullName);
    if (!created) return AuthError.ALREADY_EXISTS();
    const token = await context.client.startSession();
    return { status: 'success', token };
  },
});
