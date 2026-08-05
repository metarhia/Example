({
  access: 'public',

  async method({ name }) {
    const filePath = `/content/${name}.md`;
    const file = application.resources.get(filePath);
    if (!file) return new Error('Content is not found');
    return { text: file.data.toString() };
  },

  CustomError: class CustomError extends Error {},
});
