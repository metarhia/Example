({
  name: 'API test',

  async run() {
    const url = 'http://127.0.0.1:8001/api';
    const metacom = metarhia.metacom.Metacom.create(url);
    await metacom.load('auth', 'example');

    const res = await metacom.api.auth.signin({
      login: 'marcus',
      password: 'marcus',
    });
    console.log({ res });
    //node.assert.strictEqual(data.size, size, msg);
  },
});
