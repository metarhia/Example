({
  access: 'public',
  method: async ({ key }) => {
    if (typeof key !== 'string') throw new Error('key must be string', 1);
    const { keySize } = config.sharedMap;
    if (key.length > keySize)
      throw new Error(`key length must be not greater then ${keySize}`, 1);
    if (!lib.sharedMap.storage.has(key)) return { value: undefined };
    const value = JSON.parse(lib.sharedMap.storage.get(key));
    return { value };
  },
});
