({
  access: 'public',
  method: async ({ name }) => {
    let data = {};
    // if (name === 'application') data = application;
    if (name === 'client') data = context.client;
    if (name === 'context') data = context;
    if (name === 'api') data = api;
    if (name === 'db') data = db;
    if (name === 'config') data = config;
    if (name === 'metarhia') data = metarhia;
    console.log({ data });
    return { status: 'success ', data };
  },
});
