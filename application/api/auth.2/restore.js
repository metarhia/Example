({
  access: 'public',
  method: async ({ token }) => {
    const success = await context.client.restoreSession(token);
    const status = success ? 'logged' : 'not logged';
    return { status };
  },
});
