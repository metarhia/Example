async ({ room }) => {
  const clients = domain.chat.getRoom(room);
  clients.add(context.client);
  context.client.on('close', () => {
    clients.delete(context.client);
  });
  return 'ok';
};
