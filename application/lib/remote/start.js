async () => {
  if (application.worker.id === 'W1') {
    console.debug('Connect to metacom');
  }
  const Metacom = metarhia.metacom;
  const metacom = new Metacom(config.remote.url);
  lib.remote.metacom = metacom;
  metacom.socket.on('error', () => {
    if (application.worker.id === 'W1') {
      console.warn(`Can not connect to ${metacom.url}`);
    }
  });
  try {
    await metacom.load('example');
  } catch {
    if (application.worker.id === 'W1') {
      console.warn('Can not load metacom interface: "example"');
    }
  }
};
