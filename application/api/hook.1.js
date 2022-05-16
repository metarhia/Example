({
  router({ method, args, verb, headers }) {
    const ip = context.client.ip;
    console.log({ method, args, ip, verb, headers });
    return {};
  },
});
