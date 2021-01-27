({
  access: 'public',
  async method({ name }) {
    const filePath = `/content/${name}.md`;
    const buffer = application.resources.get(filePath);
    if (!buffer) return new Error('Content is not found');
    return { text: buffer.toString() };
  },
});
