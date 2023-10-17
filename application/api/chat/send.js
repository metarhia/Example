({
  access: 'public',

  method: async ({ room, message }) => {
    domain.chat.send(room, message);
    return true;
  },
});
