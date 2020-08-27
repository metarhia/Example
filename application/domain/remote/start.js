(async () => {
  console.log('Connect to metacom');
  const { url } = config.remote;
  const Metacom = npm.metacom;
  const metacom = new Metacom(url);
  domain.remote.metacom = metacom;
  await metacom.load('example');
});
