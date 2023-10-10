({
  name: 'Metacom over HTTP',

  async run(t) {
    const url = 'http://127.0.0.1:8001/api';
    const metacom = metarhia.metacom.Metacom.create(url);
    await metacom.load('auth', 'example');
    await domain.tests.api.cases(t, metacom);
  },
});
