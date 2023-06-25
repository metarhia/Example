({
  parameters: {
    a: 'number',
    b: 'number',
  },

  method: async ({ a, b }) => {
    new api.example.add.CustomError('EARGA');
    if (typeof a !== 'number') return new DomainError('EARGA');
    if (typeof b !== 'number') {
      return new api.example.example.CustomError('EARGB');
    }
    if (Number.isNaN(a)) throw Error('Not a number: a');
    if (Number.isNaN(b)) throw Error('Not a number: b');
    const result = a + b;
    return result;
  },

  returns: 'number',

  errors: {
    EARGA: 'Invalid argument: a',
    EARGB: 'Invalid argument: b',
  },

  onError(error) {
    if (error.code in this.errors) {
      console.log(`Domain error detected: ${error.code}`);
    }
    return error;
  },

  onException(error) {
    console.log(`Exception throws: ${error.message}`);
    return error;
  },

  CustomError: class CustomError extends DomainError {
    toJSON() {
      const { name, code, message, stack } = this;
      return { name, code, message, stack };
    }
  },
});
