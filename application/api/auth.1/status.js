({
  access: 'public',
  async method() {
    const status = context.token ? 'logged' : 'not logged';
    return { status };
  }
});
