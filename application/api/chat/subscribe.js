({
  access: 'public',

  method: async ({ room }) => {
    const clients = domain.chat.getRoom(room);
    clients.add(context.client);
    context.client.on('close', () => {
      clients.delete(context.client);
      if (clients.size === 0) domain.chat.dropRoom(room);
    });
    return true;
  },
});
