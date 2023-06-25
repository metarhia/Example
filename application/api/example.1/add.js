({
  parameters: {
    a: 'number',
    b: 'number',
  },

  method: async ({ a, b }) => {
    const { ExampleError } = api.example.error;
    if (typeof a !== 'number') return ExampleError.INVALID_ARG_A();
    if (typeof b !== 'number') return ExampleError.INVALID_ARG_B();
    const result = a + b;
    return result;
  },

  returns: 'number',

  onError(error) {
    const { ExampleError } = api.example.error;
    // in theory there's no need to trigger onError handler
    if (error instanceof ExampleError) return error;
    // handle unexpected, non domain error and return based on error handling logic
    return error;
  },
});
