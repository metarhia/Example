({
  async start() {
    console.log('Start example plugin');
    console.log(this.config);
  },

  async stop() {
    console.log('Stop example plugin');
  },

  doSomething() {
    console.log('Call method: example.doSomething');
  },
});
