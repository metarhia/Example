async () => {
  if (application.worker.id === 'W1') {
    /* Uncomment to run in local dev environment
    setTimeout(async () => {
      const url = 'http://127.0.0.1:8001/api';
      const metacom = metarhia.metacom.Metacom.create(url);
      setTimeout(async () => {
        await metacom.load('auth', 'console', 'example', 'files');
        const res = await metacom.api.auth.signin({
          login: 'marcus',
          password: 'marcus',
        });
        console.log({ res });
      }, 1000);
    }, 2000);
    */
  }
};
