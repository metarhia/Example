({
  access: 'public',

  parameters: {
    a: 'number',
    b: 'number',
  },

  method: async ({ a, b }) => {
    if (a < 0) return new DomainError('EARGA');
    if (b > 500) return new DomainError('EARGB');
    if (Number.isNaN(a)) throw Error('Not a number: a');
    if (Number.isNaN(b)) throw Error('Not a number: b');
    const result = a + b;
    return result;
  },

  returns: 'number',

  errors: {
    EARGA: 'Invalid argument: "a" expected to be > 0',
    EARGB: 'Invalid argument: "b" expected to be < 500',
  },
});
