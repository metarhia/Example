({
  access: 'public',
  method: async ({ key, value }) => {
    if (typeof key !== 'string') throw new Error('key must be string', 1);
    const { keySize, objSize } = config.sharedMap;
    if (key.length > keySize)
      throw new Error(`key length must be not greater then ${keySize}`, 1);
    const val = JSON.stringify(value);
    if (val.length > objSize)
      throw new Error(`value size to big for initialized SharedMap`, 1);
    lib.sharedMap.storage.set(key, val);
    return { status: 'saved' };
  },
});
