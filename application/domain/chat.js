({
  rooms: new Map(),

  getRoom(name) {
    const existing = domain.chat.rooms.get(name);
    if (existing) return existing;
    const room = new Set();
    domain.chat.rooms.set(name, room);
    return room;
  },

  dropRoom(name) {
    domain.chat.rooms.delete(name);
  },

  send(name, message) {
    const room = domain.chat.rooms.get(name);
    if (!room) throw new Error(`Room ${name} is not found`);
    for (const client of room) {
      client.emit('chat/message', { room: name, message });
    }
  },
});
