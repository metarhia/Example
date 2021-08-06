({
  access: 'public',
  method: async ({ token }) => {
    const restored = context.client.restoreSession(token);
    if (restored) return { status: 'logged' };
    const data = await api.auth.provider.restoreSession(token);
    if (!data) return { status: 'not logged' };
    context.client.startSession(token, data);
    return { status: 'logged' };
  },
});
