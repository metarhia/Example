({
  router({ method, args }) {
    console.log({ method, args });
    if (method === 'favicon') {
      context.client.redirect('http://127.0.0.1/favicon.png');
    }
    const result = {};
    return result;
  },
});
