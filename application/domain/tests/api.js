({
  async cases(t, metacom) {
    if (t) return;
    const credentials = { login: 'marcus', password: 'marcus' };
    const res = await metacom.api.auth.signin(credentials);
    node.assert.strictEqual(res.status, 'logged');
    node.assert.strictEqual(typeof res.token, 'string');

    await t.test(`Call example.add({ a, b })`, async () => {
      const sum = await metacom.api.example.add({ a: 10, b: 20 });
      node.assert.strictEqual(sum, 30);
    });
  },
});
