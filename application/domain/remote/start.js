(async () => {
  // Wait for server start
  await new Promise(resolve => setTimeout(resolve, 100));
  console.debug('Connect to metacom');
  const { url } = config.remote;
  const Metacom = metarhia.metacom;
  domain.remote.metacom = new Metacom(url);
  await domain.remote.metacom.load('example');
});
