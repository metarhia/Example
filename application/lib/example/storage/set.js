({
  values: new Map(),

  method({ key, val, del }) {
    console.log({ key, val });
    if (del) {
      return this.values.has(del) ? this.values.delete(del) : false;
    }
    if (val) {
      return this.values.set(key, val);
    }
    const res = this.values.get(key);
    console.log({ return: { res } });
    return res;
  },
});
