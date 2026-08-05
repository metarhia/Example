async ({ name, data }) => {
  const buffer = Buffer.from(data, 'base64');
  const tmpPath = 'application/tmp';
  const filePath = node.path.join(tmpPath, name);
  const isInsideTmp = filePath.startsWith(tmpPath);
  if (isInsideTmp) {
    await node.fsp.writeFile(filePath, buffer);
  }
  return { uploaded: data.length };
};
