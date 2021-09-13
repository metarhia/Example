async ({ room, message }) => {
  domain.chat.send(room, message);
  return 'ok';
};
