({
  access: 'public',
  method: async ({ login, password, fullName }) => {
    const hash = await metarhia.metautil.hashPassword(password);
    await application.auth.registerUser(login, hash, fullName);
    const token = await context.client.startSession();
    return { status: 'success', token };
  },
});
