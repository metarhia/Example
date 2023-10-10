({
  name: 'Chat test',
  options: {},

  async run(t) {
    await t.test('Get room with domain.chat.getRoom', async () => {
      const name = 'example1';
      const room = await domain.chat.getRoom(name);
      node.assert(room);
    });

    await t.test('Send message with domain.chat.send', async () => {
      const result = domain.chat.send('example1', 'Hello there');
      node.assert.strictEqual(result, undefined);
    });
  },
});
