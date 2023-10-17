async ({ streamId, name }) => {
  const filePath = `./application/resources/${name}`;
  // Get incoming stream by streamId sent from client
  const readable = context.client.getStream(streamId);
  // Create nodejs stream to write file on server
  const writable = node.fs.createWriteStream(filePath);
  // Pipe metacom readable to nodejs writable
  readable.pipe(writable);
  return { result: 'Stream initialized' };
};
