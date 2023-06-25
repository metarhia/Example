({
  access: 'public',

  async method({ name }) {
    // Try type: new api.console.content.CustomError('EPARSE');
    const filePath = `/content/${name}.md`;
    const buffer = application.resources.get(filePath);
    if (!buffer) return new Error('Content is not found');
    return { text: buffer.toString() };
  },

  CustomError: class CustomError extends DomainError {},
});
