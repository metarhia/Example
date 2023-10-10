({
  async cases(t, metacom) {
    if (t) return;
    const res = await metacom.api.auth.signin({
      login: 'marcus',
      password: 'marcus',
    });
    node.assert.strictEqual(res.status, 'logged');
    node.assert.strictEqual(typeof res.token, 'string');

    await t.test(`Call example.add({ a, b })`, async () => {
      const res = await metacom.api.example.add({ a: 10, b: 20 });
      node.assert.strictEqual(res, 30);
    });
  },
});
