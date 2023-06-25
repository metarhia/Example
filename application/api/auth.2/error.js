({
  AuthError: class AuthError extends DomainError {
    static ALREADY_EXISTS() {
      return new AuthError(409, { message: 'User already exists' });
    }
    static INVALID_CREDENTIALS() {
      return new AuthError(400, { message: 'Incorrect logic or password' });
    }
  },
  onError(error) {
    const { AuthError } = api.auth.error;
    if (error instanceof AuthError) return error;
    // handle unexpected, non domain error and return based on error handling logic
    return error;
  },
});
