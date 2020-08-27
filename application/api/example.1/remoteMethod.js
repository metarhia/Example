({
  access: 'public',
  method: async ({ ...args }) => {
    console.log({ remoteMethod: args });
    return { result: 'success' };
  }
});
