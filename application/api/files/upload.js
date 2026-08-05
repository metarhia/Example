async ({ streamId, name }) => {
  const filePath = `./application/resources/${name}`;
  const readable = context.client.getStream(streamId);
  const writable = node.fs.createWriteStream(filePath);
  readable.pipe(writable);
  return { result: 'Stream initialized' };
};
