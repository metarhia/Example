({
  access: 'public',

  method: async ({ room }) => {
    const clients = domain.chat.rooms.get(room);
    if (!clients) throw new Error(`Room ${room} is not found`);
    clients.delete(context.client);
    if (clients.size === 0) domain.chat.dropRoom(room);
    return true;
  },
});
