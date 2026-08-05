({
  values: new Map(),

  set({ key, val }) {
    console.debug({ set: { key, val } });
    return this.values.set(key, val);
  },

  get({ key }) {
    const value = this.values.get(key);
    console.debug({ get: key, return: value });
    return value;
  },
});
