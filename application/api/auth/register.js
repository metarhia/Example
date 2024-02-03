({
  access: 'public',
  method: async ({ login, password }) => {
    const hash = await metarhia.metautil.hashPassword(password);
    await api.auth.provider.registerUser(login, hash);
    const token = await context.client.startSession();
    return { status: 'success', token };
  },
});
