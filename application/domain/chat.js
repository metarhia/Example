({
  rooms: new Map(),

  getRoom(name) {
    let room = domain.chat.rooms.get(name);
    if (room) return room;
    room = new Set();
    domain.chat.rooms.set(name, room);
    return room;
  },

  send(name, message) {
    const room = domain.chat.getRoom(name);
    for (const client of room) {
      client.emit('chat/message', { room: name, message });
    }
  },
});
