({
  access: 'public',
  method: async ({ ...args }) => {
    console.log({ webHook: args });
    return { result: 'success' };
  }
});
