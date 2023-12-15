({
  name: 'Static server test',

  async run(t) {
    await t.test('Test to serve without cache', async (t) => {
      const filePath = './application/static/demo.txt';
      const url = 'http://127.0.0.1:8000/demo.txt';
      await node.fsp.unlink(filePath).catch(() => null);
      t.after(() => {
        node.fsp.unlink(filePath);
      });
      const data = node.crypto.randomBytes(1024 * 1024);
      await node.fsp.writeFile(filePath, data);
      const response = await fetch(url);
      const msg = `status: ${response.status} expected: 200`;
      node.assert.strictEqual(response.status, 200, msg);
    });

    const tasks = [
      { url: '/', size: 2099 },
      { url: '/console.js', size: 14360 },
      { url: '/unknown', status: 404, size: 113 },
      { url: '/unknown.png', status: 404, size: 113 },
      { url: '/unknown/unknown', status: 404 },
      { url: '/unknown/unknown.png', status: 404 },
      { url: '/article', size: 141 },
      { url: '/article/file.txt', size: 28 },
      { url: '/article/name', size: 141 },
    ];

    for (const task of tasks) {
      const url = `http://127.0.0.1:8000${task.url}`;
      await t.test(`Get static resource: ${url}`, async () => {
        const response = await fetch(url);
        const { status = 200, size } = task;
        const msg = `status: ${response.status} expected: ${status}`;
        node.assert.strictEqual(response.status, status, msg);
        if (size) {
          const data = await response.blob();
          const msg = `size: ${data.size} expected: ${size}`;
          node.assert.strictEqual(data.size, size, msg);
        }
      });
    }
  },
});
