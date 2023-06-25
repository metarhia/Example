({
  ExampleError: class ExampleError extends DomainError {
    static INVALID_ARG_A() {
      return new ExampleError(400, { message: 'Invalid argument: a' });
    }
    static INVALID_ARG_B() {
      return new ExampleError(400, { message: 'Invalid argument: b' });
    }
    static MISSING_COUNTRY_ID() {
      return new ExampleError(400, { message: 'Missing country id' });
    }
  },
});
