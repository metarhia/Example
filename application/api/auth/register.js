({
  access: 'public',
  method: async ({ login, email, password, fullName, avatar = '' }) => {
    try {
      const hash = await metarhia.metautil.hashPassword(password);
      await api.auth.provider.registerUser(
        login,
        email,
        hash,
        fullName,
        avatar,
      );
      const token = await context.client.startSession();
      return { status: 'success', token };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        status: 'failed',
        error: error.message || 'Registration failed',
      };
    }
  },
});
