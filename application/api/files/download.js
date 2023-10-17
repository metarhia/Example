async ({ name, type }) => {
  const filePath = `./application/resources/${name}`;
  // Create nodejs readable stream to read a file
  const readable = node.fs.createReadStream(filePath);
  // Get file size
  const { size } = await node.fsp.stat(filePath);
  // Create metacom writable stream
  const writable = context.client.createStream(name, size);
  // Pipe nodejs readable to metacom writable
  readable.pipe(writable);
  return { streamId: writable.streamId, type };
};
